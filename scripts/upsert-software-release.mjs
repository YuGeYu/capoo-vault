import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS software_releases (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'prod',
  version TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL DEFAULT '',
  items_json TEXT NOT NULL DEFAULT '[]',
  download_type TEXT NOT NULL DEFAULT 'quark',
  download_label TEXT NOT NULL DEFAULT '打开夸克网盘',
  download_url TEXT NOT NULL,
  download_code TEXT NOT NULL DEFAULT '',
  severity TEXT NOT NULL DEFAULT 'recommended' CHECK (severity IN ('normal', 'recommended', 'critical')),
  is_active INTEGER NOT NULL DEFAULT 1,
  published_at TEXT NOT NULL,
  created_by_user_id TEXT,
  updated_by_user_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(project_id, channel, version)
);

CREATE INDEX IF NOT EXISTS idx_software_releases_lookup
  ON software_releases(project_id, channel, is_active, published_at);
`;

const args = process.argv.slice(2);
const options = {
  project: 'cs2-bot-improver',
  channel: 'prod',
  severity: 'recommended',
  title: '',
  summary: '',
  code: '',
  label: '打开夸克网盘',
  active: true,
  remote: false,
  dryRun: false,
  items: [],
};

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];
  const next = () => {
    index += 1;
    return args[index] ?? '';
  };

  if (arg === '--help' || arg === '-h') {
    printHelp();
    process.exit(0);
  } else if (arg === '--project') {
    options.project = next();
  } else if (arg === '--channel') {
    options.channel = next();
  } else if (arg === '--version') {
    options.version = next();
  } else if (arg === '--url') {
    options.url = next();
  } else if (arg === '--code') {
    options.code = next();
  } else if (arg === '--title') {
    options.title = next();
  } else if (arg === '--summary') {
    options.summary = next();
  } else if (arg === '--severity') {
    options.severity = next();
  } else if (arg === '--label') {
    options.label = next();
  } else if (arg === '--item') {
    options.items.push(next());
  } else if (arg === '--items-file') {
    const raw = await readFile(next(), 'utf8');
    options.items.push(...raw.split(/\r?\n/).map(line => line.trim()).filter(Boolean));
  } else if (arg === '--inactive') {
    options.active = false;
  } else if (arg === '--remote') {
    options.remote = true;
  } else if (arg === '--local') {
    options.remote = false;
  } else if (arg === '--dry-run') {
    options.dryRun = true;
  } else {
    throw new Error(`Unknown argument: ${arg}`);
  }
}

if (!options.version || !/^\d+(?:\.\d+){0,3}(?:[-+][a-z0-9.-]+)?$/i.test(options.version.replace(/^v/i, ''))) {
  throw new Error('Missing or invalid --version. Example: --version 0.3.8');
}

if (!options.url || !/^https?:\/\//i.test(options.url)) {
  throw new Error('Missing or invalid --url. A Quark share URL is required for every release.');
}

if (!['prod', 'test', 'dev'].includes(options.channel)) {
  throw new Error('--channel must be prod, test, or dev.');
}

if (!['normal', 'recommended', 'critical'].includes(options.severity)) {
  throw new Error('--severity must be normal, recommended, or critical.');
}

const now = new Date().toISOString();
const version = options.version.replace(/^v/i, '');
const title = options.title || `v${version} 更新`;
const releaseId = `release_${options.project}_${options.channel}_${version}`.replace(/[^a-z0-9_]/gi, '_');
const sql = `
${SCHEMA_SQL}

INSERT INTO software_releases (
  id, project_id, channel, version, title, summary, items_json,
  download_type, download_label, download_url, download_code,
  severity, is_active, published_at,
  created_by_user_id, updated_by_user_id, created_at, updated_at
)
VALUES (
  ${sqlString(releaseId)},
  ${sqlString(options.project)},
  ${sqlString(options.channel)},
  ${sqlString(version)},
  ${sqlString(title)},
  ${sqlString(options.summary)},
  ${sqlString(JSON.stringify(options.items))},
  'quark',
  ${sqlString(options.label)},
  ${sqlString(options.url)},
  ${sqlString(options.code)},
  ${sqlString(options.severity)},
  ${options.active ? 1 : 0},
  ${sqlString(now)},
  NULL,
  NULL,
  ${sqlString(now)},
  ${sqlString(now)}
)
ON CONFLICT(project_id, channel, version) DO UPDATE SET
  title = excluded.title,
  summary = excluded.summary,
  items_json = excluded.items_json,
  download_type = excluded.download_type,
  download_label = excluded.download_label,
  download_url = excluded.download_url,
  download_code = excluded.download_code,
  severity = excluded.severity,
  is_active = excluded.is_active,
  published_at = excluded.published_at,
  updated_at = excluded.updated_at;
`;

if (options.dryRun) {
  console.log(sql);
  process.exit(0);
}

const tempDir = await mkdtemp(join(tmpdir(), 'mmc-software-release-'));
const sqlFile = join(tempDir, 'upsert-software-release.sql');

try {
  await writeFile(sqlFile, sql, 'utf8');
  const command = process.execPath;
  const wranglerEntry = join(process.cwd(), 'node_modules', 'wrangler', 'bin', 'wrangler.js');
  const wranglerArgs = ['d1', 'execute', 'MMC_DB', options.remote ? '--remote' : '--local', `--file=${sqlFile}`];
  if (options.remote) {
    wranglerArgs.push('-c', 'wrangler.production.toml');
  }
  const result = spawnSync(
    command,
    [wranglerEntry, ...wranglerArgs],
    { cwd: process.cwd(), stdio: 'inherit' }
  );
  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
  console.log(`software release saved: ${options.project}/${options.channel} v${version}`);
} finally {
  await rm(tempDir, { recursive: true, force: true });
}

function sqlString(value) {
  return `'${String(value ?? '').replaceAll("'", "''")}'`;
}

function printHelp() {
  console.log(`
Usage:
  npm run software-release:upsert -- --version 0.3.8 --url https://pan.quark.cn/s/xxx --remote

Required:
  --version <version>   Release version, for example 0.3.8
  --url <url>           Quark share URL

Optional:
  --project <id>        Default: cs2-bot-improver
  --channel <name>      prod, test, or dev. Default: prod
  --severity <level>    normal, recommended, or critical. Default: recommended
  --title <text>        Default: v<version> 更新
  --summary <text>
  --item <text>         Repeatable release-note item
  --items-file <path>   One release-note item per line
  --code <text>         Quark extraction code, if any
  --inactive
  --remote             Write remote D1 instead of local D1
  --dry-run            Print SQL only
`);
}
