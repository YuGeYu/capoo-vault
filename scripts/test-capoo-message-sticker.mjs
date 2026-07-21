import assert from 'node:assert/strict';
import { mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { unzipSync } from 'fflate';
import sharp from 'sharp';

const origin = process.env.CAPOO_TOOL_ORIGIN || 'http://127.0.0.1:8791';
const outputDir = path.resolve('artifacts', 'capoo-message', 'verification');
const viewports = [
  { name: 'phone-375', width: 375, height: 812 },
  { name: 'phone-430', width: 430, height: 932 },
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

async function main() {
  await rm(outputDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage();
  const consoleErrors = [];
  const forbiddenRequests = [];
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

  for (const button of await page.locator('.template-button').all()) {
    await button.click();
    await page.waitForTimeout(40);
    assert.equal(await page.locator('#layout-error').isVisible(), false, `模板 ${await button.getAttribute('data-template-id')} 的默认文字不能溢出`);
    await page.locator('#message-input').fill('好');
    await page.waitForTimeout(40);
    assert.equal(await page.locator('#layout-error').isVisible(), false, `模板 ${await button.getAttribute('data-template-id')} 的短文字不能溢出`);
    await page.locator('#message-input').fill('第一行\n第二行');
    await page.waitForTimeout(40);
    assert.equal(await page.locator('#layout-error').isVisible(), false, `模板 ${await button.getAttribute('data-template-id')} 的两行文字不能溢出`);
    assert.ok((await canvasInfo(page)).opaquePixels > 5000, `模板 ${await button.getAttribute('data-template-id')} Canvas 为空`);
  }
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });

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

  const pngDownload = page.waitForEvent('download');
  await page.locator('#download-button').click();
  const png = await pngDownload;
  const pngPath = path.join(outputDir, await png.suggestedFilename());
  await png.saveAs(pngPath);
  const pngMetadata = await sharp(pngPath).metadata();
  assert.equal(pngMetadata.format, 'png');
  assert.equal(pngMetadata.width, 420);
  assert.equal(pngMetadata.height, 350);
  assert.equal(pngMetadata.hasAlpha, true, '导出的 PNG 必须保留透明通道');

  await page.locator('[data-template-id="293948095"]').click();
  await page.locator('#message-input').fill('两张一起下载');
  await page.waitForTimeout(120);
  assert.equal(await page.locator('#zip-button').isDisabled(), false);
  const zipDownload = page.waitForEvent('download');
  await page.locator('#zip-button').click();
  const zip = await zipDownload;
  const zipPath = path.join(outputDir, await zip.suggestedFilename());
  await zip.saveAs(zipPath);
  const zipFiles = unzipSync(new Uint8Array(await (await import('node:fs/promises')).readFile(zipPath)));
  const names = Object.keys(zipFiles).sort();
  assert.equal(names.length, 2, 'ZIP 必须仅包含已编辑模板');
  assert.ok(names.every(name => name.endsWith('.png')));
  assert.ok(Object.values(zipFiles).every(data => data[0] === 0x89 && data[1] === 0x50 && data[2] === 0x4e && data[3] === 0x47));

  await page.reload({ waitUntil: 'networkidle' });
  await page.locator('[data-template-id="293948095"]').click();
  assert.equal(await page.locator('#message-input').inputValue(), '两张一起下载', '刷新后必须恢复 localStorage 草稿');

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto(`${origin}/tools/capoo-message-sticker/`, { waitUntil: 'networkidle' });
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
  console.log(JSON.stringify({ origin, png: pngPath, zip: zipPath, zipEntries: names, screenshots: viewports.map(viewport => `${viewport.name}.png`) }, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
