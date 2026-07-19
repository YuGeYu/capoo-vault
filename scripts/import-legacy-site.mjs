import { randomBytes } from 'node:crypto';
import { promises as fs } from 'node:fs';
import { createReadStream as fsSyncCreateReadStream } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawn } from 'node:child_process';
import { Agent } from 'undici';

const EXCLUDE_DIRS = new Set([
  '.git',
  '__pycache__',
  'node_modules',
  'venv',
  'env',
  '.vscode',
  '.idea',
  'dist',
  'build',
  '_dedupe_trash',
  'site-assets',
  '.wrangler'
]);

const MEDIA_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.mp4', '.webm', '.mov', '.m4v']);

const MIME_TYPES = new Map([
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.png', 'image/png'],
  ['.gif', 'image/gif'],
  ['.bmp', 'image/bmp'],
  ['.webp', 'image/webp'],
  ['.mp4', 'video/mp4'],
  ['.webm', 'video/webm'],
  ['.mov', 'video/quicktime'],
  ['.m4v', 'video/x-m4v']
]);

const httpAgent = new Agent({
  connect: {
    timeout: 60000
  }
});

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (!options.source) throw new Error('请通过 --source 指定旧站目录。');
  if (!options.ownerUsername && !options.ownerId) throw new Error('请通过 --owner-username 或 --owner-id 指定站长。');
  if (!options.dryRun) {
    if (!options.apiOrigin) throw new Error('请通过 --api-origin 指定已部署的后台地址。');
    if (!options.importToken) throw new Error('请通过 --import-token 指定导入令牌。');
  }

  const sourceRoot = path.resolve(options.source);
  const owner = options.ownerId
    ? { id: options.ownerId, username: options.ownerUsername || 'owner-import', display_name: options.ownerDisplayName || '站长' }
    : await fetchOwner(options.ownerUsername);
  const categories = await scanCategories(sourceRoot);
  const selected = options.only.length
    ? categories.filter(category => options.only.includes(category.name))
    : categories;
  const resumed = options.startAfter
    ? selected.slice(Math.max(0, selected.findIndex(category => category.name === options.startAfter) + 1))
    : selected;
  const limited = Number.isFinite(options.limit) ? resumed.slice(0, options.limit) : resumed;

  console.log(`准备迁移分类 ${limited.length} 个，共 ${limited.reduce((sum, item) => sum + item.files.length, 0)} 个媒体文件。`);
  console.log(`站长账号：${owner.username} (${owner.id})`);

  let migratedFolders = 0;
  let skippedFolders = 0;
  let processedFiles = 0;

  for (const category of limited) {
    const slug = normalizeSlug(category.name);
    if (!options.skipExistingCheck) {
      const existing = await queryFolderBySlug(slug);
      if (existing) {
        skippedFolders += 1;
        console.log(`跳过 ${category.name}，因为 slug ${slug} 已存在。`);
        continue;
      }
    }

    console.log(`开始迁移 ${category.name}，文件数 ${category.files.length}`);
    const folderId = makeId('folder');
    const now = new Date().toISOString();
    const assetRows = [];
    const uploadedKeys = [];

    try {
      for (let index = 0; index < category.files.length; index += 1) {
      const file = category.files[index];
      const ext = path.extname(file.name).toLowerCase();
      const assetId = makeId('asset');
      const mimeType = MIME_TYPES.get(ext) || 'application/octet-stream';
      const mediaKind = mimeType.startsWith('video/') ? 'video' : 'image';
      const r2Key = `published/${folderId}/${assetId}${ext}`;

      if (!options.dryRun) {
        await uploadViaApi(options.apiOrigin, options.importToken, r2Key, mimeType, file.absolutePath);
        uploadedKeys.push(r2Key);
      }

      assetRows.push({
        id: assetId,
        folderId,
        uploaderUserId: owner.id,
        r2Key,
        originalName: file.name,
        mimeType,
        mediaKind,
        sizeBytes: file.size,
        sortOrder: index,
        createdAt: now,
        publishedAt: now
      });

      processedFiles += 1;
      if (index === 0 || (index + 1) % 50 === 0 || index + 1 === category.files.length) {
        console.log(`  文件进度 ${index + 1}/${category.files.length}`);
      }
      }

      if (!options.dryRun) {
      const payload = buildImportPayload({
        owner,
        folderId,
        folderName: category.name,
        slug,
        description: buildDescription(category.name),
        now,
        assetRows
      });
      const result = await importFolderViaApi(options.apiOrigin, options.importToken, payload);
      if (result?.skipped) {
          await cleanupUploadedKeys(options, uploadedKeys);
        console.log(`跳过 ${category.name}，远端提示 ${result.reason}`);
        continue;
      }
      }
    } catch (error) {
      if (!options.dryRun) await cleanupUploadedKeys(options, uploadedKeys);
      throw error;
    }

    migratedFolders += 1;
    console.log(`完成 ${category.name}`);
  }

  console.log(`迁移结束：成功 ${migratedFolders}，跳过 ${skippedFolders}，处理文件 ${processedFiles}。`);
}

function parseArgs(args) {
  const options = {
    source: '',
    ownerUsername: '',
    ownerId: '',
    ownerDisplayName: '',
    apiOrigin: '',
    importToken: '',
    limit: Number.POSITIVE_INFINITY,
    only: [],
    dryRun: false,
    skipExistingCheck: false,
    startAfter: ''
  };

  for (let index = 0; index < args.length; index += 1) {
    const current = args[index];
    if (current === '--source') {
      options.source = args[++index];
    } else if (current === '--owner-username') {
      options.ownerUsername = args[++index];
    } else if (current === '--owner-id') {
      options.ownerId = args[++index];
    } else if (current === '--owner-display-name') {
      options.ownerDisplayName = args[++index];
    } else if (current === '--api-origin') {
      options.apiOrigin = args[++index];
    } else if (current === '--import-token') {
      options.importToken = args[++index];
    } else if (current === '--limit') {
      options.limit = Number(args[++index]);
    } else if (current === '--only') {
      options.only.push(args[++index]);
    } else if (current === '--dry-run') {
      options.dryRun = true;
    } else if (current === '--skip-existing-check') {
      options.skipExistingCheck = true;
    } else if (current === '--start-after') {
      options.startAfter = args[++index];
    }
  }

  return options;
}

async function fetchOwner(username) {
  const result = await runD1CommandJson(
    `SELECT id, username, display_name, role FROM users WHERE username = ${sqlString(username)} LIMIT 1;`
  );
  const row = result?.[0]?.results?.[0];
  if (!row) throw new Error(`找不到账号 ${username}`);
  if (row.role !== 'owner') throw new Error(`账号 ${username} 不是 owner，当前角色是 ${row.role}`);
  return row;
}

async function queryFolderBySlug(slug) {
  const result = await runD1CommandJson(
    `SELECT id, slug FROM folders WHERE slug = ${sqlString(slug)} LIMIT 1;`
  );
  return result?.[0]?.results?.[0] || null;
}

async function scanCategories(root) {
  const entries = await fs.readdir(root, { withFileTypes: true });
  const categories = [];

  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))) {
    if (!entry.isDirectory() || EXCLUDE_DIRS.has(entry.name)) continue;

    const categoryRoot = path.join(root, entry.name);
    const childEntries = await fs.readdir(categoryRoot, { withFileTypes: true });
    const files = [];

    for (const child of childEntries) {
      if (!child.isFile()) continue;
      const ext = path.extname(child.name).toLowerCase();
      if (!MEDIA_EXTENSIONS.has(ext)) continue;
      const absolutePath = path.join(categoryRoot, child.name);
      const stat = await fs.stat(absolutePath);
      files.push({
        name: child.name,
        absolutePath,
        size: stat.size
      });
    }

    files.sort((left, right) => left.name.localeCompare(right.name, 'zh-CN', { numeric: true, sensitivity: 'base' }));
    if (files.length) {
      categories.push({ name: entry.name, files });
    }
  }

  return categories;
}

function normalizeSlug(value) {
  return String(value).trim().replace(/\s+/g, '-').replace(/[\\/#?%]/g, '');
}

function buildDescription(name) {
  if (name === '蛤蟆波') return '蛤蟆波表情包（由旧站迁移导入）';
  if (name === '搬波时间DLC') return '搬波时间 DLC 图片与视频合集（由旧站迁移导入）';
  return `${name} 资源合集（由旧站迁移导入）`;
}

function buildImportPayload({ owner, folderId, folderName, slug, description, now, assetRows }) {
  return {
    folder: {
      id: folderId,
      ownerUserId: owner.id,
      name: folderName,
      slug,
      description,
      reviewNote: '旧站迁移导入',
      reviewedByUserId: owner.id,
      reviewedAt: now,
      publishedAt: now,
      createdAt: now,
      updatedAt: now
    },
    assets: assetRows,
    reviewLog: {
      id: makeId('log'),
      actorUserId: owner.id,
      note: '旧站迁移导入并直接发布',
      createdAt: now
    }
  };
}

function sqlString(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function makeId(prefix) {
  return `${prefix}_${randomBytes(12).toString('hex')}`;
}

async function wrangler(args) {
  await runProcess('npx', ['wrangler', ...args], { captureStdout: false });
}

async function runD1CommandJson(sql) {
  const output = await runProcess('npx', ['wrangler', 'd1', 'execute', 'MMC_DB', '--remote', '--json', `--command=${sql}`], { captureStdout: true });
  const match = output.match(/\[\s*\{[\s\S]*$/);
  if (!match) throw new Error(`无法从 Wrangler 输出中解析 JSON:\n${output}`);
  return JSON.parse(match[0]);
}

async function uploadViaApi(apiOrigin, importToken, key, contentType, filePath) {
  const body = await fs.readFile(filePath);
  const response = await fetchWithRetry(`${apiOrigin.replace(/\/$/, '')}/api/admin/import/upload?key=${encodeURIComponent(key)}&contentType=${encodeURIComponent(contentType)}`, {
    method: 'PUT',
    headers: {
      'x-import-token': importToken
    },
    body,
    dispatcher: httpAgent
  });
  if (!response.ok) {
    throw new Error(`上传失败 ${filePath} -> ${key}: ${await response.text()}`);
  }
}

async function cleanupUploadedKeys(options, keys) {
  for (const key of keys) {
    try {
      const url = `${options.apiOrigin.replace(/\/$/, '')}/api/admin/import/r2-object?key=${encodeURIComponent(key)}`;
      await fetchWithRetry(url, { method: 'DELETE', headers: { 'x-import-token': options.importToken }, dispatcher: httpAgent });
    } catch (error) { console.error(JSON.stringify({ event: 'legacy_import_cleanup_error', key, error: error.message })); }
  }
}

async function importFolderViaApi(apiOrigin, importToken, payload) {
  const response = await fetchWithRetry(`${apiOrigin.replace(/\/$/, '')}/api/admin/import/folder`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-import-token': importToken
    },
    body: JSON.stringify(payload),
    dispatcher: httpAgent
  });
  if (!response.ok) {
    throw new Error(`导入 folder 失败: ${await response.text()}`);
  }
  return response.json();
}

async function fetchWithRetry(url, init, retries = 3) {
  let lastError = null;
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      return await fetch(url, init);
    } catch (error) {
      lastError = error;
      if (attempt === retries) break;
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  throw lastError;
}

async function runD1Sql(sql, jsonOutput) {
  const tempName = `.tmp-d1-${Date.now()}-${randomBytes(4).toString('hex')}.sql`;
  const tempPath = path.join(process.cwd(), tempName);
  await fs.writeFile(tempPath, sql, 'utf8');
  try {
    const args = ['wrangler', 'd1', 'execute', 'MMC_DB', '--remote', '--file', tempName];
    if (jsonOutput) {
      args.push('--json');
      const output = await runProcess('npx', args, { captureStdout: true });
      const match = output.match(/\[\s*\{[\s\S]*$/);
      if (!match) throw new Error(`无法从 Wrangler 输出中解析 JSON:\n${output}`);
      return JSON.parse(match[0]);
    }
    await runProcess('npx', args, { captureStdout: false });
    return null;
  } finally {
    await fs.rm(tempPath, { force: true });
  }
}

async function runProcess(command, args, options) {
  return new Promise((resolve, reject) => {
    const captureStdout = Boolean(options.captureStdout);
    const child = spawn(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', buildWindowsCommand(command, args)], {
      cwd: process.cwd(),
      shell: false,
      stdio: captureStdout ? ['pipe', 'pipe', 'pipe'] : ['pipe', 'inherit', 'inherit']
    });

    let stdout = '';
    let stderr = '';

    if (options.inputFilePath) {
      const stream = fsSyncCreateReadStream(options.inputFilePath);
      stream.on('error', reject);
      stream.pipe(child.stdin);
    } else {
      child.stdin.end();
    }

    if (captureStdout) {
      child.stdout.on('data', chunk => {
        stdout += chunk.toString();
      });
      child.stderr.on('data', chunk => {
        stderr += chunk.toString();
      });
    }

    child.on('error', reject);
    child.on('exit', code => {
      if (code === 0) {
        resolve(captureStdout ? stdout : '');
        return;
      }
      reject(new Error(captureStdout ? `${stderr}\n${stdout}` : `${command} ${args.join(' ')} 执行失败，退出码 ${code}`));
    });
  });
}

function buildWindowsCommand(command, args) {
  return [command, ...args.map(quoteWindowsArgument)].join(' ');
}

function quoteWindowsArgument(value) {
  const text = String(value);
  if (/^[A-Za-z0-9_./:=+-]+$/u.test(text)) {
    return text;
  }
  return `"${text.replace(/(\\*)"/g, '$1$1\\"').replace(/(\\+)$/g, '$1$1')}"`;
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
