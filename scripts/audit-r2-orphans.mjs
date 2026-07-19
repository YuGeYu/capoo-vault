import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import crypto from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const PROTECTED = new Set(['downloads/android/latest.apk', 'downloads/android/latest.json']);
const cutoffDays = 30;

const args = parseArgs(process.argv.slice(2));
const origin = args.origin || process.env.SITE_ORIGIN;
const token = args['import-token'] || process.env.IMPORT_TOKEN;
if (!origin || !token) throw new Error('需要 --origin 与 --import-token。');
const outDir = path.resolve(args.out || `artifacts/${new Date().toISOString().slice(0, 10)}-r2-orphans`);
await fs.mkdir(outDir, { recursive: true });
const auditRunId = crypto.randomUUID();
const inventory = [];
let cursor = '';
const rawPath = path.join(outDir, 'r2-inventory.jsonl');
await fs.writeFile(rawPath, '');
do {
  const url = new URL('/api/admin/import/r2-inventory', origin);
  url.searchParams.set('limit', '1000');
  if (cursor) url.searchParams.set('cursor', cursor);
  const response = await fetch(url, { headers: { 'x-import-token': token } });
  if (!response.ok) throw new Error(`inventory failed: ${response.status} ${await response.text()}`);
  const page = await response.json();
  await fs.appendFile(rawPath, `${JSON.stringify(page)}\n`);
  inventory.push(...(page.objects || []));
  cursor = page.truncated ? page.cursor : '';
} while (cursor);

const d1Rows = await queryD1('SELECT r2_key, size_bytes FROM assets WHERE r2_key IS NOT NULL');
const refs = new Map(d1Rows.map(row => [row.r2_key, Number(row.size_bytes || 0)]));
const referencedObjects = inventory.filter(object => refs.has(object.key));
const groups = new Map();
for (const object of referencedObjects) {
  const key = `${normalizeEtag(object.etag)}:${Number(object.size || 0)}`;
  if (object.etag && refs.get(object.key) === Number(object.size || 0) && !groups.has(key)) groups.set(key, object);
}
const protectedObjects = inventory.filter(object => PROTECTED.has(object.key) || object.key.startsWith('downloads/android/'));
const now = Date.now();
const candidates = [];
for (const object of inventory) {
  const uploaded = new Date(object.uploaded || 0);
  const duplicate = object.etag ? groups.get(`${normalizeEtag(object.etag)}:${Number(object.size || 0)}`) : null;
  const reasons = [];
  if (!refs.has(object.key)) reasons.push('not_referenced');
  if (object.key.startsWith('published/')) reasons.push('published_prefix');
  if (now - uploaded.getTime() >= cutoffDays * 86400000) reasons.push('older_than_30d');
  if (duplicate && duplicate.key !== object.key) reasons.push('etag_size_duplicate');
  if (reasons.length === 4 && !protectedObjects.some(item => item.key === object.key)) {
    candidates.push({ key: object.key, size: Number(object.size || 0), etag: normalizeEtag(object.etag), uploaded: object.uploaded, duplicateOf: duplicate.key, duplicateEvidence: { etag: normalizeEtag(duplicate.etag), size: Number(duplicate.size || 0), d1Referenced: true }, reason: reasons, auditRunId });
  }
}
const manifest = { auditRunId, generatedAt: new Date().toISOString(), cutoffDays, candidates, protected: protectedObjects, inventoryCount: inventory.length, d1ReferenceCount: refs.size };
const manifestPath = path.join(outDir, 'r2-orphans.json');
await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
const csv = ['key,size,etag,uploaded,duplicateOf,reason', ...candidates.map(item => [item.key, item.size, item.etag, item.uploaded, item.duplicateOf, item.reason.join('|')].map(csvEscape).join(','))].join('\n') + '\n';
await fs.writeFile(path.join(outDir, 'r2-orphans.csv'), csv);
const summary = { generatedAt: manifest.generatedAt, auditRunId, objectCount: inventory.length, totalBytes: inventory.reduce((sum, item) => sum + Number(item.size || 0), 0), d1ReferenceCount: refs.size, candidateCount: candidates.length, candidateBytes: candidates.reduce((sum, item) => sum + item.size, 0), protectedCount: protectedObjects.length, protectedBytes: protectedObjects.reduce((sum, item) => sum + Number(item.size || 0), 0), errors: [] };
await fs.writeFile(path.join(outDir, 'audit-summary.json'), JSON.stringify(summary, null, 2));
const files = ['r2-orphans.json', 'r2-orphans.csv', 'r2-inventory.jsonl', 'audit-summary.json'];
const hashes = Object.fromEntries(await Promise.all(files.map(async file => [file, await sha256File(path.join(outDir, file))])));
await fs.writeFile(path.join(outDir, 'manifest.sha256'), `${hashes['r2-orphans.json']}  r2-orphans.json\n${hashes['r2-orphans.csv']}  r2-orphans.csv\n${hashes['r2-inventory.jsonl']}  r2-inventory.jsonl\n${hashes['audit-summary.json']}  audit-summary.json\n`);
console.log(JSON.stringify({ ...summary, manifestSha256: hashes['r2-orphans.json'], outDir }, null, 2));

function parseArgs(values) { const result = {}; for (let i = 0; i < values.length; i += 1) { if (values[i].startsWith('--')) result[values[i].slice(2)] = values[i + 1]?.startsWith('--') ? true : values[++i]; } return result; }
function normalizeEtag(value) { return String(value || '').replace(/^"|"$/g, '').toLowerCase(); }
function csvEscape(value) { return `"${String(value ?? '').replaceAll('"', '""')}"`; }
async function sha256File(file) { const hash = crypto.createHash('sha256'); hash.update(await fs.readFile(file)); return hash.digest('hex'); }
async function queryD1(sql) {
  let stdout;
  if (process.platform === 'win32') {
    const escaped = sql.replaceAll("'", "''");
    const command = `& npx wrangler d1 execute MMC_DB --remote -c wrangler.production.toml --json --command '${escaped}'`;
    ({ stdout } = await execFileAsync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', command], { maxBuffer: 20 * 1024 * 1024 }));
  } else {
    ({ stdout } = await execFileAsync('npx', ['wrangler', 'd1', 'execute', 'MMC_DB', '--remote', '-c', 'wrangler.production.toml', '--json', `--command=${sql}`], { maxBuffer: 20 * 1024 * 1024 }));
  }
  const match = stdout.match(/\[\s*\{[\s\S]*\}\s*\]\s*$/);
  if (!match) throw new Error(`无法解析 D1 JSON: ${stdout}`);
  const parsed = JSON.parse(match[0]);
  return parsed.flatMap(item => item.results || []);
}
