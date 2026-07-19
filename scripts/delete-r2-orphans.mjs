import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import crypto from 'node:crypto';
const args = parseArgs(process.argv.slice(2));
if (!args.manifest) throw new Error('需要 --manifest。');
const manifestPath = path.resolve(args.manifest);
const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
const origin = args.origin || process.env.SITE_ORIGIN;
const token = args['import-token'] || process.env.IMPORT_TOKEN;
if (!origin || !token) throw new Error('需要 --origin 与 --import-token。');
const expected = args.confirm || '';
if (args.apply && !/^[a-f0-9]{64}$/i.test(expected)) throw new Error('--apply 必须提供 manifest 的 r2-orphans.json SHA-256。');
if (args.apply) {
  const actual = crypto.createHash('sha256').update(await fs.readFile(manifestPath)).digest('hex');
  if (actual.toLowerCase() !== expected.toLowerCase()) throw new Error(`manifest SHA-256 不匹配：实际 ${actual}`);
}
const journalPath = path.join(path.dirname(manifestPath), 'deletion-journal.jsonl');
const done = new Set();
try { for (const line of (await fs.readFile(journalPath, 'utf8')).split(/\r?\n/).filter(Boolean)) { const row = JSON.parse(line); if (row.result === 'deleted') done.add(row.key); } } catch {}
const pending = (manifest.candidates || []).filter(item => !done.has(item.key));
let nextIndex = 0;
async function worker() {
  while (nextIndex < pending.length) {
    const item = pending[nextIndex++];
    const row = { at: new Date().toISOString(), key: item.key, manifestSha256: expected || null, result: 'dry_run' };
    if (args.apply) {
      try {
        const url = new URL('/api/admin/import/r2-object', origin); url.searchParams.set('key', item.key);
        const response = await fetch(url, { method: 'DELETE', headers: { 'x-import-token': token } });
        row.result = response.ok ? 'deleted' : (response.status === 409 ? 'stale' : 'failed');
        if (!response.ok) row.error = await response.text();
      } catch (error) { row.result = 'failed'; row.error = error.message; }
    }
    await fs.appendFile(journalPath, `${JSON.stringify(row)}\n`);
    console.log(JSON.stringify(row));
  }
}
await Promise.all([worker(), worker(), worker()]);
function parseArgs(values) { const result = {}; for (let i = 0; i < values.length; i += 1) { if (values[i].startsWith('--')) result[values[i].slice(2)] = values[i + 1]?.startsWith('--') ? true : values[++i]; } return result; }
