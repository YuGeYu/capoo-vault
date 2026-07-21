import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { unzipSync } from 'fflate';

const origin = process.env.PRODUCTION_ORIGIN || 'https://maomaochongmiao.600318.xyz';
const outputDir = path.resolve('artifacts', '2026-07-21-latest-fonts-production');
const expectedFonts = {
  'ZCOOLQingKeHuangYou-Regular.woff2': '2cd7a2705b6f85d24fc11813ea0022d04f0db1c52b1c2c2bc16aa92793ca9829',
  'LiuJianMaoCao-Regular.woff2': 'fa381bc35986608756fe4447ff6e2ef18063d87598e6c73f5a049376d1c52172',
  'LongCang-Regular.woff2': 'e67337fb4722a7effcb39e53a436b484c64317b4bace8b9a9cabd9350a01ee9e',
  'ZhiMangXing-Regular.woff2': '04e301c03a792561986a200a590eb763a91e11a15cd452041484009f3d03fc46'
};

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

async function fetchChecked(pathname, expectedStatus = 200) {
  const response = await fetch(`${origin}${pathname}`, { headers: { 'cache-control': 'no-cache' } });
  assert.equal(response.status, expectedStatus, `${pathname} HTTP ${response.status}`);
  return response;
}

async function verifyHttp() {
  const statuses = {};
  for (const pathname of ['/', '/tools/capoo-message-sticker/', '/tools/list', '/sitemap.xml']) {
    statuses[pathname] = (await fetchChecked(pathname)).status;
  }
  const bootstrap = await (await fetchChecked('/api/bootstrap')).json();
  assert.equal(bootstrap.folders.length, 141);
  assert.equal(bootstrap.foldersTotal, 141);
  const first = await (await fetchChecked('/api/public/folders?limit=24&offset=0')).json();
  assert.deepEqual({ count: first.folders.length, offset: first.offset, limit: first.limit, total: first.total, hasMore: first.hasMore }, {
    count: 24, offset: 0, limit: 24, total: 141, hasMore: true
  });
  const last = await (await fetchChecked('/api/public/folders?limit=24&offset=120')).json();
  assert.deepEqual({ count: last.folders.length, offset: last.offset, limit: last.limit, total: last.total, hasMore: last.hasMore }, {
    count: 21, offset: 120, limit: 24, total: 141, hasMore: false
  });
  const invalid = await (await fetchChecked('/api/public/folders?limit=501&offset=0', 400)).json();
  assert.match(invalid.error, /1.*500/);

  const fontHashes = {};
  for (const [filename, expectedHash] of Object.entries(expectedFonts)) {
    const bytes = Buffer.from(await (await fetchChecked(`/tools/capoo-message-sticker/assets/fonts/${filename}`)).arrayBuffer());
    fontHashes[filename] = sha256(bytes);
    assert.equal(fontHashes[filename], expectedHash, `${filename} 线上哈希不匹配`);
  }
  return {
    statuses,
    bootstrap: { loaded: bootstrap.folders.length, total: bootstrap.foldersTotal },
    first: { count: first.folders.length, offset: first.offset, limit: first.limit, total: first.total, hasMore: first.hasMore },
    last: { count: last.folders.length, offset: last.offset, limit: last.limit, total: last.total, hasMore: last.hasMore },
    invalid,
    fontHashes
  };
}

async function verifyBrowser() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const apiRequests = [];
  const externalFontRequests = [];
  page.on('request', request => {
    const url = request.url();
    if (url.includes('/api/bootstrap') || url.includes('/api/public/folders')) apiRequests.push(url);
    if (/fonts\.(googleapis|gstatic)\.com/i.test(url)) externalFontRequests.push(url);
  });
  try {
    await page.goto(`${origin}/?verify=latest-fonts`, { waitUntil: 'networkidle' });
    await page.locator('[data-beta-channel="latest"]').click();
    await page.screenshot({ path: path.join(outputDir, 'online-latest-390-initial.png'), fullPage: true });
    const sequence = [await page.locator('.beta-folder-card').count()];
    while (await page.locator('[data-beta-load-more]').count()) {
      await page.locator('[data-beta-load-more]').click();
      sequence.push(await page.locator('.beta-folder-card').count());
    }
    assert.deepEqual(sequence, [24, 48, 72, 96, 120, 141]);
    assert.equal(await page.locator('.beta-load-more-complete').innerText(), '已展示全部 141 个作品');
    const hrefs = await page.locator('.beta-folder-card').evaluateAll(cards => cards.map(card => card.getAttribute('href')));
    assert.equal(new Set(hrefs).size, 141);
    assert.equal(apiRequests.filter(url => url.includes('/api/bootstrap')).length, 1);
    assert.equal(apiRequests.filter(url => url.includes('/api/public/folders')).length, 0);

    externalFontRequests.length = 0;
    await page.goto(`${origin}/tools/capoo-message-sticker/?verify=latest-fonts`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.querySelector('.workspace')?.getAttribute('aria-busy') === 'false');
    const options = await page.locator('.font-option').all();
    assert.equal(options.length, 8);
    await page.locator('#message-input').fill('简体中文测试：发财、喜欢、发现、没关系！');
    const gifResults = [];
    for (const option of options) {
      const fontId = await option.getAttribute('data-font-id');
      const label = await option.locator('.font-option-name').innerText();
      await page.waitForFunction(id => !['loading', 'error'].includes(document.querySelector(`.font-option[data-font-id="${id}"]`)?.dataset.status), fontId);
      await option.click();
      await page.waitForFunction(id => {
        const option = document.querySelector(`.font-option[data-font-id="${id}"]`);
        return option?.dataset.status === 'ready' && option.dataset.selected === 'true' && document.querySelector('#canvas-loading')?.hidden;
      }, fontId);
      const pending = page.waitForEvent('download');
      await page.locator('#download-button').click();
      const download = await pending;
      const target = path.join(outputDir, `online-${fontId}.gif`);
      await download.saveAs(target);
      const bytes = await readFile(target);
      assert.equal(bytes.subarray(0, 6).toString('ascii'), 'GIF89a');
      gifResults.push({ fontId, label, bytes: bytes.length, sha256: sha256(bytes) });
    }

    await page.locator('[data-template-id="293948094"]').click();
    await page.locator('#message-input').fill('第一张线上验证');
    await page.locator('[data-template-id="293948095"]').click();
    await page.locator('#message-input').fill('第二张线上验证');
    const pendingZip = page.waitForEvent('download');
    await page.locator('#zip-button').click();
    const zipDownload = await pendingZip;
    const zipPath = path.join(outputDir, 'online-two-fonts.zip');
    await zipDownload.saveAs(zipPath);
    const zipBytes = await readFile(zipPath);
    const zip = unzipSync(new Uint8Array(zipBytes));
    const entries = Object.keys(zip).sort();
    assert.equal(entries.length, 2);
    assert.ok(entries.every(name => name.endsWith('.gif') && Buffer.from(zip[name]).subarray(0, 6).toString('ascii') === 'GIF89a'));
    await page.screenshot({ path: path.join(outputDir, 'online-fonts-390.png'), fullPage: true });
    assert.deepEqual(externalFontRequests, []);
    return { sequence, uniqueFolders: new Set(hrefs).size, apiRequests, gifResults, zip: { entries, sha256: sha256(zipBytes) }, externalFontRequests };
  } finally {
    await browser.close();
  }
}

async function main() {
  await mkdir(outputDir, { recursive: true });
  const http = await verifyHttp();
  const browser = await verifyBrowser();
  const result = { origin, verifiedAt: new Date().toISOString(), http, browser };
  await writeFile(path.join(outputDir, 'verification.json'), `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(result, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
