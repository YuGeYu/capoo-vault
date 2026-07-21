import assert from 'node:assert/strict';
import { mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { chromium } from 'playwright';
import { unzipSync } from 'fflate';
import { GifReader } from 'omggif';

const origin = process.env.CAPOO_TOOL_ORIGIN || 'http://127.0.0.1:8791';
const outputDir = path.resolve('artifacts', 'capoo-message', 'gif-font-verification');
const viewports = [
  { name: 'phone-375', width: 375, height: 667 },
  { name: 'phone-390', width: 390, height: 844 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'landscape-1024', width: 1024, height: 768 },
  { name: 'desktop-1440', width: 1440, height: 900 }
];

async function canvasInfo(page) {
  return page.evaluate(() => {
    const canvas = document.querySelector('#preview-canvas');
    const data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
    let opaquePixels = 0;
    for (let index = 3; index < data.length; index += 4) if (data[index]) opaquePixels += 1;
    return { width: canvas.width, height: canvas.height, opaquePixels };
  });
}

function gifInfo(bytes) {
  const buffer = Buffer.from(bytes);
  assert.equal(buffer.subarray(0, 6).toString('ascii'), 'GIF89a', '导出的文件必须是 GIF89a');
  const reader = new GifReader(buffer);
  const rgba = Buffer.alloc(reader.width * reader.height * 4);
  reader.decodeAndBlitFrameRGBA(0, rgba);
  let transparentPixels = 0;
  for (let index = 3; index < rgba.length; index += 4) if (rgba[index] === 0) transparentPixels += 1;
  const packed = buffer[10];
  const paletteSize = (packed & 0x80) ? 2 ** ((packed & 0x07) + 1) : 0;
  return {
    width: reader.width,
    height: reader.height,
    frames: reader.numFrames(),
    transparentPixels,
    paletteSize,
    sha256: createHash('sha256').update(buffer).digest('hex')
  };
}

async function main() {
  await rm(outputDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage();
  const consoleErrors = [];
  const forbiddenRequests = [];
  const comboReports = [];
  const gifReports = [];
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', error => consoleErrors.push(error.message));
  page.on('request', request => {
    const url = new URL(request.url());
    if (url.hostname === 'store.line.me' || url.hostname.endsWith('.line-scdn.net')) forbiddenRequests.push(request.url());
  });

  const response = await page.goto(`${origin}/tools/capoo-message-sticker/`, { waitUntil: 'networkidle' });
  assert.equal(response?.status(), 200, '独立工具路由必须返回 HTTP 200');
  assert.equal(await page.title(), '咖波讯息贴图制作器 - 猫猫虫咖波表情包仓库');
  assert.equal(await page.locator('.template-button').count(), 24, '只能展示 24 张模板');
  await page.waitForFunction(() => document.querySelector('.workspace')?.getAttribute('aria-busy') === 'false');
  const initialCanvas = await canvasInfo(page);
  assert.equal(initialCanvas.width, 420);
  assert.equal(initialCanvas.height, 350);
  assert.ok(initialCanvas.opaquePixels > 5000, '初始 Canvas 不能空白');
  assert.deepEqual(forbiddenRequests, [], `编辑器不应请求 LINE 运行时资源：${forbiddenRequests.join(', ')}`);

  await page.waitForFunction(() => [...document.querySelectorAll('.font-option')].length === 8 && [...document.querySelectorAll('.font-option')].every(option => option.dataset.status !== 'loading'));
  const fontOptions = await page.locator('.font-option').all();
  assert.equal(fontOptions.length, 8, '必须展示 8 款字体');
  for (const button of await page.locator('.template-button').all()) {
    for (const font of fontOptions) {
      await button.click();
      await page.locator('#restore-button').click();
      await font.click();
      await page.waitForFunction(fontId => document.querySelector(`.font-option[data-font-id="${fontId}"]`)?.dataset.selected === 'true' && document.querySelector('#canvas-loading')?.hidden, await font.getAttribute('data-font-id'));
      await page.waitForTimeout(80);
      const combo = { templateId: await button.getAttribute('data-template-id'), fontId: await font.getAttribute('data-font-id') };
      assert.equal(await page.locator('#layout-error').isVisible(), false, `字体 ${combo.fontId}、模板 ${combo.templateId} 默认文字溢出`);
      assert.ok((await canvasInfo(page)).opaquePixels > 5000, `字体 ${await font.getAttribute('data-font-id')}、模板 ${await button.getAttribute('data-template-id')} Canvas 为空`);
      combo.default = { fits: true, opaquePixels: (await canvasInfo(page)).opaquePixels };
      await page.locator('#message-input').fill('好');
      await page.waitForTimeout(40);
      assert.equal(await page.locator('#layout-error').isVisible(), false, `字体 ${combo.fontId}、模板 ${combo.templateId} 短文字溢出`);
      combo.short = { fits: true };
      await page.locator('#message-input').fill('简体\n中文');
      await page.waitForTimeout(40);
      assert.equal(await page.locator('#layout-error').isVisible(), false, `字体 ${combo.fontId}、模板 ${combo.templateId} 两行文字溢出`);
      combo.twoLine = { fits: true };
      comboReports.push(combo);
    }
  }
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.querySelector('.workspace')?.getAttribute('aria-busy') === 'false');

  await page.evaluate(() => {
    localStorage.setItem('mmc_capoo_message_sticker_drafts_v1', JSON.stringify({ '293948094': '旧版迁移文字' }));
    localStorage.removeItem('mmc_capoo_message_sticker_drafts_v2');
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.querySelector('.workspace')?.getAttribute('aria-busy') === 'false');
  assert.equal(await page.locator('#message-input').inputValue(), '旧版迁移文字', 'v1 草稿文字必须无损迁移');
  assert.equal(await page.locator('.font-option[data-font-id="noto-sans-sc"] input').isChecked(), true, 'v1 草稿迁移默认使用思源黑体');
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('mmc_capoo_message_sticker_drafts_v2')).version), 2, '迁移后必须写入 v2');
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.querySelector('.workspace')?.getAttribute('aria-busy') === 'false');

  await page.locator('#message-input').fill('简体中文测试 ABC 123！？');
  await page.waitForTimeout(120);
  assert.equal(await page.locator('#character-count').innerText(), '已用 16/100');
  await page.locator('[data-template-id="293948095"]').click();
  await page.locator('[data-template-id="293948094"]').click();
  assert.equal(await page.locator('#message-input').inputValue(), '简体中文测试 ABC 123！？', '切换模板后草稿不能丢失');

  const longText = '测'.repeat(100);
  await page.locator('#message-input').fill(longText);
  await page.waitForTimeout(120);
  assert.equal(await page.locator('#layout-error').isVisible(), true, '超长文字需要明确提示');
  assert.equal(await page.locator('#download-button').isDisabled(), true, '超长文字不能下载');
  await page.locator('#restore-button').click();
  await page.waitForTimeout(120);
  assert.equal(await page.locator('#layout-error').isVisible(), false);

  const fontLabels = await Promise.all(fontOptions.map(option => option.locator('.font-option-name').innerText()));
  const gifPaths = [];
  for (let index = 0; index < fontOptions.length; index += 1) {
    await page.locator('[data-template-id="293948094"]').click();
    await page.locator('#restore-button').click();
    await fontOptions[index].click();
    const gifDownload = page.waitForEvent('download');
    await page.locator('#download-button').click();
    const gif = await gifDownload;
    const gifPath = path.join(outputDir, `咖波讯息贴图-01-${fontLabels[index]}.gif`);
    await gif.saveAs(gifPath);
    gifPaths.push(gifPath);
    const downloadedGif = gifInfo(await readFile(gifPath));
    assert.equal(downloadedGif.width, 420);
    assert.equal(downloadedGif.height, 350);
    assert.equal(downloadedGif.frames, 1);
    assert.ok(downloadedGif.transparentPixels > 0, '导出的 GIF 必须保留透明像素');
    gifReports.push({ filename: path.basename(gifPath), ...downloadedGif, bytes: (await stat(gifPath)).size });
  }

  // Export every template once with the default font so all 24 production GIF paths are decoded.
  for (const button of await page.locator('.template-button').all()) {
    await button.click();
    await page.locator('#restore-button').click();
    await page.waitForTimeout(40);
    const templateId = await button.getAttribute('data-template-id');
    const ordinal = String(Number(templateId) - 293948093).padStart(2, '0');
    const gifDownload = page.waitForEvent('download');
    await page.locator('#download-button').click();
    const gif = await gifDownload;
    const gifPath = path.join(outputDir, `咖波讯息贴图-全模板-${ordinal}-思源黑体.gif`);
    await gif.saveAs(gifPath);
    const downloadedGif = gifInfo(await readFile(gifPath));
    assert.equal(downloadedGif.width, 420);
    assert.equal(downloadedGif.height, 350);
    assert.equal(downloadedGif.frames, 1);
    assert.ok(downloadedGif.transparentPixels > 0, `${templateId} 导出的 GIF 必须保留透明像素`);
    gifReports.push({ templateId, fontId: 'noto-sans-sc', filename: path.basename(gifPath), ...downloadedGif, bytes: (await stat(gifPath)).size });
  }

  await page.locator('[data-template-id="293948094"]').click();
  await page.locator('#message-input').fill('第一张一起下载');
  await page.locator('[data-template-id="293948095"]').click();
  await page.locator('#message-input').fill('两张一起下载');
  await page.waitForTimeout(120);
  assert.equal(await page.locator('#zip-button').isDisabled(), false);
  const zipDownload = page.waitForEvent('download');
  await page.locator('#zip-button').click();
  const zip = await zipDownload;
  const zipPath = path.join(outputDir, await zip.suggestedFilename());
  await zip.saveAs(zipPath);
  const zipFiles = unzipSync(new Uint8Array(await readFile(zipPath)));
  const names = Object.keys(zipFiles).sort();
  assert.equal(names.length, 2, 'ZIP 必须仅包含已编辑模板');
  assert.ok(names.every(name => name.endsWith('.gif')));
  for (const [name, contents] of Object.entries(zipFiles)) {
    const zippedGif = gifInfo(contents);
    assert.equal(zippedGif.width, 420, `${name} 宽度错误`);
    assert.equal(zippedGif.height, 350, `${name} 高度错误`);
    assert.ok(zippedGif.transparentPixels > 0, `${name} 缺少透明像素`);
  }

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.querySelector('.workspace')?.getAttribute('aria-busy') === 'false');
  await page.locator('[data-template-id="293948095"]').click();
  assert.equal(await page.locator('#message-input').inputValue(), '两张一起下载', '刷新后必须恢复 localStorage 草稿');

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto(`${origin}/tools/capoo-message-sticker/`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.querySelector('.workspace')?.getAttribute('aria-busy') === 'false');
    await page.screenshot({ path: path.join(outputDir, `${viewport.name}.png`), fullPage: true });
    const metrics = await page.evaluate(() => ({
      viewportWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      preview: document.querySelector('.canvas-shell').getBoundingClientRect().toJSON(),
      input: document.querySelector('#message-input').getBoundingClientRect().toJSON(),
      download: document.querySelector('#download-button').getBoundingClientRect().toJSON()
    }));
    assert.ok(metrics.scrollWidth <= metrics.viewportWidth, `${viewport.name} 出现横向溢出`);
    assert.ok(metrics.preview.width > 0 && metrics.input.width > 0 && metrics.download.width > 0, `${viewport.name} 关键控件不可见`);
    assert.ok((await canvasInfo(page)).opaquePixels > 5000, `${viewport.name} Canvas 为空`);
  }

  assert.deepEqual(consoleErrors, [], `浏览器控制台错误：${consoleErrors.join('\n')}`);
  await browser.close();
  await writeFile(path.join(outputDir, 'verification.json'), `${JSON.stringify({ origin, comboCount: comboReports.length, comboReports, gifs: gifReports, zip: { filename: path.basename(zipPath), entries: names }, screenshots: viewports.map(viewport => `${viewport.name}.png`) }, null, 2)}\n`);
  console.log(JSON.stringify({ origin, comboCount: comboReports.length, gifs: gifPaths, zip: zipPath, zipEntries: names, screenshots: viewports.map(viewport => `${viewport.name}.png`) }, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
