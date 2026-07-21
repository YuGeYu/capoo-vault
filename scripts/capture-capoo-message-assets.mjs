import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const PRODUCT_ID = '16897';
const EXPECTED_IDS = Array.from({ length: 24 }, (_, index) => String(293948094 + index));
const PRODUCT_URL = `https://store.line.me/stickershop/product/${PRODUCT_ID}/zh-Hant`;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ASSET_ROOT = path.join(ROOT, 'public', 'tools', 'capoo-message-sticker', 'assets', 'templates');
const RECORD_PATH = path.join(ROOT, 'docs', '2026-07-21-咖波讯息贴图素材来源与校准记录.md');
const TEMPLATE_CONFIG_PATH = path.join(ROOT, 'public', 'tools', 'capoo-message-sticker', 'templates.json');

function pngSize(buffer) {
  if (buffer.length < 24 || buffer.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') {
    throw new Error('响应不是有效 PNG');
  }
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function assertAllowedUrl(value, kind, id) {
  const url = new URL(value);
  if (kind === 'base') {
    if (url.hostname !== 'stickershop.line-scdn.net' || !url.pathname.includes(`/sticker/${id}/iPhone/base/`)) {
      throw new Error(`模板 ${id} 的底图地址不在允许范围：${url}`);
    }
  } else if (url.hostname !== 'stickershop.line-scdn.net' || !url.pathname.includes(`/product/${PRODUCT_ID}/sticker/${id}/iPhone/overlay/`)) {
    throw new Error(`模板 ${id} 的覆盖层地址不在允许范围：${url}`);
  }
  return url.toString();
}

async function downloadWithRetry(page, sourceUrl, label) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await page.goto(sourceUrl, { waitUntil: 'load', timeout: 120_000 });
      if (!response || response.status() !== 200) throw new Error(`HTTP ${response?.status() ?? '无响应'}`);
      const contentType = response.headers()['content-type'] || '';
      if (!contentType.toLowerCase().startsWith('image/png')) throw new Error(`Content-Type ${contentType}`);
      const finalUrl = response.url();
      if (new URL(finalUrl).hostname !== 'stickershop.line-scdn.net') throw new Error(`意外重定向到 ${finalUrl}`);
      const body = await response.body();
      const size = pngSize(body);
      if (body.length < 100 || size.width < 100 || size.height < 100) throw new Error(`图片尺寸异常：${size.width}x${size.height}, ${body.length} bytes`);
      return { body, finalUrl, contentType, ...size, bytes: body.length, sha256: sha256(body) };
    } catch (error) {
      lastError = error;
      console.warn(`${label} 第 ${attempt}/3 次下载失败：${error.message}`);
      await new Promise(resolve => setTimeout(resolve, attempt * 1500));
    }
  }
  throw new Error(`${label} 下载失败：${lastError?.message}`);
}

async function main() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ locale: 'zh-TW' });
  const capturedAt = new Date().toISOString();
  try {
    const productResponse = await page.goto(PRODUCT_URL, { waitUntil: 'domcontentloaded', timeout: 120_000 });
    if (!productResponse || productResponse.status() !== 200) throw new Error(`商品页 HTTP ${productResponse?.status() ?? '无响应'}`);
    await page.waitForSelector('li.FnStickerPreviewItem', { timeout: 120_000 });
    const productTitle = await page.title();
    const author = (await page.locator('body').innerText()).includes('\nYara\n') ? 'Yara' : '未识别';
    const rows = await page.locator('li.FnStickerPreviewItem').evaluateAll(items => items.map(item => ({
      preview: JSON.parse(item.dataset.preview || '{}'),
      sourceDefaultText: item.dataset.defaultText || '',
      customApi: item.dataset.customApi || ''
    })));
    const ids = rows.map(row => String(row.preview.id));
    if (JSON.stringify(ids) !== JSON.stringify(EXPECTED_IDS)) {
      throw new Error(`模板集合变化，预期 ${EXPECTED_IDS.join(',')}，实际 ${ids.join(',')}`);
    }

    const downloadPage = await browser.newPage();
    const records = [];
    for (const [index, row] of rows.entries()) {
      const id = String(row.preview.id);
      const baseUrl = assertAllowedUrl(row.preview.staticUrl, 'base', id);
      const overlayUrl = assertAllowedUrl(row.preview.customOverlayUrl, 'overlay', id);
      const targetDir = path.join(ASSET_ROOT, id);
      await mkdir(targetDir, { recursive: true });
      const base = await downloadWithRetry(downloadPage, baseUrl, `${id} base`);
      const reference = await downloadWithRetry(downloadPage, overlayUrl, `${id} reference-default`);
      if (base.width !== reference.width || base.height !== reference.height) {
        throw new Error(`${id} 底图与参考覆盖层尺寸不一致`);
      }
      await writeFile(path.join(targetDir, 'base.png'), base.body);
      await writeFile(path.join(targetDir, 'reference-default.png'), reference.body);
      records.push({ id, order: index + 1, sourceDefaultText: row.sourceDefaultText, customApi: row.customApi, baseUrl, overlayUrl, base, reference });
      console.log(`[${index + 1}/24] ${id} ${base.width}x${base.height}`);
    }
    await downloadPage.close();

    const filesTable = records.flatMap(row => [
      `| ${row.id} | base.png | ${row.base.width}x${row.base.height} | ${row.base.bytes} | \`${row.base.sha256}\` | ${row.baseUrl} |`,
      `| ${row.id} | reference-default.png | ${row.reference.width}x${row.reference.height} | ${row.reference.bytes} | \`${row.reference.sha256}\` | ${row.overlayUrl} |`
    ]).join('\n');
    const templateConfig = JSON.parse(await readFile(TEMPLATE_CONFIG_PATH, 'utf8'));
    const configMap = new Map(templateConfig.templates.map(template => [template.id, template]));
    const verified = process.env.CAPOO_CALIBRATION_VERIFIED === '1';
    const defaultsTable = records.map(row => {
      const template = configMap.get(row.id);
      if (!template) throw new Error(`templates.json 缺少 ${row.id}`);
      const { box } = template.text;
      const direction = template.text.writingMode === 'vertical' ? '竖排' : '横排';
      const status = verified ? '默认/短字/两行自动化通过，五视口目测通过' : '配置完成，待运行自动化验收';
      return `| ${row.order} | ${row.id} | ${row.sourceDefaultText.replaceAll('\n', '<br>')} | ${direction}；\`${box.x},${box.y},${box.width},${box.height}\`；${template.text.fontSize}-${template.text.minFontSize}px | ${status} |`;
    }).join('\n');
    const markdown = `# 咖波讯息贴图素材来源与校准记录\n\n## 采集基线\n\n- 采集时间（UTC）：\`${capturedAt}\`\n- 商品页：${PRODUCT_URL}\n- 最终 URL：${page.url()}\n- HTTP 状态：\`${productResponse.status()}\`\n- 页面标题：${productTitle}\n- 作者：${author}\n- 模板数量：\`${records.length}\`\n- 模板 ID：\`${ids.join(', ')}\`\n- 采集方式：本机 Microsoft Edge + Playwright，从实时 \`li.FnStickerPreviewItem\` 读取 \`data-preview\`、\`data-default-text\` 与 \`data-custom-api\`。\n\n## 图层结论\n\n运行态交互验证表明，420x350 的 \`base.png\` 已包含角色与装饰；默认覆盖层只包含文字。输入单个空格时服务返回 420x350、762 字节的全透明 PNG，因此正式工具不保存伪造的空覆盖层，绘制顺序为 \`base.png -> Canvas 文字\`。\`reference-default.png\` 仅作为原始排版校准基线，不参与正式导出。\n\n## 文件清单\n\n| 模板 ID | 文件 | 尺寸 | 字节数 | SHA-256 | 来源 URL |\n|---|---|---:|---:|---|---|\n${filesTable}\n\n## 逐张校准\n\n坐标顺序为 \`x,y,width,height\`，均使用 420x350 原生素材像素。\n\n| 序号 | 模板 ID | 来源默认文字 | 方向、文字框、字号范围 | 验收状态 |\n|---:|---|---|---|---|\n${defaultsTable}\n\n## 验证\n\n- 自动化命令：\`node scripts/test-capoo-message-sticker.mjs\`\n- 当前记录状态：${verified ? '2026-07-21 已完成 24 张默认/短字/两行、长文错误态、草稿恢复、透明 PNG、ZIP 与五视口验证。' : '尚未通过环境变量标记最终验收。'}\n- 验证截图与下载产物：\`artifacts/capoo-message/verification/\`\n\n## 约束\n\n- 素材角色版权归原作者 Yara 所有；本次仅采集商品 16897 的上述 24 张模板。\n- 正式页面仅请求本站静态资源，不调用 LINE 自定义覆盖层接口，也不上传用户输入。\n- 本记录不包含 Cookie、登录态、CSRF 值或浏览器配置。\n`;
    await writeFile(RECORD_PATH, markdown, 'utf8');
    console.log(`已写入 ${RECORD_PATH}`);
  } finally {
    await browser.close();
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
