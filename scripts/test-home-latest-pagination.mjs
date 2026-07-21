import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const origin = process.env.HOME_TEST_ORIGIN || 'http://127.0.0.1:8791';
const outputDir = path.resolve('artifacts', 'home-latest-pagination');

function makeFolders(count, start = 0) {
  return Array.from({ length: count }, (_, index) => {
    const number = start + index;
    return {
      id: `folder_${String(number).padStart(4, '0')}`,
      slug: `test-${number}`,
      name: `测试作品 ${number}`,
      description: `分页测试 ${number}`,
      ownerName: '测试用户',
      count: 1,
      viewCount: number,
      publishedAt: new Date(Date.UTC(2026, 0, 1, 0, 0, 0) - number * 1000).toISOString(),
      updatedAt: new Date(Date.UTC(2026, 0, 1, 0, 0, 0) - number * 1000).toISOString(),
      coverUrl: '',
      coverMediaKind: 'image'
    };
  });
}

function bootstrapPayload(folders, total) {
  return {
    site: { name: '分页测试', totalCategories: total, totalAssets: total },
    viewer: null,
    folders,
    foldersTotal: total,
    announcements: [],
    siteNotice: {}
  };
}

async function installApiMock(page, total, bootstrapCount = Math.min(total, 500), { failOnceAt = null } = {}) {
  const allFolders = makeFolders(total);
  const offsets = [];
  let failed = false;
  await page.route('**/api/bootstrap', route => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify(bootstrapPayload(allFolders.slice(0, bootstrapCount), total))
  }));
  await page.route('**/api/public/folders?*', route => {
    const url = new URL(route.request().url());
    const offset = Number(url.searchParams.get('offset') || 0);
    const limit = Number(url.searchParams.get('limit') || 24);
    offsets.push(offset);
    if (offset === failOnceAt && !failed) {
      failed = true;
      return route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: '模拟分页失败' }) });
    }
    const folders = allFolders.slice(offset, offset + limit);
    return route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ folders, offset, limit, total, hasMore: offset + folders.length < total })
    });
  });
  return offsets;
}

async function openLatest(page) {
  await page.goto(origin, { waitUntil: 'domcontentloaded' });
  await page.locator('[data-beta-channel="latest"]').click();
  await page.waitForSelector('.beta-folder-card');
}

async function shownCount(page) {
  return page.locator('.beta-folder-card').count();
}

async function testCurrent141(browser) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const offsets = await installApiMock(page, 141, 141);
  await openLatest(page);
  await page.screenshot({ path: path.join(outputDir, 'latest-390-initial.png'), fullPage: true });
  const initialMetrics = await page.evaluate(() => ({
    viewportWidth: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    buttonHeight: document.querySelector('[data-beta-load-more]').getBoundingClientRect().height
  }));
  assert.ok(initialMetrics.scrollWidth <= initialMetrics.viewportWidth, '390px 首页不得横向溢出');
  assert.ok(initialMetrics.buttonHeight >= 44, '加载更多按钮高度不得小于 44px');
  await page.keyboard.press('Tab');
  await page.locator('[data-beta-load-more]').focus();
  assert.equal(await page.locator('[data-beta-load-more]').evaluate(button => button.matches(':focus-visible')), true);
  await page.locator('#theme-toggle').click();
  await page.screenshot({ path: path.join(outputDir, 'latest-390-dark.png'), fullPage: true });
  await page.locator('#theme-toggle').click();
  const sequence = [24];
  while (await page.locator('[data-beta-load-more]').count()) {
    await page.locator('[data-beta-load-more]').click();
    sequence.push(await shownCount(page));
  }
  assert.deepEqual(sequence, [24, 48, 72, 96, 120, 141]);
  assert.equal(await page.locator('.beta-load-more-complete').innerText(), '已展示全部 141 个作品');
  assert.deepEqual(offsets, [], '141 个作品不应额外请求分页 API');

  await page.locator('[data-beta-channel="popular"]').click();
  await page.locator('[data-beta-channel="latest"]').click();
  assert.equal(await shownCount(page), 24, '频道切换后必须重置为 24 个');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.screenshot({ path: path.join(outputDir, 'latest-1440-initial.png'), fullPage: true });
  await page.locator('#beta-search-input').fill('测试作品 1');
  await page.locator('#beta-search-form').press('Enter');
  assert.ok(await shownCount(page) <= 24, '搜索结果必须从最多 24 个开始');
  await page.locator('#beta-search-input').fill('');
  assert.equal(await shownCount(page), 24, '清空搜索后必须重置为 24 个');
  await page.close();
  return sequence;
}

async function testBeyond500(browser) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const offsets = await installApiMock(page, 760, 500, { failOnceAt: 500 });
  await openLatest(page);
  let clicks = 0;
  let sawRetryError = false;
  while (await page.locator('[data-beta-load-more]').count()) {
    await page.locator('[data-beta-load-more]').click();
    await page.waitForFunction(() => document.querySelector('[data-beta-load-more]')?.getAttribute('aria-busy') !== 'true');
    if (await page.locator('.beta-load-more-error').count()) {
      sawRetryError = true;
      assert.equal(await shownCount(page), 500, '分页失败不得清空已展示作品');
    }
    clicks += 1;
    assert.ok(clicks < 40, '分页按钮未能收敛到全部展示状态');
  }
  assert.equal(await shownCount(page), 760);
  assert.equal(await page.locator('.beta-load-more-complete').innerText(), '已展示全部 760 个作品');
  assert.equal(sawRetryError, true, '分页失败必须展示可重试错误');
  assert.deepEqual(offsets, [500, 500, 600, 700]);
  const ids = await page.locator('.beta-folder-card').evaluateAll(cards => cards.map(card => card.getAttribute('href')));
  assert.equal(new Set(ids).size, 760, '分页结果不得出现重复作品');
  await page.close();
  return { clicks, offsets };
}

async function main() {
  await mkdir(outputDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  try {
    const current = await testCurrent141(browser);
    const beyond500 = await testBeyond500(browser);
    console.log(JSON.stringify({ current, beyond500 }, null, 2));
  } finally {
    await browser.close();
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
