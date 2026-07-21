const SESSION_COOKIE = 'mmc_session';
const SESSION_TTL_DAYS = 14;
const SESSION_LAST_SEEN_WRITE_INTERVAL_MS = 30 * 60 * 1000;
const DATABASE_MAINTENANCE_TIMEZONE = 'Asia/Shanghai';
const DATABASE_GROWTH_ALERT_BYTES = 1024 * 1024;
const DATABASE_GROWTH_ALERT_RATIO = 0.2;
const EXPIRED_SESSION_ALERT_COUNT = 1000;
const MAX_FILES_PER_FOLDER = 60;
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const UPLOAD_R2_CONCURRENCY = 3;
const REMOVE_BG_FREE_DAILY_LIMIT = 10;
const REMOVE_BG_MEMBER_DAILY_LIMIT = 10000;
const REMOVE_BG_MEMBER_PLAN_CODE = 'remove_bg_member';
const REMOVE_BG_MEMBER_PRODUCT_CODE = 'remove_bg_member_monthly';
const AI_API_MEMBER_PRODUCT_CODE = 'ai_api_member_monthly';
const AI_API_BALANCE_1_PRODUCT_CODE = 'ai_api_balance_1';
const AI_API_BALANCE_10_PRODUCT_CODE = 'ai_api_balance_10';
const REMOVE_BG_TIMEZONE = 'Asia/Shanghai';
const ALIPAY_GATEWAY_URL = 'https://openapi.alipay.com/gateway.do';
const AI_CHAT_API_URL = 'https://platform.aitools.cfd/api/v1/chat/completions';
const MEMBER_SHOP_URL_FALLBACK = 'https://your-shop.example/product/remove-bg-member';
// Maintainer-published demo upstream key. Production deployments should set
// AI_CHAT_API_KEY as a Cloudflare Secret because this fallback may be limited,
// rotated, or disabled without notice.
const AI_CHAT_API_KEY_FALLBACK = 'sk-7407235b71ce46e28a619503532f7abc';
const AI_CHAT_TEXT_MODELS = new Set([
  'zhipu/glm-4-flash',
  'qwen/qwen3-8b',
  'qwen/qwen2.5-7b',
  'google/gemma-3-27b'
]);
const AI_CHAT_VISION_MODELS = new Set([
  'zhipu/glm-4v-flash',
  'zhipu/glm-4.1v-thinking-flash',
  'zhipu/glm-4.6v-flash'
]);
const AI_API_TIMEZONE = 'Asia/Shanghai';
const AI_API_FREE_DAILY_LIMIT = 50;
const AI_API_MEMBER_DAILY_LIMIT = 500;
const AI_API_FREE_OVERAGE_PRICE = '0.003';
const AI_API_MEMBER_OVERAGE_PRICE = '0.001';
const AI_API_MEMBER_DURATION_DAYS = 30;
const AI_API_FREE_KEY_LIMIT = 10;
const AI_API_MEMBER_KEY_LIMIT = 100;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const ALLOWED_VIDEO_TYPES = new Set(['video/mp4', 'video/webm', 'video/quicktime']);
const INSPIRATION_TOOLS = [
  { id: 'poem', name: '来句诗', category: '文案灵感', type: 'text', url: 'https://api.tangdouz.com/a/poetrand.php', params: {}, parse: '', description: '随机挑一句诗词。' },
  { id: 'quote', name: '来点文案', category: '文案灵感', type: 'text', url: 'https://api.tangdouz.com/a/refuel.php', params: { f: '哲理' }, parse: '', description: '生成一段适合发动态的短文案。' },
  { id: 'gentle', name: '温柔一句', category: '文案灵感', type: 'text', url: 'https://api.yuafeng.cn/API/ly/wenrou.php', params: { type: 'json' }, parse: 'Msg', description: '随机温柔短句。' },
  { id: 'phone-area', name: '号码归属地', category: '生活小帮手', type: 'text', url: 'https://free.wqwlkj.cn/wqwlapi/phone_area.php', params: { phone: '' }, parse: 'data', description: '输入手机号查询归属地。', fields: [{ key: 'phone', label: '手机号', placeholder: '请输入手机号' }] },
  { id: 'gpu-rank', name: '显卡排行榜', category: '生活小帮手', type: 'text', url: 'https://api.tangdouz.com/a/gpu.php', params: { f: 'desktop' }, parse: '', description: '查看当前显卡排行。' },
  { id: 'wallpaper', name: '电脑壁纸', category: '图片灵感', type: 'image', url: 'https://api.yuafeng.cn/API/dnbz/api.php', params: {}, parse: '', description: '随机电脑壁纸。', inlineMedia: true },
  { id: 'bing', name: '今日美图', category: '图片灵感', type: 'image', url: 'https://free.wqwlkj.cn/wqwlapi/bing.php', params: {}, parse: 'img', description: '随机展示一张风景美图。' },
  { id: 'qrcode', name: '二维码生成', category: '生活小帮手', type: 'image', url: 'https://api.yuafeng.cn/API/ly/qrcode.php', params: { text: '' }, parse: '', description: '把文字或链接生成二维码。', fields: [{ key: 'text', label: '内容', placeholder: '输入文字或链接' }] },
  { id: 'meme-search', name: '搜表情', category: '图片灵感', type: 'image', url: 'https://api.tangdouz.com/a/biaoq.php', params: { nr: '', return: 'text' }, parse: '', description: '输入关键词找一张表情图。', fields: [{ key: 'nr', label: '关键词', placeholder: '例如 开心' }] }
];
const SOFTWARE_RELEASE_CHANNELS = new Set(['prod', 'test', 'dev']);
const SOFTWARE_RELEASE_SEVERITIES = new Set(['normal', 'recommended', 'critical']);
const SITE_DEFAULT_NAME = '猫猫虫咖波表情包仓库';
const SEO_FIXED_PAGES = [
  { path: '/', title: SITE_DEFAULT_NAME, description: '猫猫虫咖波表情包仓库，按分类浏览和搜索图片、表情包与视频内容，支持预览、收藏、评论与下载。', priority: '1.0', changefreq: 'daily' },
  { path: '/site-info', title: `${SITE_DEFAULT_NAME} - 站内公告与站务`, description: '查看猫猫虫咖波表情包仓库的站内公告、投稿说明、侵权删除方式和站务信息。', priority: '0.7', changefreq: 'weekly' },
  { path: '/app', title: `${SITE_DEFAULT_NAME} - 安卓 APP 下载`, description: '下载猫猫虫咖波表情包仓库安卓 APP，支持手机端浏览、预览、投稿和下载。', priority: '0.8', changefreq: 'weekly' },
  { path: '/tools/list', title: `${SITE_DEFAULT_NAME} - 工具列表`, description: '猫猫虫咖波表情包仓库工具列表，集中进入 AI 聊天、AI 抠图、慢慢听歌、咖波节奏拍、咖波讯息贴图制作器、灵感工坊和趣味测试。', priority: '0.8', changefreq: 'weekly' }
];
const SEO_TOOL_PAGES = [
  { path: '/tools/remove-bg', title: `${SITE_DEFAULT_NAME} - AI 抠图`, description: '上传图片后在浏览器内完成 AI 抠图和去背景预览，登录用户可按每日额度下载结果。', priority: '0.7', changefreq: 'weekly' },
  { path: '/tools/ai-chat', title: `${SITE_DEFAULT_NAME} - AI 聊天`, description: '站内 AI 聊天工具，可咨询网站使用问题、分析图片内容、辅助表情包命名和分类说明。', priority: '0.7', changefreq: 'weekly' },
  { path: '/tools/music', title: `${SITE_DEFAULT_NAME} - 慢慢听歌`, description: '慢慢听歌是站内音乐播放器，支持歌曲搜索、播放、收藏、历史记录和歌词查看。', priority: '0.7', changefreq: 'weekly' },
  { path: '/tools/inspiration', title: `${SITE_DEFAULT_NAME} - 灵感工坊`, description: '灵感工坊提供随机文案、每日早报、壁纸、二维码、号码归属地和显卡排行等轻量工具。', priority: '0.7', changefreq: 'weekly' },
  { path: '/tools/link-match', title: `${SITE_DEFAULT_NAME} - 咖波连连看`, description: '咖波连连看使用站内公开表情包生成牌面，支持限时连线消除、提示、洗牌和分数记录。', priority: '0.7', changefreq: 'weekly' },
  { path: '/tools/capoo-tap/', title: `${SITE_DEFAULT_NAME} - 咖波节奏拍`, description: '点按或滑过全屏分区，让咖波跟着节拍发声并触发几何特效。', priority: '0.7', changefreq: 'weekly' },
  { path: '/tools/capoo-message-sticker/', title: '咖波讯息贴图制作器 - 猫猫虫咖波表情包仓库', description: '选择咖波贴图和字体，输入自己的文字，实时预览并下载透明 GIF。', priority: '0.7', changefreq: 'weekly' }
];
const SEO_TEST_PAGES = [
  { path: '/tools/sbti/', title: 'SBTI 人格测试', description: 'SBTI 人格测试是轻松向人格测试，完成题目后查看人格代号、结果说明和维度评分。', priority: '0.6', changefreq: 'monthly' },
  { path: '/tools/csti/', title: 'CSTI 人格测试', description: 'CSTI 人格测试是一套偏 CS 对局风格的趣味测试，完成题项后查看你的游戏人格画像。', priority: '0.6', changefreq: 'monthly' },
  { path: '/tools/ysti/', title: 'YSTI 原神人格测试', description: 'YSTI 原神人格测试包含 30 道题，测出你在提瓦特大陆的风格画像和角色倾向。', priority: '0.6', changefreq: 'monthly' }
];
const SEO_PRIVATE_SPA_PAGES = new Map([
  ['/dashboard', { title: `${SITE_DEFAULT_NAME} - 后台工作台`, description: '后台工作台用于投稿管理、审核、公告和站务处理。', noindex: true }],
  ['/profile', { title: `${SITE_DEFAULT_NAME} - 个人中心登录`, description: '登录或注册后进入个人中心，管理投稿、收藏、评论和个人资料。', noindex: true }],
  ['/tools/ai-api', { title: `${SITE_DEFAULT_NAME} - AI 对话 API 申请`, description: '登录后可申请本站 AI 对话 API Key，查看调用额度和余额。', noindex: true }]
]);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const startedAt = performance.now();

    if (request.method === 'OPTIONS') {
      return withCors(new Response(null, { status: 204 }));
    }

    try {
      // Android APP 下载路由（公开访问）
      if (url.pathname.startsWith('/downloads/maomaochong-android/')) {
        return await handleAndroidDownload(request, env, url);
      }

      if (url.pathname.startsWith('/api/')) {
        return withCors(withServerTiming(await handleApi(request, env, url), startedAt));
      }

      if (url.pathname.startsWith('/media/')) {
        return await handleMedia(request, env, url);
      }

      if (url.pathname === '/robots.txt') {
        return handleRobots(request, env, url);
      }

      if (url.pathname === '/sitemap.xml') {
        return await handleSitemap(request, env, url);
      }

      const seoResponse = await handleSeoHtml(request, env, url);
      if (seoResponse) {
        return seoResponse;
      }

      const assetResponse = await env.ASSETS.fetch(request);
      if (url.pathname.startsWith('/models/')) {
        const headers = new Headers(assetResponse.headers);
        headers.set('cache-control', 'public, max-age=31536000, immutable');
        return new Response(assetResponse.body, {
          status: assetResponse.status,
          headers
        });
      }
      return assetResponse;
    } catch (error) {
      console.error(error);
      const status = error instanceof HttpError ? error.status : 500;
      return withCors(withServerTiming(json({ error: error.message || '服务器开小差了，请稍后再试。' }, status), startedAt));
    }
  },

  scheduled(controller, env, ctx) {
    ctx.waitUntil(runDatabaseMaintenance(env, controller.scheduledTime));
  }
};

export async function runDatabaseMaintenance(env, scheduledTime) {
  const startedAt = Date.now();
  const scheduledDate = new Date(Number.isFinite(scheduledTime) ? scheduledTime : Date.now());
  const cutoffIso = scheduledDate.toISOString();

  try {
    const sessionStats = await env.MMC_DB.prepare(
      `SELECT COUNT(*) AS sessions_count,
              SUM(CASE WHEN expires_at <= ? THEN 1 ELSE 0 END) AS expired_sessions
       FROM sessions`
    ).bind(cutoffIso).first();
    const expiredSessionsBeforeCleanup = Number(sessionStats?.expired_sessions || 0);
    const cleanupResult = await cleanupExpiredSessions(env, cutoffIso);
    const deletedSessions = Number(cleanupResult?.meta?.changes || 0);
    const databaseSizeBytes = Number(cleanupResult?.meta?.size_after || 0);
    const sessionsCount = Math.max(0, Number(sessionStats?.sessions_count || 0) - deletedSessions);
    const monthlyMetric = await recordMonthlyDatabaseMetric(
      env,
      scheduledDate,
      expiredSessionsBeforeCleanup,
      databaseSizeBytes
    );
    const r2Metric = await recordMonthlyR2Metric(env, scheduledDate);
    const alerts = [...monthlyMetric.alerts];
    alerts.push(...(r2Metric.alerts || []));
    if (expiredSessionsBeforeCleanup > EXPIRED_SESSION_ALERT_COUNT) {
      alerts.push('expired_sessions_over_1000');
    }

    const logEntry = {
      event: 'd1_maintenance',
      status: 'ok',
      measuredAt: cutoffIso,
      cutoffIso,
      durationMs: Date.now() - startedAt,
      deletedSessions,
      expiredSessionsBeforeCleanup,
      monthlyMetricWritten: monthlyMetric.written,
      databaseSizeBytes: monthlyMetric.databaseSizeBytes || databaseSizeBytes,
      assetsCount: monthlyMetric.assetsCount,
      sessionsCount: monthlyMetric.sessionsCount ?? sessionsCount,
      growthBytes: monthlyMetric.growthBytes,
      growthRatio: monthlyMetric.growthRatio,
      alerts,
      r2Metric
    };
    if (alerts.length) {
      console.warn(JSON.stringify(logEntry));
    } else {
      console.log(JSON.stringify(logEntry));
    }
    return logEntry;
  } catch (error) {
    console.error(JSON.stringify({
      event: 'd1_maintenance',
      status: 'error',
      measuredAt: cutoffIso,
      durationMs: Date.now() - startedAt,
      error: error?.message || String(error)
    }));
    throw error;
  }
}

async function recordMonthlyR2Metric(env, date) {
  const localDate = getLocalDateStringFromDate(date, DATABASE_MAINTENANCE_TIMEZONE);
  if (!localDate.endsWith('-01')) return { written: false, alerts: [] };
  const month = localDate.slice(0, 7);
  try {
    const objects = [];
    let cursor = '';
    do {
      const page = await env.MMC_MEDIA.list({ limit: 1000, ...(cursor ? { cursor } : {}) });
      objects.push(...(page.objects || []));
      cursor = page.truncated ? page.cursor : '';
    } while (cursor);
    const refs = new Set();
    let refCursor = 0;
    while (true) {
      const result = await env.MMC_DB.prepare('SELECT r2_key FROM assets LIMIT 1000 OFFSET ?').bind(refCursor).all();
      const rows = result.results || [];
      rows.forEach(row => refs.add(row.r2_key));
      if (rows.length < 1000) break;
      refCursor += rows.length;
    }
    const protectedCount = objects.filter(object => object.key.startsWith('downloads/android/')).filter(object => !refs.has(object.key)).length;
    const unreferenced = objects.filter(object => !refs.has(object.key));
    const measuredAt = date.toISOString();
    await env.MMC_DB.prepare(`INSERT INTO r2_monthly_metrics (month, measured_at, object_count, total_bytes, referenced_count, unreferenced_count, unreferenced_bytes, protected_unreferenced_count, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(month) DO UPDATE SET measured_at=excluded.measured_at, object_count=excluded.object_count, total_bytes=excluded.total_bytes, referenced_count=excluded.referenced_count, unreferenced_count=excluded.unreferenced_count, unreferenced_bytes=excluded.unreferenced_bytes, protected_unreferenced_count=excluded.protected_unreferenced_count, updated_at=excluded.updated_at`).bind(month, measuredAt, objects.length, objects.reduce((sum, item) => sum + Number(item.size || 0), 0), objects.length - unreferenced.length, unreferenced.length, unreferenced.reduce((sum, item) => sum + Number(item.size || 0), 0), protectedCount, measuredAt, measuredAt).run();
    const alerts = [];
    if (unreferenced.length > 1000) alerts.push('r2_unreferenced_over_1000');
    return { written: true, objectCount: objects.length, unreferencedCount: unreferenced.length, unreferencedBytes: unreferenced.reduce((sum, item) => sum + Number(item.size || 0), 0), alerts };
  } catch (error) {
    console.error(JSON.stringify({ event: 'r2_metric_error', error: error?.message || String(error) }));
    return { written: false, error: error?.message || String(error), alerts: ['r2_metric_error'] };
  }
}

export async function cleanupExpiredSessions(env, cutoffIso) {
  return env.MMC_DB.prepare(
    'DELETE FROM sessions WHERE expires_at <= ?'
  ).bind(cutoffIso).run();
}

export async function recordMonthlyDatabaseMetric(env, date, expiredBeforeCleanup, sizeAfterCleanup = 0) {
  const localDate = getLocalDateStringFromDate(date, DATABASE_MAINTENANCE_TIMEZONE);
  if (!localDate.endsWith('-01')) {
    return emptyMonthlyMetric(sizeAfterCleanup);
  }

  const month = localDate.slice(0, 7);
  const measuredAt = date.toISOString();
  const [assetsResult, sessionsResult] = await env.MMC_DB.batch([
    env.MMC_DB.prepare('SELECT COUNT(*) AS count FROM assets'),
    env.MMC_DB.prepare('SELECT COUNT(*) AS count FROM sessions')
  ]);
  const assetsCount = Number(assetsResult?.results?.[0]?.count || 0);
  const sessionsCount = Number(sessionsResult?.results?.[0]?.count || 0);
  const databaseSizeBytes = Number(
    sessionsResult?.meta?.size_after || assetsResult?.meta?.size_after || sizeAfterCleanup || 0
  );
  const previousResult = await env.MMC_DB.prepare(
    `SELECT month, database_size_bytes
     FROM database_monthly_metrics
     WHERE month < ?
     ORDER BY month DESC
     LIMIT 2`
  ).bind(month).all();
  const growth = calculateDatabaseGrowth(previousResult?.results || [], databaseSizeBytes);

  await env.MMC_DB.prepare(
    `INSERT INTO database_monthly_metrics (
       month, measured_at, database_size_bytes, assets_count, sessions_count,
       expired_sessions_before_cleanup, created_at, updated_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(month) DO UPDATE SET
       measured_at = excluded.measured_at,
       database_size_bytes = excluded.database_size_bytes,
       assets_count = excluded.assets_count,
       sessions_count = excluded.sessions_count,
       expired_sessions_before_cleanup = excluded.expired_sessions_before_cleanup,
       updated_at = excluded.updated_at`
  ).bind(
    month,
    measuredAt,
    databaseSizeBytes,
    assetsCount,
    sessionsCount,
    Number(expiredBeforeCleanup || 0),
    measuredAt,
    measuredAt
  ).run();

  return {
    written: true,
    databaseSizeBytes,
    assetsCount,
    sessionsCount,
    growthBytes: growth.growthBytes,
    growthRatio: growth.growthRatio,
    alerts: growth.alerts
  };
}

function emptyMonthlyMetric(databaseSizeBytes = 0) {
  return {
    written: false,
    databaseSizeBytes: Number(databaseSizeBytes || 0),
    assetsCount: null,
    sessionsCount: null,
    growthBytes: null,
    growthRatio: null,
    alerts: []
  };
}

export function calculateDatabaseGrowth(previousRows, currentSize) {
  const previousSize = Number(previousRows?.[0]?.database_size_bytes || 0);
  const priorSize = Number(previousRows?.[1]?.database_size_bytes || 0);
  const growthBytes = previousSize > 0 ? Number(currentSize || 0) - previousSize : null;
  const growthRatio = previousSize > 0 ? growthBytes / previousSize : null;
  const previousGrowthRatio = priorSize > 0 ? (previousSize - priorSize) / priorSize : null;
  const alerts = [];
  if (growthBytes !== null && growthBytes > DATABASE_GROWTH_ALERT_BYTES) {
    alerts.push('database_growth_over_1mib');
  }
  if (
    growthRatio !== null && growthRatio > DATABASE_GROWTH_ALERT_RATIO &&
    previousGrowthRatio !== null && previousGrowthRatio > DATABASE_GROWTH_ALERT_RATIO
  ) {
    alerts.push('database_growth_over_20_percent_two_months');
  }
  return { growthBytes, growthRatio, previousGrowthRatio, alerts };
}

async function handleApi(request, env, url) {
  const pathname = url.pathname;
  const method = request.method.toUpperCase();

  if (pathname === '/api/health' && method === 'GET') {
    return json({ ok: true, now: new Date().toISOString() });
  }

  if (pathname === '/api/bootstrap' && method === 'GET') {
    return json(await getBootstrapPayload(request, env));
  }

  const softwareUpdateMatch = pathname.match(/^\/api\/software-updates\/([^/]+)$/);
  if (softwareUpdateMatch && method === 'GET') {
    return json(await getSoftwareUpdatePayload(env, softwareUpdateMatch[1], url.searchParams));
  }

  if (pathname === '/api/auth/session' && method === 'GET') {
    const session = await requireOptionalSession(request, env);
    return json({ user: session?.user ? serializeUser(session.user) : null });
  }

  if (pathname === '/api/auth/register' && method === 'POST') {
    const body = await readJson(request);
    return json(await registerUser(body, env));
  }

  if (pathname === '/api/auth/login' && method === 'POST') {
    const body = await readJson(request);
    return await loginUser(body, env);
  }

  if (pathname === '/api/auth/logout' && method === 'POST') {
    return await logoutUser(request, env);
  }

  if (pathname === '/api/profile/me' && method === 'GET') {
    const session = await requireSession(request, env);
    return json(await getOwnProfile(env, session.user));
  }

  if (pathname === '/api/profile/me' && method === 'PUT') {
    const session = await requireSession(request, env);
    const body = await readJson(request);
    return json(await updateOwnProfile(env, session.user, body));
  }

  if (pathname === '/api/profile/export' && method === 'POST') {
    const session = await requireSession(request, env);
    const body = await readJson(request);
    return json(await verifyProfileExportPassword(env, session.user, body));
  }

  if (pathname === '/api/favorites' && method === 'GET') {
    const session = await requireSession(request, env);
    return json({ favorites: await getFavoriteFolders(env, session.user.id) });
  }

  const favoriteMatch = pathname.match(/^\/api\/favorites\/([^/]+)$/);
  if (favoriteMatch && method === 'POST') {
    const session = await requireSession(request, env);
    return json(await addFavoriteFolder(env, session.user.id, decodeURIComponent(favoriteMatch[1])));
  }
  if (favoriteMatch && method === 'DELETE') {
    const session = await requireSession(request, env);
    return json(await removeFavoriteFolder(env, session.user.id, decodeURIComponent(favoriteMatch[1])));
  }

  const folderLikeMatch = pathname.match(/^\/api\/public\/folders\/([^/]+)\/like$/);
  if (folderLikeMatch && method === 'POST') {
    const session = await requireSession(request, env);
    return json(await addFolderLike(env, session.user.id, decodeURIComponent(folderLikeMatch[1])));
  }
  if (folderLikeMatch && method === 'DELETE') {
    const session = await requireSession(request, env);
    return json(await removeFolderLike(env, session.user.id, decodeURIComponent(folderLikeMatch[1])));
  }

  const profileFollowMatch = pathname.match(/^\/api\/profile\/(\d+)\/follow$/);
  if (profileFollowMatch && method === 'POST') {
    const session = await requireSession(request, env);
    return json(await followProfile(env, session.user.id, Number(profileFollowMatch[1])));
  }
  if (profileFollowMatch && method === 'DELETE') {
    const session = await requireSession(request, env);
    return json(await unfollowProfile(env, session.user.id, Number(profileFollowMatch[1])));
  }

  const profileMatch = pathname.match(/^\/api\/profile\/(\d+)$/);
  if (profileMatch && method === 'GET') {
    const session = await requireOptionalSession(request, env);
    return json(await getPublicProfile(env, Number(profileMatch[1]), session?.user || null));
  }

  if (pathname === '/api/tools/remove-bg/access' && method === 'GET') {
    const session = await requireOptionalSession(request, env);
    return json(await getRemoveBgAccessPayload(env, session?.user || null));
  }

  if (pathname === '/api/tools/remove-bg/download' && method === 'POST') {
    const session = await requireSession(request, env);
    return json(await consumeRemoveBgDownload(env, session.user));
  }

  if (pathname === '/api/tools/remove-bg/redeem' && method === 'POST') {
    const session = await requireSession(request, env);
    const body = await readJson(request);
    return json(await redeemRemoveBgCode(env, session.user, body));
  }

  if (pathname === '/api/tools/ai-chat' && method === 'POST') {
    const body = await readJson(request);
    return json(await proxyAiChat(env, body));
  }

  if (pathname === '/api/tools/inspiration/list' && method === 'GET') {
    return json({ tools: listInspirationTools() });
  }

  if (pathname === '/api/tools/inspiration/generate' && method === 'POST') {
    const body = await readJson(request);
    return json(await generateInspiration(body));
  }

  if (pathname === '/api/dashboard/ai-api' && method === 'GET') {
    const session = await requireSession(request, env);
    return json(await getAiApiDashboard(env, session.user));
  }

  if (pathname === '/api/dashboard/ai-api/key' && method === 'POST') {
    const session = await requireSession(request, env);
    const body = await readJson(request);
    return json(await createAiApiKey(env, session.user, body));
  }

  if (pathname === '/api/dashboard/ai-api/redeem' && method === 'POST') {
    const session = await requireSession(request, env);
    const body = await readJson(request);
    return json(await redeemAiApiCode(env, session.user, body));
  }

  const dashboardAiApiKeyMatch = pathname.match(/^\/api\/dashboard\/ai-api\/key\/([^/]+)$/);
  if (dashboardAiApiKeyMatch && method === 'PATCH') {
    const session = await requireSession(request, env);
    const body = await readJson(request);
    return json(await updateAiApiKey(env, session.user, dashboardAiApiKeyMatch[1], body));
  }

  const dashboardAiApiKeyResetMatch = pathname.match(/^\/api\/dashboard\/ai-api\/key\/([^/]+)\/reset$/);
  if (dashboardAiApiKeyResetMatch && method === 'POST') {
    const session = await requireSession(request, env);
    return json(await resetAiApiKey(env, session.user, dashboardAiApiKeyResetMatch[1]));
  }

  if (pathname === '/api/open/ai-chat' && method === 'POST') {
    const body = await readJson(request);
    return json(await handleOpenAiChatApi(request, env, body));
  }

  if (pathname === '/api/billing/alipay/create-order' && method === 'POST') {
    const session = await requireSession(request, env);
    return json(await createAlipayRemoveBgOrder(request, env, session.user));
  }

  if (pathname === '/api/billing/alipay/notify' && method === 'POST') {
    return await handleAlipayNotify(request, env);
  }

  if (pathname === '/api/dashboard/folders' && method === 'GET') {
    const session = await requireSession(request, env);
    return json({ folders: await getFoldersForUser(env, session.user.id) });
  }

  if (pathname === '/api/dashboard/folders' && method === 'POST') {
    const session = await requireSession(request, env);
    return json(await createFolderWithAssets(request, env, session.user));
  }

  const dashboardFolderAssetsMatch = pathname.match(/^\/api\/dashboard\/folders\/([^/]+)\/assets$/);
  if (dashboardFolderAssetsMatch && method === 'POST') {
    const session = await requireSession(request, env);
    return json(await appendAssetsToFolder(request, env, session.user, dashboardFolderAssetsMatch[1]));
  }

  const dashboardFolderAssetDeleteMatch = pathname.match(/^\/api\/dashboard\/folders\/([^/]+)\/assets\/([^/]+)$/);
  if (dashboardFolderAssetDeleteMatch && method === 'DELETE') {
    const session = await requireSession(request, env);
    return json(await deleteAssetFromFolder(env, session.user, dashboardFolderAssetDeleteMatch[1], dashboardFolderAssetDeleteMatch[2]));
  }

  const dashboardFolderResubmitMatch = pathname.match(/^\/api\/dashboard\/folders\/([^/]+)\/resubmit$/);
  if (dashboardFolderResubmitMatch && method === 'POST') {
    const session = await requireSession(request, env);
    return json(await resubmitFolderForReview(env, session.user, dashboardFolderResubmitMatch[1]));
  }

  if (pathname === '/api/admin/reviews' && method === 'GET') {
    const session = await requireRole(request, env, ['admin', 'owner']);
    return json({ folders: await getReviewQueue(env), viewer: serializeUser(session.user) });
  }

  if (pathname === '/api/admin/users' && method === 'GET') {
    const session = await requireRole(request, env, ['owner']);
    return json({ users: await getUsersForOwner(env), viewer: serializeUser(session.user) });
  }

  if (pathname === '/api/admin/remove-bg/redeem-codes' && method === 'GET') {
    await requireRole(request, env, ['owner']);
    return json({ codes: await getRemoveBgRedeemCodes(env) });
  }

  if (pathname === '/api/admin/remove-bg/redeem-codes' && method === 'POST') {
    const session = await requireRole(request, env, ['owner']);
    const body = await readJson(request);
    return json(await addRemoveBgRedeemCodes(env, session.user, body));
  }

  if (pathname === '/api/admin/ai-api/users' && method === 'GET') {
    await requireRole(request, env, ['owner']);
    return json({ users: await getAiApiUsersForOwner(env) });
  }

  const aiApiRechargeMatch = pathname.match(/^\/api\/admin\/ai-api\/users\/([^/]+)\/recharge$/);
  if (aiApiRechargeMatch && method === 'POST') {
    const session = await requireRole(request, env, ['owner']);
    const body = await readJson(request);
    return json(await rechargeAiApiBalance(env, session.user, aiApiRechargeMatch[1], body));
  }

  const aiApiMemberMatch = pathname.match(/^\/api\/admin\/ai-api\/users\/([^/]+)\/membership$/);
  if (aiApiMemberMatch && method === 'POST') {
    const session = await requireRole(request, env, ['owner']);
    const body = await readJson(request);
    return json(await grantAiApiMembership(env, session.user, aiApiMemberMatch[1], body));
  }

  if (pathname === '/api/admin/folders' && method === 'GET') {
    const session = await requireRole(request, env, ['admin', 'owner']);
    return json({
      folders: await getFoldersForAdmin(env, session.user, {
        limit: url.searchParams.get('limit'),
        search: url.searchParams.get('search')
      })
    });
  }

  const adminFolderDetailMatch = pathname.match(/^\/api\/admin\/folders\/([^/]+)$/);
  if (adminFolderDetailMatch && method === 'GET') {
    const session = await requireRole(request, env, ['admin', 'owner']);
    return json({ folder: await getFolderById(env, adminFolderDetailMatch[1], session.user) });
  }

  const adminFolderViewBoostMatch = pathname.match(/^\/api\/admin\/folders\/([^/]+)\/view-boost$/);
  if (adminFolderViewBoostMatch && method === 'POST') {
    const session = await requireRole(request, env, ['owner']);
    return json(await promoteFolderViewBoost(env, session.user, decodeURIComponent(adminFolderViewBoostMatch[1])));
  }

  if (pathname === '/api/admin/announcements' && method === 'GET') {
    await requireRole(request, env, ['admin', 'owner']);
    return json({ announcements: await getAnnouncements(env, false) });
  }

  if (pathname === '/api/admin/announcements' && method === 'POST') {
    const session = await requireRole(request, env, ['admin', 'owner']);
    const body = await readJson(request);
    return json(await upsertAnnouncement(env, session.user.id, body));
  }

  if (pathname === '/api/admin/software-updates' && method === 'GET') {
    await requireRole(request, env, ['admin', 'owner']);
    return json({
      releases: await getSoftwareReleases(env, {
        projectId: url.searchParams.get('projectId') || 'cs2-bot-improver',
        channel: url.searchParams.get('channel') || 'prod',
        activeOnly: false,
        limit: 100
      })
    });
  }

  if (pathname === '/api/admin/software-updates' && method === 'POST') {
    const session = await requireRole(request, env, ['admin', 'owner']);
    const body = await readJson(request);
    return json(await upsertSoftwareRelease(env, session.user.id, body));
  }

  if (pathname === '/api/admin/site-settings' && method === 'GET') {
    await requireRole(request, env, ['admin', 'owner']);
    return json(await getEditableSiteSettings(env));
  }

  if (pathname === '/api/admin/site-settings' && method === 'PUT') {
    const session = await requireRole(request, env, ['admin', 'owner']);
    const body = await readJson(request);
    return json(await saveSiteSettings(env, session.user.id, body));
  }

  if (pathname === '/api/admin/import/upload' && method === 'PUT') {
    requireImportToken(request, env);
    const key = String(url.searchParams.get('key') || '').trim();
    const contentType = String(url.searchParams.get('contentType') || 'application/octet-stream').trim();
    validateImportR2Key(key);
    validateImportContentType(contentType, key);
    const existing = await env.MMC_MEDIA.head(key);
    if (existing) throw new HttpError(409, '导入 key 已存在，拒绝覆盖。');
    await env.MMC_MEDIA.put(key, request.body, {
      httpMetadata: { contentType }
    });
    return json({ ok: true, key });
  }

  if (pathname === '/api/admin/import/r2-inventory' && method === 'GET') {
    requireImportToken(request, env);
    const limit = Math.min(1000, Math.max(1, Number(url.searchParams.get('limit') || 1000)));
    const cursor = String(url.searchParams.get('cursor') || '');
    const page = await env.MMC_MEDIA.list({ limit, ...(cursor ? { cursor } : {}) });
    return json({ objects: page.objects || [], truncated: Boolean(page.truncated), cursor: page.cursor || null });
  }

  if (pathname === '/api/admin/import/r2-object' && method === 'DELETE') {
    requireImportToken(request, env);
    const key = String(url.searchParams.get('key') || '').trim();
    validateImportR2Key(key);
    const referenced = await env.MMC_DB.prepare('SELECT 1 FROM assets WHERE r2_key = ? LIMIT 1').bind(key).first();
    if (referenced) throw new HttpError(409, '对象仍被 D1 引用，拒绝删除。');
    await env.MMC_MEDIA.delete(key);
    return json({ ok: true, key });
  }

  if (pathname === '/api/admin/import/check-slug' && method === 'GET') {
    requireImportToken(request, env);
    const slug = String(url.searchParams.get('slug') || '').trim();
    if (!slug) {
      throw new HttpError(400, '缺少 slug。');
    }
    const existing = await env.MMC_DB.prepare('SELECT id, slug FROM folders WHERE slug = ? LIMIT 1').bind(slug).first();
    return json({ ok: true, exists: Boolean(existing), folder: existing || null });
  }

  if (pathname === '/api/admin/import/folder' && method === 'POST') {
    requireImportToken(request, env);
    const body = await readJson(request);
    return json(await importLegacyFolder(env, body));
  }

  const reviewMatch = pathname.match(/^\/api\/admin\/reviews\/([^/]+)$/);
  if (reviewMatch && method === 'POST') {
    const session = await requireRole(request, env, ['admin', 'owner']);
    const body = await readJson(request);
    return json(await reviewFolder(env, session.user, reviewMatch[1], body));
  }

  const userRoleMatch = pathname.match(/^\/api\/admin\/users\/([^/]+)\/role$/);
  if (userRoleMatch && method === 'POST') {
    const session = await requireRole(request, env, ['owner']);
    const body = await readJson(request);
    return json(await changeUserRole(env, session.user, userRoleMatch[1], body));
  }

  const userDeleteMatch = pathname.match(/^\/api\/admin\/users\/([^/]+)$/);
  if (userDeleteMatch && method === 'DELETE') {
    const session = await requireRole(request, env, ['owner']);
    return json(await deleteUser(env, session.user, userDeleteMatch[1]));
  }

  const folderDeleteMatch = pathname.match(/^\/api\/admin\/folders\/([^/]+)$/);
  if (folderDeleteMatch && method === 'PUT') {
    const session = await requireRole(request, env, ['admin', 'owner']);
    const body = await readJson(request);
    return json(await updateFolderAsAdmin(env, session.user, folderDeleteMatch[1], body));
  }

  if (folderDeleteMatch && method === 'DELETE') {
    const session = await requireRole(request, env, ['admin', 'owner']);
    return json(await deleteFolder(env, session.user, folderDeleteMatch[1]));
  }

  const adminFolderAssetsMatch = pathname.match(/^\/api\/admin\/folders\/([^/]+)\/assets$/);
  if (adminFolderAssetsMatch && method === 'POST') {
    const session = await requireRole(request, env, ['admin', 'owner']);
    return json(await appendAssetsToFolderAsAdmin(request, env, session.user, adminFolderAssetsMatch[1]));
  }

  const adminFolderAssetDeleteMatch = pathname.match(/^\/api\/admin\/folders\/([^/]+)\/assets\/([^/]+)$/);
  if (adminFolderAssetDeleteMatch && method === 'DELETE') {
    const session = await requireRole(request, env, ['admin', 'owner']);
    return json(await deleteAssetFromFolderAsAdmin(env, session.user, adminFolderAssetDeleteMatch[1], adminFolderAssetDeleteMatch[2]));
  }

  const announcementMatch = pathname.match(/^\/api\/admin\/announcements\/([^/]+)$/);
  if (announcementMatch && method === 'DELETE') {
    await requireRole(request, env, ['admin', 'owner']);
    await env.MMC_DB.prepare('DELETE FROM announcements WHERE id = ?').bind(announcementMatch[1]).run();
    return json({ ok: true });
  }

  const softwareReleaseMatch = pathname.match(/^\/api\/admin\/software-updates\/([^/]+)$/);
  if (softwareReleaseMatch && method === 'DELETE') {
    await requireRole(request, env, ['admin', 'owner']);
    await env.MMC_DB.prepare('DELETE FROM software_releases WHERE id = ?').bind(softwareReleaseMatch[1]).run();
    return json({ ok: true });
  }

  const publicFolderMatch = pathname.match(/^\/api\/public\/folders\/(.+)$/);
  const folderCommentsMatch = pathname.match(/^\/api\/public\/folders\/([^/]+)\/comments$/);
  if (folderCommentsMatch && method === 'GET') {
    const session = await requireOptionalSession(request, env);
    return json({ comments: await getFolderComments(env, decodeURIComponent(folderCommentsMatch[1]), session?.user || null) });
  }
  if (folderCommentsMatch && method === 'POST') {
    const session = await requireSession(request, env);
    const body = await readJson(request);
    return json(await addFolderComment(env, session.user, decodeURIComponent(folderCommentsMatch[1]), body));
  }

  const folderCommentMatch = pathname.match(/^\/api\/comments\/([^/]+)$/);
  if (folderCommentMatch && method === 'DELETE') {
    const session = await requireSession(request, env);
    return json(await deleteFolderComment(env, session.user, decodeURIComponent(folderCommentMatch[1])));
  }

  if (publicFolderMatch && method === 'GET') {
    const session = await requireOptionalSession(request, env);
    return json(await getPublicFolderBySlug(env, decodeURIComponent(publicFolderMatch[1]), session?.user || null));
  }

  const downloadMatch = pathname.match(/^\/api\/download\/([^/]+)$/);
  if (downloadMatch && method === 'GET') {
    const session = await requireSession(request, env);
    return await handleDownload(request, env, downloadMatch[1], session.user);
  }

  if (pathname === '/api/public/folders' && method === 'GET') {
    const limit = parsePublicFolderPageInteger(url.searchParams.get('limit'), 'limit', 24, 1, 500);
    const offset = parsePublicFolderPageInteger(url.searchParams.get('offset'), 'offset', 0, 0, 1_000_000);
    const [folders, total] = await Promise.all([
      getPublicFolders(env, limit, offset),
      getPublicFolderCount(env)
    ]);
    return json({ folders, offset, limit, total, hasMore: offset + folders.length < total });
  }

  return json({ error: '接口不存在。' }, 404);
}

async function handleMedia(request, env, url) {
  const assetId = decodeURIComponent(url.pathname.replace(/^\/media\//, ''));
  const asset = await getAssetWithFolder(env, assetId);

  if (!asset) {
    return new Response('Not Found', { status: 404 });
  }

  const session = await requireOptionalSession(request, env);
  const allowed = canAccessAsset(asset, session?.user || null);

  if (!allowed) {
    return new Response('Forbidden', { status: 403 });
  }

  const object = await env.MMC_MEDIA.get(asset.r2_key);
  if (!object) {
    return new Response('Not Found', { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('cache-control', asset.status === 'published' ? 'public, max-age=86400' : 'private, max-age=120');
  return new Response(object.body, { headers });
}

function handleRobots(request, env, url) {
  if (!['GET', 'HEAD'].includes(request.method.toUpperCase())) {
    return new Response('Method Not Allowed', { status: 405 });
  }
  const origin = getSiteOrigin(env, url);
  const body = [
    'User-agent: *',
    'Allow: /',
    'Allow: /media/',
    'Disallow: /api/',
    'Disallow: /dashboard',
    'Disallow: /tools/ai-api',
    `Sitemap: ${origin}/sitemap.xml`,
    ''
  ].join('\n');
  return textResponse(request, body, 'text/plain; charset=utf-8');
}

async function handleSitemap(request, env, url) {
  if (!['GET', 'HEAD'].includes(request.method.toUpperCase())) {
    return new Response('Method Not Allowed', { status: 405 });
  }
  const origin = getSiteOrigin(env, url);
  const today = new Date().toISOString();
  const [folderRows, profileRows] = await Promise.all([
    getSeoSitemapFolders(env),
    getSeoSitemapProfiles(env)
  ]);
  const entries = [
    ...SEO_FIXED_PAGES.map(page => ({ ...page, lastmod: today })),
    ...SEO_TOOL_PAGES.map(page => ({ ...page, lastmod: today })),
    ...SEO_TEST_PAGES.map(page => ({ ...page, lastmod: today })),
    ...folderRows.map(row => ({
      path: `/${encodeURIComponent(row.slug)}`,
      lastmod: row.lastmod || today,
      changefreq: 'weekly',
      priority: '0.8'
    })),
    ...profileRows.map(row => ({
      path: `/profile/${encodeURIComponent(row.public_id)}`,
      lastmod: row.lastmod || today,
      changefreq: 'weekly',
      priority: '0.6'
    }))
  ];

  const urls = entries.map(entry => {
    const loc = absoluteUrl(origin, entry.path);
    return [
      '  <url>',
      `    <loc>${xmlEscape(loc)}</loc>`,
      `    <lastmod>${xmlEscape(formatSitemapDate(entry.lastmod))}</lastmod>`,
      entry.changefreq ? `    <changefreq>${xmlEscape(entry.changefreq)}</changefreq>` : '',
      entry.priority ? `    <priority>${xmlEscape(entry.priority)}</priority>` : '',
      '  </url>'
    ].filter(Boolean).join('\n');
  }).join('\n');
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return textResponse(request, body, 'application/xml; charset=utf-8', {
    'cache-control': 'public, max-age=300'
  });
}

async function handleSeoHtml(request, env, url) {
  if (!isSeoHtmlRequest(request, url)) return null;
  const route = await getSeoRouteData(env, url);
  if (!route) return null;

  const indexUrl = new URL('/index.html', url.origin);
  const indexResponse = await env.ASSETS.fetch(new Request(indexUrl.toString(), { method: 'GET', headers: request.headers }));
  if (!indexResponse.ok) return null;
  const baseHtml = await indexResponse.text();
  const origin = getSiteOrigin(env, url);
  const canonical = route.canonical || absoluteUrl(origin, route.path || url.pathname);
  const html = injectSeoHtml(baseHtml, {
    ...route,
    origin,
    canonical,
    siteName: env.SITE_NAME || SITE_DEFAULT_NAME
  });
  const headers = new Headers(indexResponse.headers);
  headers.set('content-type', 'text/html; charset=utf-8');
  headers.set('cache-control', route.noindex ? 'no-store' : 'public, max-age=300');
  if (route.noindex) headers.set('x-robots-tag', 'noindex, follow');
  return new Response(request.method.toUpperCase() === 'HEAD' ? null : html, { status: 200, headers });
}

function isSeoHtmlRequest(request, url) {
  const method = request.method.toUpperCase();
  if (!['GET', 'HEAD'].includes(method)) return false;
  const pathname = url.pathname;
  if (pathname.startsWith('/api/') || pathname.startsWith('/media/') || pathname.startsWith('/models/')) return false;
  if (/\.[a-z0-9]{1,12}$/i.test(pathname)) return false;
  return true;
}

async function getSeoRouteData(env, url) {
  const pathname = normalizeSeoPath(url.pathname);
  const fixed = SEO_FIXED_PAGES.find(page => page.path === pathname);
  if (fixed?.path === '/') {
    const folders = await getPublicFolders(env, 12);
    return {
      ...fixed,
      type: 'home',
      schemaType: 'WebSite',
      bodyHtml: renderSeoHome(fixed, folders),
      jsonLd: {
        '@type': 'WebSite',
        name: SITE_DEFAULT_NAME,
        description: fixed.description,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${getSiteOrigin(env, url)}/?q={search_term_string}`,
          'query-input': 'required name=search_term_string'
        }
      }
    };
  }
  if (fixed?.path === '/site-info') {
    const announcements = await getAnnouncements(env, true);
    const siteNotice = await getSiteSetting(env, 'site_notice', defaultSiteNotice());
    return {
      ...fixed,
      type: 'site-info',
      schemaType: 'AboutPage',
      bodyHtml: renderSeoSiteInfo(fixed, siteNotice, announcements)
    };
  }
  if (fixed?.path === '/tools/list') {
    return {
      ...fixed,
      type: 'tools-list',
      schemaType: 'CollectionPage',
      bodyHtml: renderSeoToolsList(fixed)
    };
  }

  const toolPage = SEO_TOOL_PAGES.find(page => page.path === pathname);
  if (toolPage) {
    return {
      ...toolPage,
      type: 'tool',
      schemaType: 'WebApplication',
      bodyHtml: renderSeoToolPage(toolPage)
    };
  }

  const privatePage = SEO_PRIVATE_SPA_PAGES.get(pathname);
  if (privatePage) {
    return {
      path: pathname,
      ...privatePage,
      type: 'private',
      bodyHtml: renderSeoPrivatePage(privatePage)
    };
  }

  const profileMatch = pathname.match(/^\/profile\/(\d+)$/);
  if (profileMatch) {
    try {
      const profile = await getPublicProfile(env, profileMatch[1], null);
      const folders = profile.folders || [];
      const user = profile.viewer || {};
      const title = `${SITE_DEFAULT_NAME} - ${user.displayName || '个人中心'}`;
      const description = `${user.displayName || '用户'} 在猫猫虫咖波表情包仓库公开发布的表情包分类，共 ${folders.length} 个作品。`;
      return {
        path: pathname,
        title,
        description,
        type: 'profile',
        schemaType: 'ProfilePage',
        noindex: folders.length === 0,
        bodyHtml: renderSeoProfilePage({ title, description, user, folders }),
        jsonLd: {
          '@type': 'ProfilePage',
          name: title,
          description
        }
      };
    } catch (error) {
      if (error instanceof HttpError && error.status === 404) return null;
      throw error;
    }
  }

  if (isPotentialFolderPath(pathname)) {
    try {
      const detail = await getSeoFolderBySlug(env, decodeURIComponent(pathname.slice(1)));
      const folder = detail.folder;
      const image = detail.assets.find(asset => asset.media_kind !== 'video')?.url || detail.assets[0]?.url || '';
      const title = `${SITE_DEFAULT_NAME} - ${folder.name}`;
      const description = trimText(folder.description || `${folder.name} 表情包资源合集，共 ${detail.assets.length} 项公开内容。`, 155);
      return {
        path: pathname,
        title,
        description,
        image,
        type: 'folder',
        schemaType: 'CollectionPage',
        bodyHtml: renderSeoFolderPage({ title, description, folder, assets: detail.assets }),
        jsonLd: {
          '@type': 'CollectionPage',
          name: title,
          description,
          creator: folder.ownerName ? { '@type': 'Person', name: folder.ownerName } : undefined
        }
      };
    } catch (error) {
      if (error instanceof HttpError && error.status === 404) return null;
      throw error;
    }
  }

  return null;
}

function normalizeSeoPath(pathname) {
  if (pathname !== '/' && pathname.endsWith('/')) return pathname.replace(/\/+$/, '');
  return pathname || '/';
}

function isPotentialFolderPath(pathname) {
  if (!pathname || pathname === '/' || pathname.slice(1).includes('/')) return false;
  if (pathname.startsWith('/api') || pathname.startsWith('/tools') || pathname.startsWith('/profile')) return false;
  return !/\.[a-z0-9]{1,12}$/i.test(pathname);
}

function injectSeoHtml(html, seo) {
  const title = seo.title || SITE_DEFAULT_NAME;
  const description = trimText(seo.description || '', 180);
  const image = seo.image ? absoluteUrl(seo.origin, seo.image) : '';
  const robots = seo.noindex ? 'noindex, follow' : 'index, follow';
  const jsonLd = normalizeJsonLd(seo);
  const headTags = [
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}">`,
    `<meta name="robots" content="${escapeHtml(robots)}">`,
    `<link rel="canonical" href="${escapeHtml(seo.canonical)}">`,
    `<meta property="og:site_name" content="${escapeHtml(seo.siteName || SITE_DEFAULT_NAME)}">`,
    `<meta property="og:type" content="${seo.schemaType === 'WebSite' ? 'website' : 'article'}">`,
    `<meta property="og:title" content="${escapeHtml(title)}">`,
    `<meta property="og:description" content="${escapeHtml(description)}">`,
    `<meta property="og:url" content="${escapeHtml(seo.canonical)}">`,
    image ? `<meta property="og:image" content="${escapeHtml(image)}">` : '',
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${escapeHtml(title)}">`,
    `<meta name="twitter:description" content="${escapeHtml(description)}">`,
    image ? `<meta name="twitter:image" content="${escapeHtml(image)}">` : '',
    `<script type="application/ld+json">${safeJsonLd(jsonLd)}</script>`
  ].filter(Boolean).join('\n  ');
  const cleanHtml = html
    .replace(/<title>[\s\S]*?<\/title>\s*/i, '')
    .replace(/<meta\s+name=["']description["'][^>]*>\s*/gi, '')
    .replace(/<meta\s+name=["']robots["'][^>]*>\s*/gi, '')
    .replace(/<link\s+rel=["']canonical["'][^>]*>\s*/gi, '')
    .replace(/<meta\s+property=["']og:[^"']+["'][^>]*>\s*/gi, '')
    .replace(/<meta\s+name=["']twitter:[^"']+["'][^>]*>\s*/gi, '')
    .replace(/<script\s+type=["']application\/ld\+json["'][\s\S]*?<\/script>\s*/gi, '');
  return cleanHtml
    .replace(/<\/head>/i, `  ${headTags}\n</head>`)
    .replace(/<div id="app"><\/div>/i, `<div id="app">${seo.bodyHtml || ''}</div>`);
}

function normalizeJsonLd(seo) {
  const data = {
    '@context': 'https://schema.org',
    '@type': seo.schemaType || 'WebPage',
    name: seo.title,
    description: seo.description,
    url: seo.canonical,
    image: seo.image ? absoluteUrl(seo.origin, seo.image) : undefined,
    ...seo.jsonLd
  };
  return dropUndefined(data);
}

function dropUndefined(value) {
  if (Array.isArray(value)) return value.map(dropUndefined);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value)
      .filter(([, item]) => item !== undefined && item !== null && item !== '')
      .map(([key, item]) => [key, dropUndefined(item)]));
  }
  return value;
}

function renderSeoHome(page, folders) {
  const list = folders.map(folder => `<li><a href="/${encodeURIComponent(folder.slug)}">${escapeHtml(folder.name)}</a><span>${escapeHtml(folder.description || `${Number(folder.count || 0)} 项内容`)}</span></li>`).join('');
  return `<main class="container seo-shell"><section class="site-info-hero"><div class="site-info-hero-text"><h1>${escapeHtml(page.title)}</h1><p>${escapeHtml(page.description)}</p></div></section><section><h2>公开表情包分类</h2><ul>${list}</ul></section></main>`;
}

function renderSeoSiteInfo(page, siteNotice, announcements) {
  const items = announcements.slice(0, 2).map(item => `<li><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.content || '')}</span></li>`).join('');
  return `<main class="container seo-shell"><section class="site-info-hero"><div class="site-info-hero-text"><h1>${escapeHtml(page.title)}</h1><p>${escapeHtml(page.description)}</p></div></section><section><h2>${escapeHtml(siteNotice?.title || '站内公告')}</h2><p>${escapeHtml(siteNotice?.content || '')}</p><ul>${items}</ul></section></main>`;
}

function renderSeoToolsList(page) {
  const tools = [...SEO_TOOL_PAGES, ...SEO_TEST_PAGES].map(tool => `<li><a href="${escapeHtml(tool.path)}">${escapeHtml(tool.title)}</a><span>${escapeHtml(tool.description)}</span></li>`).join('');
  return `<main class="container seo-shell"><section class="site-info-hero"><div class="site-info-hero-text"><h1>${escapeHtml(page.title)}</h1><p>${escapeHtml(page.description)}</p></div></section><section><h2>站内工具</h2><ul>${tools}</ul></section></main>`;
}

function renderSeoToolPage(page) {
  return `<main class="container seo-shell"><section class="site-info-hero"><div class="site-info-hero-text"><h1>${escapeHtml(page.title)}</h1><p>${escapeHtml(page.description)}</p></div><a class="site-info-backlink" href="/tools/list">返回工具列表</a></section></main>`;
}

function renderSeoPrivatePage(page) {
  return `<main class="container seo-shell"><section class="site-info-hero"><div class="site-info-hero-text"><h1>${escapeHtml(page.title)}</h1><p>${escapeHtml(page.description)}</p></div></section></main>`;
}

function renderSeoProfilePage({ title, description, user, folders }) {
  const items = folders.map(folder => `<li><a href="/${encodeURIComponent(folder.slug)}">${escapeHtml(folder.name)}</a><span>${escapeHtml(folder.description || `${Number(folder.count || 0)} 项内容`)}</span></li>`).join('');
  return `<main class="container seo-shell"><section class="site-info-hero"><div class="site-info-hero-text"><h1>${escapeHtml(title)}</h1><p>${escapeHtml(description)}</p><p>公开 ID：${escapeHtml(user.id || '')}</p></div></section><section><h2>公开作品</h2><ul>${items}</ul></section></main>`;
}

function renderSeoFolderPage({ title, description, folder, assets }) {
  const items = assets.slice(0, 60).map(asset => `<li><a href="${escapeHtml(asset.url)}">${escapeHtml(asset.original_name || asset.id)}</a><span>${escapeHtml(asset.media_kind || asset.mime_type || 'media')}</span></li>`).join('');
  const cover = assets[0]?.url ? `<p><a href="${escapeHtml(assets[0].url)}">查看首个公开资源</a></p>` : '';
  return `<main class="container seo-shell"><section class="site-info-hero"><div class="site-info-hero-text"><h1>${escapeHtml(title)}</h1><p>${escapeHtml(description)}</p><p>发布者：${escapeHtml(folder.ownerName || '匿名用户')}，共 ${assets.length} 项公开内容。</p>${cover}</div></section><section><h2>资源列表</h2><ul>${items}</ul></section></main>`;
}

async function getSeoSitemapFolders(env) {
  const rows = await env.MMC_DB.prepare(
    `
      SELECT slug, COALESCE(updated_at, published_at, created_at) AS lastmod
      FROM folders
      WHERE status = 'published'
      ORDER BY datetime(COALESCE(updated_at, published_at, created_at)) DESC
      LIMIT 5000
    `
  ).all();
  return rows.results || [];
}

async function getSeoSitemapProfiles(env) {
  const rows = await env.MMC_DB.prepare(
    `
      SELECT u.public_id, MAX(COALESCE(f.updated_at, f.published_at, f.created_at)) AS lastmod
      FROM users u
      JOIN folders f ON f.owner_user_id = u.id
      WHERE u.status = 'active' AND u.public_id IS NOT NULL AND f.status = 'published'
      GROUP BY u.public_id
      ORDER BY datetime(lastmod) DESC
      LIMIT 1000
    `
  ).all();
  return rows.results || [];
}

function hashString(value) {
  let hash = 2166136261;
  const text = String(value || '');
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function folderHash(folder) {
  return hashString(`${folder?.id || ''}:${folder?.slug || ''}:${folder?.name || ''}`);
}

function organicDisplayViewCount(folder) {
  const real = Math.max(0, Number(folder?.view_count || folder?.realViewCount || 0));
  const suffix = folderHash(folder) % 9 + 1;
  return real * 10 + 10 + suffix;
}

function boostRatePerHour(folder) {
  return 8 + (folderHash(folder) % 11);
}

function boostTargetOffset(folder) {
  return 17 + (folderHash(folder) % 27);
}

function getBoostDisplayViewCount(boost, at = new Date()) {
  if (!boost) return 0;
  const base = Number(boost.base_display_view_count || 0);
  const target = Number(boost.target_display_view_count || 0);
  const rate = Math.max(1, Number(boost.rate_per_hour || 12));
  const started = boost.started_at ? new Date(boost.started_at) : at;
  const elapsedHours = Math.max(0, (at.getTime() - started.getTime()) / 3600000);
  return Math.min(target, base + Math.floor(elapsedHours * rate));
}

function getFolderDisplayViewData(folder, boost = null, at = new Date()) {
  const realViewCount = Math.max(0, Number(folder?.view_count || 0));
  const organic = organicDisplayViewCount({ ...folder, view_count: realViewCount });
  const boosted = getBoostDisplayViewCount(boost, at);
  const viewCount = Math.max(organic, boosted);
  const targetDisplayViewCount = Number(boost?.target_display_view_count || 0);
  return {
    realViewCount,
    viewCount,
    viewBoost: boost ? {
      status: viewCount >= targetDisplayViewCount ? 'completed' : 'active',
      startedAt: boost.started_at,
      baseRealViewCount: Number(boost.base_real_view_count || 0),
      baseDisplayViewCount: Number(boost.base_display_view_count || 0),
      targetDisplayViewCount,
      ratePerHour: Number(boost.rate_per_hour || 0)
    } : null
  };
}

function canSeeRealViewCount(viewer) {
  return viewer?.role === 'owner';
}

async function getFolderViewBoosts(env, folderIds) {
  const ids = [...new Set((folderIds || []).filter(Boolean))];
  const boosts = new Map();
  if (!ids.length) return boosts;
  try {
    for (let i = 0; i < ids.length; i += 50) {
      const chunk = ids.slice(i, i + 50);
      const placeholders = chunk.map(() => '?').join(',');
      const rows = await env.MMC_DB.prepare(
        `SELECT * FROM folder_view_boosts WHERE folder_id IN (${placeholders})`
      ).bind(...chunk).all();
      for (const boost of rows.results || []) {
        boosts.set(boost.folder_id, boost);
      }
    }
  } catch (error) {
    if (!String(error?.message || '').toLowerCase().includes('no such table: folder_view_boosts')) throw error;
  }
  return boosts;
}

async function getFolderViewBoost(env, folderId) {
  const boosts = await getFolderViewBoosts(env, [folderId]);
  return boosts.get(folderId) || null;
}

async function getSeoFolderBySlug(env, slug) {
  const folder = await env.MMC_DB.prepare(
    `
      SELECT f.*, u.display_name, u.public_id
      FROM folders f
      JOIN users u ON u.id = f.owner_user_id
      WHERE f.slug = ? AND f.status = 'published'
      LIMIT 1
    `
  ).bind(slug).first();

  if (!folder) {
    throw new HttpError(404, '这个分类暂时不存在，或者还没有通过审核。');
  }
  const displayViews = getFolderDisplayViewData(folder, await getFolderViewBoost(env, folder.id));

  const assets = await env.MMC_DB.prepare(
    `
      SELECT id, original_name, mime_type, media_kind, created_at
      FROM assets
      WHERE folder_id = ? AND status = 'published'
      ORDER BY sort_order ASC, created_at ASC
    `
  ).bind(folder.id).all();

  return {
    folder: {
      id: folder.id,
      name: folder.name,
      slug: folder.slug,
      description: folder.description,
      ownerName: folder.display_name,
      ownerPublicId: Number(folder.public_id || 0),
      publishedAt: folder.published_at,
      updatedAt: folder.updated_at,
      viewCount: displayViews.viewCount
    },
    assets: (assets.results || []).map(asset => ({
      ...asset,
      url: `/media/${encodeURIComponent(asset.id)}`
    }))
  };
}

function getSiteOrigin(env, url) {
  const configured = String(env.SITE_ORIGIN || '').trim().replace(/\/+$/, '');
  if (configured && !configured.includes('your-domain.example')) return configured;
  return url.origin.replace(/\/+$/, '');
}

function absoluteUrl(origin, path) {
  if (!path) return origin;
  if (/^https?:\/\//i.test(path)) return path;
  return `${origin}${path.startsWith('/') ? path : `/${path}`}`;
}

function formatSitemapDate(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return new Date().toISOString();
  return date.toISOString();
}

function textResponse(request, body, contentType, extraHeaders = {}) {
  const headers = new Headers(extraHeaders);
  headers.set('content-type', contentType);
  return new Response(request.method.toUpperCase() === 'HEAD' ? null : body, { headers });
}

async function handleDownload(request, env, assetId, user) {
  const asset = await getAssetWithFolder(env, decodeURIComponent(assetId));
  if (!asset) {
    throw new HttpError(404, '要下载的资源不存在。');
  }

  if (!canAccessAsset(asset, user)) {
    throw new HttpError(403, '你没有权限下载这个资源。');
  }

  const object = await env.MMC_MEDIA.get(asset.r2_key);
  if (!object) {
    throw new HttpError(404, '要下载的资源文件不存在。');
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('cache-control', 'private, max-age=120');
  headers.set('content-disposition', buildAttachmentDisposition(asset.original_name || `asset-${asset.id}`));
  return new Response(object.body, { headers });
}

async function getAssetWithFolder(env, assetId) {
  return env.MMC_DB.prepare(
    `
      SELECT a.*, f.owner_user_id, f.status AS folder_status
      FROM assets a
      JOIN folders f ON f.id = a.folder_id
      WHERE a.id = ?
    `
  ).bind(assetId).first();
}

function canAccessAsset(asset, user) {
  if (asset.status === 'published' && asset.folder_status === 'published') {
    return true;
  }
  if (!user) {
    return false;
  }
  return user.role !== 'user' || user.id === asset.owner_user_id;
}

async function getBootstrapPayload(request, env) {
  const session = await requireOptionalSession(request, env);
  const [folders, foldersTotal, announcements, siteNotice] = await Promise.all([
    getPublicFolders(env, 500),
    getPublicFolderCount(env),
    getAnnouncements(env, true),
    getSiteSetting(env, 'site_notice', defaultSiteNotice())
  ]);

  const totalAssets = folders.reduce((sum, folder) => sum + Number(folder.count || 0), 0);

  return {
    site: {
    name: env.SITE_NAME || '猫猫虫咖波表情包仓库后台版',
      origin: env.SITE_ORIGIN || '',
      allowPublicRegistration: env.ALLOW_PUBLIC_REGISTRATION !== 'false',
      totalCategories: foldersTotal,
      totalAssets
    },
    viewer: session?.user ? await serializeUserWithRemoveBg(env, session.user) : null,
    folders,
    foldersTotal,
    announcements,
    siteNotice
  };
}

async function getRemoveBgAccessPayload(env, user) {
  return {
    viewer: user ? serializeUser(user) : null,
    removeBg: await getRemoveBgAccessState(env, user)
  };
}

async function proxyAiChat(env, body) {
  const model = String(body?.model || '').trim();
  const messages = normalizeAiChatMessages(body?.messages);
  const temperature = Number.isFinite(Number(body?.temperature)) ? Number(body.temperature) : 0.7;
  const hasImage = messages.some(message => Array.isArray(message.content));
  const allowedModels = hasImage ? AI_CHAT_VISION_MODELS : AI_CHAT_TEXT_MODELS;

  if (!allowedModels.has(model)) {
    throw new HttpError(400, '当前模型不在本站允许的 AI 聊天模型列表中。');
  }

  const response = await fetch(env.AI_CHAT_API_URL || AI_CHAT_API_URL, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.AI_CHAT_API_KEY || AI_CHAT_API_KEY_FALLBACK}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: Math.max(0, Math.min(1.5, temperature))
    })
  });

  let data;
  try {
    data = await response.json();
  } catch {
    throw new HttpError(502, 'AI 服务返回了无法解析的响应。');
  }

  if (!response.ok) {
    throw new HttpError(response.status, data?.error?.message || data?.message || 'AI 服务暂时不可用。');
  }

  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== 'string') {
    throw new HttpError(502, 'AI 服务返回结构异常。');
  }

  return {
    ok: true,
    model,
    content
  };
}

function listInspirationTools() {
  return INSPIRATION_TOOLS.map(tool => ({
    id: tool.id,
    name: tool.name,
    category: tool.category,
    type: tool.type,
    description: tool.description,
    fields: tool.fields || []
  }));
}

async function generateInspiration(body = {}) {
  const toolId = String(body?.id || '').trim();
  const tool = INSPIRATION_TOOLS.find(item => item.id === toolId);
  if (!tool) {
    throw new HttpError(404, '这个小功能暂时不可用。');
  }

  const params = buildInspirationParams(tool, body?.params || {});
  const requestUrl = appendQuery(tool.url, params);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  let response;
  try {
    response = await fetch(requestUrl, {
      headers: {
        accept: tool.type === 'text' ? 'application/json,text/plain,*/*' : '*/*',
        'user-agent': 'maomaochongmiao-inspiration/1.0'
      },
      redirect: 'follow',
      signal: controller.signal
    });
  } catch (error) {
    throw new HttpError(502, error?.name === 'AbortError' ? '生成超时了，请稍后再试。' : '生成失败了，请稍后再试。');
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    throw new HttpError(502, '生成失败了，请稍后再试。');
  }

  const contentType = response.headers.get('content-type') || '';
  const finalUrl = response.url || requestUrl;

  if (tool.type !== 'text' && isMediaContentType(contentType, tool.type)) {
    const contentUrl = tool.inlineMedia
      ? await responseToDataUrl(response, contentType)
      : finalUrl;
    return {
      id: tool.id,
      name: tool.name,
      category: tool.category,
      type: tool.type,
      contentUrl,
      downloadable: isDownloadableInspiration(tool),
      fullscreenable: isFullscreenableInspiration(tool),
      openable: isOpenableInspiration(tool)
    };
  }

  const text = await response.text();
  const parsed = parseMaybeJson(text);
  const value = extractInspirationValue(parsed, tool.parse);
  const normalizedValue = normalizeInspirationResult(value, tool.type);

  if (tool.type === 'text') {
    return {
      id: tool.id,
      name: tool.name,
      category: tool.category,
      type: tool.type,
      content: normalizedValue || text.trim()
    };
  }

  const contentUrl = absolutizeUrl(normalizedValue || text.trim(), finalUrl);
  if (!contentUrl) {
    throw new HttpError(502, '这次没有生成可预览的内容，请再试一次。');
  }
  const resolvedContentUrl = tool.inlineMedia
    ? await fetchMediaAsDataUrl(contentUrl, tool.type)
    : contentUrl;

  return {
    id: tool.id,
    name: tool.name,
    category: tool.category,
    type: tool.type,
    contentUrl: resolvedContentUrl,
    downloadable: isDownloadableInspiration(tool),
    fullscreenable: isFullscreenableInspiration(tool),
    openable: isOpenableInspiration(tool)
  };
}

function buildInspirationParams(tool, userParams) {
  const params = { ...(tool.params || {}) };
  for (const field of tool.fields || []) {
    const value = String(userParams?.[field.key] ?? '').trim();
    if (!value) {
      throw new HttpError(400, `请填写${field.label}。`);
    }
    params[field.key] = value.slice(0, 200);
  }
  return params;
}

function appendQuery(rawUrl, params = {}) {
  const url = new URL(rawUrl);
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    url.searchParams.set(key, String(value));
  }
  return url.toString();
}

function parseMaybeJson(text) {
  const trimmed = String(text || '').trim();
  if (!trimmed) return '';
  try {
    return JSON.parse(trimmed);
  } catch {
    return trimmed;
  }
}

function extractInspirationValue(data, path) {
  if (!path) return data;
  if (typeof data === 'string') return data;
  const parts = String(path).split('.').filter(Boolean);
  let current = data;
  for (const part of parts) {
    const arrayMatch = part.match(/^(.+)\[\]$/);
    if (arrayMatch) {
      current = current?.[arrayMatch[1]];
      if (Array.isArray(current)) current = current[0];
      continue;
    }
    current = current?.[part];
  }
  return current;
}

function normalizeInspirationResult(value, type) {
  if (value === undefined || value === null) return '';
  if (typeof value === 'string') return cleanInspirationText(value);
  if (Array.isArray(value)) {
    const first = value.find(item => item !== undefined && item !== null && String(item).trim() !== '');
    return normalizeInspirationResult(first, type);
  }
  if (typeof value === 'object') {
    if (type !== 'text') {
      const mediaValue = value.url || value.img || value.image || value.pic || value.path || value.data;
      if (mediaValue) return normalizeInspirationResult(mediaValue, type);
    }
    return JSON.stringify(value, null, 2);
  }
  return cleanInspirationText(value);
}

function cleanInspirationText(value) {
  return String(value || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\r\n?/g, '\n')
    .trim();
}

function absolutizeUrl(value, baseUrl) {
  const text = String(value || '').trim();
  if (!text) return '';
  try {
    return new URL(text, baseUrl).toString();
  } catch {
    return '';
  }
}

function isMediaContentType(contentType, type) {
  const lower = String(contentType || '').toLowerCase();
  if (type === 'image') return lower.startsWith('image/');
  if (type === 'audio') return lower.startsWith('audio/');
  if (type === 'video') return lower.startsWith('video/');
  return false;
}

async function responseToDataUrl(response, contentType) {
  const buffer = await response.arrayBuffer();
  const base64 = arrayBufferToBase64(buffer);
  return `data:${contentType || 'application/octet-stream'};base64,${base64}`;
}

async function fetchMediaAsDataUrl(url, type) {
  const response = await fetch(url, {
    headers: { accept: '*/*', 'user-agent': 'maomaochongmiao-inspiration/1.0' },
    redirect: 'follow'
  });
  if (!response.ok) {
    throw new HttpError(502, '这次没有生成可下载的图片，请再试一次。');
  }
  const contentType = response.headers.get('content-type') || '';
  if (!isMediaContentType(contentType, type)) {
    throw new HttpError(502, '这次没有生成可下载的图片，请再试一次。');
  }
  return responseToDataUrl(response, contentType);
}

function isDownloadableInspiration(tool) {
  return ['wallpaper', 'meme-search'].includes(tool.id);
}

function isFullscreenableInspiration(tool) {
  return tool.id === 'wallpaper';
}

function isOpenableInspiration(tool) {
  return !['wallpaper'].includes(tool.id);
}

async function handleOpenAiChatApi(request, env, body) {
  const apiKey = getBearerToken(request);
  if (!apiKey) {
    throw new HttpError(401, '缺少 API Key，请在 Authorization 中使用 Bearer Token。');
  }

  const keyHash = await sha256(apiKey);
  const record = await env.MMC_DB.prepare(
    `
      SELECT k.*, u.username, u.display_name, u.role AS user_role, u.status AS user_status
      FROM ai_api_keys k
      JOIN users u ON u.id = k.user_id
      WHERE k.key_hash = ?
      LIMIT 1
    `
  ).bind(keyHash).first();

  if (!record || record.status !== 'active' || record.user_status !== 'active') {
    throw new HttpError(401, 'API Key 无效或已停用。');
  }

  const billing = await getAiApiBillingState(env, record.user_id);
  const isOwnerKey = record.user_role === 'owner';
  const model = String(body?.model || 'zhipu/glm-4-flash').trim();
  const messages = normalizeAiChatMessages(body?.messages);
  const hasImage = messages.some(message => Array.isArray(message.content));
  const allowedModels = hasImage ? AI_CHAT_VISION_MODELS : AI_CHAT_TEXT_MODELS;
  if (!allowedModels.has(model)) {
    throw new HttpError(400, '当前模型不在本站允许的 AI 对话 API 模型列表中。');
  }

  const projectedCount = billing.usage.successCount + 1;
  const shouldCharge = !isOwnerKey && projectedCount > billing.freeLimit;
  if (shouldCharge && compareMoney(billing.balance, billing.pricePerCall) < 0) {
    throw new HttpError(402, '余额不足，请先充值。');
  }

  let upstream;
  try {
    upstream = await callAiChatUpstream(env, {
      model,
      messages,
      temperature: Number.isFinite(Number(body?.temperature)) ? Number(body.temperature) : 0.7
    });
  } catch (error) {
    await recordAiApiFailure(env, record.user_id);
    throw error;
  }

  const chargeAmount = shouldCharge ? billing.pricePerCall : '0.000';
  const after = await recordAiApiSuccess(env, record.user_id, record.id, chargeAmount);

  return {
    ok: true,
    reply: upstream.content,
    usage: {
      charged: shouldCharge,
      cost: chargeAmount,
      todaySuccessCount: after.successCount,
      todayFreeLimit: isOwnerKey ? null : billing.freeLimit,
      balance: after.balance,
      membershipActive: isOwnerKey ? true : billing.membershipActive,
      pricePerCall: isOwnerKey ? '0.000' : billing.pricePerCall,
      unlimited: isOwnerKey
    }
  };
}

async function callAiChatUpstream(env, { model, messages, temperature }) {
  const response = await fetch(env.AI_CHAT_API_URL || AI_CHAT_API_URL, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.AI_CHAT_API_KEY || AI_CHAT_API_KEY_FALLBACK}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: Math.max(0, Math.min(1.5, temperature))
    })
  });

  let data;
  try {
    data = await response.json();
  } catch {
    throw new HttpError(502, 'AI 服务返回了无法解析的响应。');
  }

  if (!response.ok) {
    throw new HttpError(response.status, data?.error?.message || data?.message || 'AI 服务暂时不可用。');
  }

  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== 'string') {
    throw new HttpError(502, 'AI 服务返回结构异常。');
  }

  return { content };
}

async function getAiApiDashboard(env, user) {
  const billing = await getAiApiBillingState(env, user.id);
  const keys = await getAiApiKeysForUser(env, user.id);
  const recentLogs = await env.MMC_DB.prepare(
    `
      SELECT type, amount, balance_after, note, created_at
      FROM ai_api_balance_logs
      WHERE user_id = ?
      ORDER BY datetime(created_at) DESC
      LIMIT 20
    `
  ).bind(user.id).all();

  return {
    keys: keys.map(serializeAiApiKey),
    key: keys[0] ? serializeAiApiKey(keys[0]) : null,
    billing,
    logs: recentLogs.results || [],
    pricing: getAiApiPricing(),
    redeem: {
      shopUrl: env.AI_API_MEMBER_SHOP_URL || env.REMOVE_BG_MEMBER_SHOP_URL || MEMBER_SHOP_URL_FALLBACK,
      products: getAiApiRedeemProducts(env)
    },
    limits: {
      keyLimit: getAiApiKeyLimit(billing),
      keyCount: keys.length
    }
  };
}

async function createAiApiKey(env, user, body = {}) {
  const billing = await getAiApiBillingState(env, user.id);
  const keyLimit = getAiApiKeyLimit(billing);
  const keyCount = await countAiApiKeysForUser(env, user.id);
  if (keyCount >= keyLimit) {
    throw new HttpError(400, `当前身份最多可申请 ${keyLimit} 个 API Key。`);
  }

  const rawKey = `mmc_${bytesToHex(crypto.getRandomValues(new Uint8Array(24)))}`;
  const keyHash = await sha256(rawKey);
  const keyPrefix = rawKey.slice(0, 12);
  const note = normalizeAiApiKeyNote(body?.note);
  const now = nowIso();
  const id = generateId('aikey');

  await env.MMC_DB.prepare(
    `
      INSERT INTO ai_api_keys (id, user_id, key_hash, key_prefix, note, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 'active', ?, ?)
    `
  ).bind(id, user.id, keyHash, keyPrefix, note, now, now).run();

  return {
    ok: true,
    apiKey: rawKey,
    keyId: id,
    message: 'API Key 已生成，请立即保存。',
    dashboard: await getAiApiDashboard(env, user)
  };
}

async function updateAiApiKey(env, user, keyId, body = {}) {
  const key = await getAiApiKeyForUser(env, user.id, keyId);
  if (!key) {
    throw new HttpError(404, '找不到这个 API Key。');
  }

  const status = body?.status === 'disabled' ? 'disabled' : body?.status === 'active' ? 'active' : key.status;
  const note = body?.note === undefined ? key.note || '' : normalizeAiApiKeyNote(body.note);
  const now = nowIso();

  await env.MMC_DB.prepare(
    `
      UPDATE ai_api_keys
      SET status = ?, note = ?, updated_at = ?
      WHERE id = ? AND user_id = ?
    `
  ).bind(status, note, now, keyId, user.id).run();

  return {
    ok: true,
    message: status === 'disabled' ? 'API Key 已禁用。' : 'API Key 已更新。',
    dashboard: await getAiApiDashboard(env, user)
  };
}

async function resetAiApiKey(env, user, keyId) {
  const key = await getAiApiKeyForUser(env, user.id, keyId);
  if (!key) {
    throw new HttpError(404, '找不到这个 API Key。');
  }

  const rawKey = `mmc_${bytesToHex(crypto.getRandomValues(new Uint8Array(24)))}`;
  const keyHash = await sha256(rawKey);
  const keyPrefix = rawKey.slice(0, 12);
  const now = nowIso();

  await env.MMC_DB.prepare(
    `
      UPDATE ai_api_keys
      SET key_hash = ?, key_prefix = ?, status = 'active', last_used_at = NULL, updated_at = ?
      WHERE id = ? AND user_id = ?
    `
  ).bind(keyHash, keyPrefix, now, keyId, user.id).run();

  return {
    ok: true,
    apiKey: rawKey,
    keyId,
    message: 'API Key 已重置，请立即保存新 Key。',
    dashboard: await getAiApiDashboard(env, user)
  };
}

async function getAiApiKeysForUser(env, userId) {
  const rows = await env.MMC_DB.prepare(
    `
      SELECT *
      FROM ai_api_keys
      WHERE user_id = ?
      ORDER BY datetime(created_at) ASC
    `
  ).bind(userId).all();
  return rows.results || [];
}

async function getAiApiKeyForUser(env, userId, keyId) {
  return env.MMC_DB.prepare('SELECT * FROM ai_api_keys WHERE user_id = ? AND id = ? LIMIT 1').bind(userId, keyId).first();
}

async function countAiApiKeysForUser(env, userId) {
  const row = await env.MMC_DB.prepare('SELECT COUNT(*) AS count FROM ai_api_keys WHERE user_id = ?').bind(userId).first();
  return Number(row?.count || 0);
}

function serializeAiApiKey(key) {
  return {
    id: key.id,
    keyPrefix: key.key_prefix,
    note: key.note || '',
    status: key.status,
    createdAt: key.created_at,
    updatedAt: key.updated_at,
    lastUsedAt: key.last_used_at
  };
}

function getAiApiKeyLimit(billing) {
  return billing?.membershipActive ? AI_API_MEMBER_KEY_LIMIT : AI_API_FREE_KEY_LIMIT;
}

function normalizeAiApiKeyNote(value) {
  return String(value || '').trim().slice(0, 80);
}

async function getAiApiBillingState(env, userId) {
  const usageDate = getLocalDateString(AI_API_TIMEZONE);
  const [membership, usage, balanceRow] = await Promise.all([
    getActiveAiApiMembership(env, userId),
    env.MMC_DB.prepare(
      `
        SELECT *
        FROM ai_api_daily_usage
        WHERE user_id = ? AND usage_date = ?
        LIMIT 1
      `
    ).bind(userId, usageDate).first(),
    env.MMC_DB.prepare('SELECT balance FROM ai_api_balances WHERE user_id = ? LIMIT 1').bind(userId).first()
  ]);

  const membershipActive = Boolean(membership);
  const freeLimit = membershipActive ? AI_API_MEMBER_DAILY_LIMIT : AI_API_FREE_DAILY_LIMIT;
  const pricePerCall = membershipActive ? AI_API_MEMBER_OVERAGE_PRICE : AI_API_FREE_OVERAGE_PRICE;
  const successCount = Number(usage?.success_count || 0);

  return {
    usageDate,
    membershipActive,
    membershipExpiresAt: membership?.expires_at || null,
    freeLimit,
    pricePerCall,
    balance: formatMoney(balanceRow?.balance || '0'),
    usage: {
      successCount,
      failedCount: Number(usage?.failed_count || 0),
      chargedCount: Number(usage?.charged_count || 0),
      totalCost: formatMoney(usage?.total_cost || '0'),
      freeRemaining: Math.max(0, freeLimit - successCount)
    }
  };
}

async function getActiveAiApiMembership(env, userId) {
  const now = nowIso();
  return env.MMC_DB.prepare(
    `
      SELECT *
      FROM ai_api_memberships
      WHERE user_id = ?
        AND status = 'active'
        AND (expires_at IS NULL OR expires_at > ?)
      LIMIT 1
    `
  ).bind(userId, now).first();
}

async function recordAiApiFailure(env, userId) {
  const now = nowIso();
  const usageDate = getLocalDateString(AI_API_TIMEZONE);
  await env.MMC_DB.prepare(
    `
      INSERT INTO ai_api_daily_usage (
        user_id, usage_date, success_count, failed_count, charged_count, total_cost, last_request_at, created_at, updated_at
      )
      VALUES (?, ?, 0, 1, 0, '0.000', ?, ?, ?)
      ON CONFLICT(user_id, usage_date) DO UPDATE SET
        failed_count = ai_api_daily_usage.failed_count + 1,
        last_request_at = excluded.last_request_at,
        updated_at = excluded.updated_at
    `
  ).bind(userId, usageDate, now, now, now).run();
}

async function recordAiApiSuccess(env, userId, keyId, chargeAmount) {
  const now = nowIso();
  const usageDate = getLocalDateString(AI_API_TIMEZONE);
  const cost = formatMoney(chargeAmount || '0');
  const charged = compareMoney(cost, '0') > 0;
  const balanceRow = await env.MMC_DB.prepare('SELECT balance FROM ai_api_balances WHERE user_id = ? LIMIT 1').bind(userId).first();
  const currentBalance = formatMoney(balanceRow?.balance || '0');
  const nextBalance = charged ? subtractMoney(currentBalance, cost) : currentBalance;
  if (charged && compareMoney(nextBalance, '0') < 0) {
    throw new HttpError(402, '余额不足，请先充值。');
  }

  const statements = [
    env.MMC_DB.prepare(
      `
        INSERT INTO ai_api_daily_usage (
          user_id, usage_date, success_count, failed_count, charged_count, total_cost, last_request_at, created_at, updated_at
        )
        VALUES (?, ?, 1, 0, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id, usage_date) DO UPDATE SET
          success_count = ai_api_daily_usage.success_count + 1,
          charged_count = ai_api_daily_usage.charged_count + excluded.charged_count,
          total_cost = printf('%.3f', CAST(ai_api_daily_usage.total_cost AS REAL) + CAST(excluded.total_cost AS REAL)),
          last_request_at = excluded.last_request_at,
          updated_at = excluded.updated_at
      `
    ).bind(userId, usageDate, charged ? 1 : 0, cost, now, now, now),
    env.MMC_DB.prepare('UPDATE ai_api_keys SET last_used_at = ?, updated_at = ? WHERE id = ?').bind(now, now, keyId)
  ];

  if (charged) {
    statements.push(
      env.MMC_DB.prepare(
        `
          INSERT INTO ai_api_balances (user_id, balance, updated_at)
          VALUES (?, ?, ?)
          ON CONFLICT(user_id) DO UPDATE SET
            balance = excluded.balance,
            updated_at = excluded.updated_at
        `
      ).bind(userId, nextBalance, now),
      env.MMC_DB.prepare(
        `
          INSERT INTO ai_api_balance_logs (id, user_id, actor_user_id, type, amount, balance_after, note, created_at)
          VALUES (?, ?, NULL, 'charge', ?, ?, 'AI API 超额调用扣费', ?)
        `
      ).bind(generateId('apilog'), userId, `-${cost}`, nextBalance, now)
    );
  }

  await env.MMC_DB.batch(statements);
  const billing = await getAiApiBillingState(env, userId);
  return {
    successCount: billing.usage.successCount,
    balance: billing.balance
  };
}

function getAiApiPricing() {
  return {
    free: {
      dailyFreeCalls: AI_API_FREE_DAILY_LIMIT,
      overagePrice: AI_API_FREE_OVERAGE_PRICE
    },
    member: {
      dailyFreeCalls: AI_API_MEMBER_DAILY_LIMIT,
      overagePrice: AI_API_MEMBER_OVERAGE_PRICE,
      durationDays: AI_API_MEMBER_DURATION_DAYS,
      suggestedPrice: '6.00'
    },
    note: '调用成功才计次数；调用失败、余额不足、参数错误和上下文过长不扣费。'
  };
}

function normalizeAiChatMessages(rawMessages) {
  if (!Array.isArray(rawMessages) || !rawMessages.length || rawMessages.length > 30) {
    throw new HttpError(400, '消息数量不正确。');
  }

  return rawMessages.map(raw => {
    const role = String(raw?.role || '').trim();
    if (!['system', 'user', 'assistant'].includes(role)) {
      throw new HttpError(400, '消息角色不正确。');
    }

    if (Array.isArray(raw?.content)) {
      const parts = raw.content.slice(0, 4).map(part => {
        if (part?.type === 'text') {
          return { type: 'text', text: String(part.text || '').slice(0, 4000) };
        }
        if (part?.type === 'image_url') {
          const url = String(part.image_url?.url || '');
          if (!url.startsWith('data:image/')) {
            throw new HttpError(400, '图片必须使用浏览器本地读取的 data URL。');
          }
          if (url.length > 8 * 1024 * 1024) {
            throw new HttpError(400, '图片过大，请换一张更小的图片。');
          }
          return { type: 'image_url', image_url: { url } };
        }
        throw new HttpError(400, '消息内容格式不正确。');
      });
      return { role, content: parts };
    }

    return { role, content: String(raw?.content || '').slice(0, 12000) };
  });
}

async function serializeUserWithRemoveBg(env, user) {
  return {
    ...serializeUser(user),
    removeBg: await getRemoveBgAccessState(env, user)
  };
}

async function getRemoveBgAccessState(env, user) {
  const usageDate = getLocalDateString(REMOVE_BG_TIMEZONE);
  const resetAt = getNextDayStartIso(REMOVE_BG_TIMEZONE);
  const billing = getRemoveBgBillingConfig(env);

  if (!user) {
    return {
      isLoggedIn: false,
      membershipActive: false,
      membershipPlan: 'guest',
      membershipLabel: 'guest',
      dailyLimit: 0,
      downloadsUsed: 0,
      downloadsRemaining: 0,
      canDownload: false,
      usageDate,
      resetAt,
      previewUnlimited: true,
      billing
    };
  }

  const membership = await getActiveRemoveBgMembership(env, user.id);
  const usage = await env.MMC_DB.prepare(
    `
      SELECT download_count
      FROM remove_bg_daily_usage
      WHERE user_id = ? AND usage_date = ?
      LIMIT 1
    `
  ).bind(user.id, usageDate).first();

  const dailyLimit = membership ? REMOVE_BG_MEMBER_DAILY_LIMIT : REMOVE_BG_FREE_DAILY_LIMIT;
  const downloadsUsed = Number(usage?.download_count || 0);
  const downloadsRemaining = Math.max(0, dailyLimit - downloadsUsed);

  return {
    isLoggedIn: true,
    membershipActive: Boolean(membership),
    membershipPlan: membership?.plan_code || 'free',
    membershipLabel: membership ? 'member' : 'free',
    dailyLimit,
    downloadsUsed,
    downloadsRemaining,
    canDownload: downloadsRemaining > 0,
    usageDate,
    resetAt,
    previewUnlimited: true,
    billing
  };
}

async function getActiveRemoveBgMembership(env, userId) {
  const now = nowIso();
  return env.MMC_DB.prepare(
    `
      SELECT *
      FROM remove_bg_memberships
      WHERE user_id = ?
        AND status = 'active'
        AND (expires_at IS NULL OR expires_at > ?)
      LIMIT 1
    `
  ).bind(userId, now).first();
}

async function consumeRemoveBgDownload(env, user) {
  const access = await getRemoveBgAccessState(env, user);
  if (!access.canDownload) {
    throw new HttpError(429, '今天的抠图下载额度已用完，但你仍然可以继续预览抠图结果。');
  }

  const now = nowIso();
  const result = await env.MMC_DB.prepare(
    `
      INSERT INTO remove_bg_daily_usage (
        user_id, usage_date, download_count, last_download_at, created_at, updated_at
      )
      VALUES (?, ?, 1, ?, ?, ?)
      ON CONFLICT(user_id, usage_date) DO UPDATE SET
        download_count = remove_bg_daily_usage.download_count + 1,
        last_download_at = excluded.last_download_at,
        updated_at = excluded.updated_at
      WHERE remove_bg_daily_usage.download_count < ?
    `
  ).bind(user.id, access.usageDate, now, now, now, access.dailyLimit).run();

  if (Number(result.meta?.changes || 0) === 0) {
    throw new HttpError(429, '今天的抠图下载额度已用完，但你仍然可以继续预览抠图结果。');
  }

  return {
    ok: true,
    message: '文件已准备下载。',
    removeBg: await getRemoveBgAccessState(env, user)
  };
}

function getRemoveBgBillingConfig(env) {
  const price = normalizeMoney(env.REMOVE_BG_MEMBER_PRICE || '6.00');
  const durationDays = Math.max(1, Number.parseInt(env.REMOVE_BG_MEMBER_DURATION_DAYS || '30', 10) || 30);
  return {
    productCode: REMOVE_BG_MEMBER_PRODUCT_CODE,
    subject: env.REMOVE_BG_MEMBER_SUBJECT || 'AI抠图会员月卡',
    price,
    durationDays,
    shopUrl: env.REMOVE_BG_MEMBER_SHOP_URL || MEMBER_SHOP_URL_FALLBACK,
    returnUrl: env.ALIPAY_RETURN_URL || `${env.SITE_ORIGIN || ''}/tools/remove-bg`,
    notifyUrl: env.ALIPAY_NOTIFY_URL || `${env.SITE_ORIGIN || ''}/api/billing/alipay/notify`
  };
}

function getAiApiRedeemProducts(env) {
  const shopUrl = env.AI_API_MEMBER_SHOP_URL || env.REMOVE_BG_MEMBER_SHOP_URL || MEMBER_SHOP_URL_FALLBACK;
  return [
    {
      code: AI_API_MEMBER_PRODUCT_CODE,
      label: 'API会员月卡',
      amount: '0.000',
      durationDays: AI_API_MEMBER_DURATION_DAYS,
      price: '6.00',
      shopUrl
    },
    {
      code: AI_API_BALANCE_1_PRODUCT_CODE,
      label: 'API余额1元兑换码',
      amount: '1.000',
      durationDays: 0,
      price: '1.00',
      shopUrl
    },
    {
      code: AI_API_BALANCE_10_PRODUCT_CODE,
      label: 'API余额10元兑换码',
      amount: '10.000',
      durationDays: 0,
      price: '10.00',
      shopUrl
    }
  ];
}

function getAiApiRedeemProduct(productCode) {
  const product = getAiApiRedeemProducts({}).find(item => item.code === productCode);
  if (!product) {
    throw new HttpError(400, '兑换码类型无效。');
  }
  return product;
}

async function redeemRemoveBgCode(env, user, body) {
  const code = normalizeRedeemCode(body?.code);
  if (!code) {
    throw new HttpError(400, '请输入兑换码。');
  }

  const now = nowIso();
  const billing = getRemoveBgBillingConfig(env);
  const existing = await getRedeemCodeRecord(env, code);
  if (existing.product_code && existing.product_code !== REMOVE_BG_MEMBER_PRODUCT_CODE) {
    throw new HttpError(400, '这个兑换码不是 AI 抠图会员兑换码。');
  }

  const existingMembership = await env.MMC_DB.prepare(
    `
      SELECT *
      FROM remove_bg_memberships
      WHERE user_id = ?
      LIMIT 1
    `
  ).bind(user.id).first();

  const nextStartAt = existingMembership?.expires_at && existingMembership.expires_at > now
    ? existingMembership.expires_at
    : now;
  const nextExpiresAt = addDaysIso(nextStartAt, billing.durationDays);

  await markRedeemCodeUsed(env, user.id, code, now);

  await env.MMC_DB.prepare(
    `
      INSERT INTO remove_bg_memberships (
        user_id, plan_code, status, started_at, expires_at, created_at, updated_at
      )
      VALUES (?, ?, 'active', ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        plan_code = excluded.plan_code,
        status = 'active',
        started_at = CASE
          WHEN remove_bg_memberships.expires_at IS NOT NULL AND remove_bg_memberships.expires_at > excluded.started_at
            THEN remove_bg_memberships.started_at
          ELSE excluded.started_at
        END,
        expires_at = excluded.expires_at,
        updated_at = excluded.updated_at
    `
  ).bind(
    user.id,
    REMOVE_BG_MEMBER_PLAN_CODE,
    nextStartAt,
    nextExpiresAt,
    now,
    now
  ).run();

  return {
    ok: true,
    message: `兑换成功，抠图会员已增加 ${billing.durationDays} 天。`,
    removeBg: await getRemoveBgAccessState(env, user)
  };
}

async function redeemAiApiCode(env, user, body) {
  const code = normalizeRedeemCode(body?.code);
  if (!code) {
    throw new HttpError(400, '请输入兑换码。');
  }

  const now = nowIso();
  const existing = await getRedeemCodeRecord(env, code);
  const productCode = existing.product_code || REMOVE_BG_MEMBER_PRODUCT_CODE;
  if (![AI_API_MEMBER_PRODUCT_CODE, AI_API_BALANCE_1_PRODUCT_CODE, AI_API_BALANCE_10_PRODUCT_CODE].includes(productCode)) {
    throw new HttpError(400, '这个兑换码不是 AI API 兑换码。');
  }

  await markRedeemCodeUsed(env, user.id, code, now);

  if (productCode === AI_API_MEMBER_PRODUCT_CODE) {
    await grantAiApiMembershipByRedeem(env, user.id, Number(existing.duration_days || AI_API_MEMBER_DURATION_DAYS), now);
    return {
      ok: true,
      message: `兑换成功，API会员月卡已增加 ${Number(existing.duration_days || AI_API_MEMBER_DURATION_DAYS)} 天。`,
      dashboard: await getAiApiDashboard(env, user)
    };
  }

  const amount = normalizeMoney(existing.amount || (productCode === AI_API_BALANCE_10_PRODUCT_CODE ? '10.000' : '1.000'));
  await rechargeAiApiBalanceByRedeem(env, user.id, amount, now);
  return {
    ok: true,
    message: `兑换成功，API 余额已增加 ${amount} 元。`,
    dashboard: await getAiApiDashboard(env, user)
  };
}

async function getRedeemCodeRecord(env, code) {
  const existing = await env.MMC_DB.prepare(
    `
      SELECT *
      FROM remove_bg_redeem_codes
      WHERE code = ?
      LIMIT 1
    `
  ).bind(code).first();

  if (!existing) {
    throw new HttpError(404, '兑换码不存在，请检查后再试。');
  }
  if (existing.status !== 'active') {
    throw new HttpError(409, '这个兑换码已经使用过，不能重复兑换。');
  }
  return existing;
}

async function markRedeemCodeUsed(env, userId, code, now) {
  const redeemResult = await env.MMC_DB.prepare(
    `
      UPDATE remove_bg_redeem_codes
      SET status = 'redeemed',
          redeemed_by_user_id = ?,
          redeemed_at = ?,
          updated_at = ?
      WHERE code = ? AND status = 'active'
    `
  ).bind(userId, now, now, code).run();

  if (Number(redeemResult.meta?.changes || 0) === 0) {
    throw new HttpError(409, '这个兑换码刚刚已被使用，请换一个兑换码。');
  }
}

async function createAlipayRemoveBgOrder(request, env, user) {
  ensureAlipayConfigured(env);
  const billing = getRemoveBgBillingConfig(env);
  const now = nowIso();
  const orderId = generateId('order');
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  await env.MMC_DB.prepare(
    `
      INSERT INTO billing_orders (
        id, user_id, channel, product_code, subject, total_amount, status, expires_at, meta_json, created_at, updated_at
      )
      VALUES (?, ?, 'alipay', ?, ?, ?, 'pending', ?, ?, ?, ?)
    `
  ).bind(
    orderId,
    user.id,
    billing.productCode,
    billing.subject,
    billing.price,
    expiresAt,
    JSON.stringify({
      username: user.username,
      displayName: user.display_name,
      durationDays: billing.durationDays
    }),
    now,
    now
  ).run();

  const params = {
    app_id: env.ALIPAY_APP_ID,
    method: 'alipay.trade.page.pay',
    charset: 'utf-8',
    sign_type: 'RSA2',
    timestamp: formatAlipayTimestamp(new Date()),
    version: '1.0',
    notify_url: billing.notifyUrl,
    return_url: billing.returnUrl,
    biz_content: JSON.stringify({
      out_trade_no: orderId,
      product_code: 'FAST_INSTANT_TRADE_PAY',
      total_amount: billing.price,
      subject: billing.subject
    })
  };

  const sign = await signAlipayParams(params, env.ALIPAY_APP_PRIVATE_KEY);
  const payUrl = `${env.ALIPAY_GATEWAY_URL || ALIPAY_GATEWAY_URL}?${buildQueryString({ ...params, sign })}`;

  return {
    ok: true,
    orderId,
    payUrl,
    removeBg: await getRemoveBgAccessState(env, user)
  };
}

async function handleAlipayNotify(request, env) {
  ensureAlipayConfigured(env);
  const form = await request.formData();
  const params = {};
  for (const [key, value] of form.entries()) {
    params[key] = String(value);
  }

  const signature = params.sign || '';
  const verified = await verifyAlipaySignature(params, signature, env.ALIPAY_PUBLIC_KEY);
  if (!verified) {
    return new Response('failure', { status: 400 });
  }

  if (params.app_id !== env.ALIPAY_APP_ID) {
    return new Response('failure', { status: 400 });
  }

  const tradeStatus = params.trade_status || '';
  const orderId = params.out_trade_no || '';
  if (!orderId) {
    return new Response('failure', { status: 400 });
  }

  const order = await env.MMC_DB.prepare('SELECT * FROM billing_orders WHERE id = ? LIMIT 1').bind(orderId).first();
  if (!order) {
    return new Response('failure', { status: 404 });
  }

  if (normalizeMoney(order.total_amount) !== normalizeMoney(params.total_amount || '0')) {
    return new Response('failure', { status: 400 });
  }

  if (tradeStatus === 'TRADE_SUCCESS' || tradeStatus === 'TRADE_FINISHED') {
    await markOrderPaidAndGrantMembership(env, order, params);
    return new Response('success');
  }

  if (tradeStatus === 'TRADE_CLOSED') {
    await env.MMC_DB.prepare(
      `
        UPDATE billing_orders
        SET status = 'closed', gateway_trade_no = ?, meta_json = ?, updated_at = ?
        WHERE id = ?
      `
    ).bind(
      params.trade_no || null,
      JSON.stringify(params),
      nowIso(),
      order.id
    ).run();
    return new Response('success');
  }

  return new Response('success');
}

async function markOrderPaidAndGrantMembership(env, order, notifyParams) {
  if (order.status === 'paid') {
    return;
  }

  const billing = getRemoveBgBillingConfig(env);
  const now = nowIso();
  const expiresAt = addDaysIso(now, billing.durationDays);
  const existingMembership = await env.MMC_DB.prepare(
    `
      SELECT *
      FROM remove_bg_memberships
      WHERE user_id = ?
      LIMIT 1
    `
  ).bind(order.user_id).first();

  const nextStartAt = existingMembership?.expires_at && existingMembership.expires_at > now
    ? existingMembership.expires_at
    : now;
  const nextExpiresAt = addDaysIso(nextStartAt, billing.durationDays);

  await env.MMC_DB.batch([
    env.MMC_DB.prepare(
      `
        UPDATE billing_orders
        SET status = 'paid',
            gateway_trade_no = ?,
            paid_at = ?,
            expires_at = ?,
            meta_json = ?,
            updated_at = ?
        WHERE id = ?
      `
    ).bind(
      notifyParams.trade_no || null,
      now,
      expiresAt,
      JSON.stringify(notifyParams),
      now,
      order.id
    ),
    env.MMC_DB.prepare(
      `
        INSERT INTO remove_bg_memberships (
          user_id, plan_code, status, started_at, expires_at, created_at, updated_at
        )
        VALUES (?, ?, 'active', ?, ?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET
          plan_code = excluded.plan_code,
          status = 'active',
          started_at = CASE
            WHEN remove_bg_memberships.expires_at IS NOT NULL AND remove_bg_memberships.expires_at > excluded.started_at
              THEN remove_bg_memberships.started_at
            ELSE excluded.started_at
          END,
          expires_at = excluded.expires_at,
          updated_at = excluded.updated_at
      `
    ).bind(
      order.user_id,
      REMOVE_BG_MEMBER_PLAN_CODE,
      nextStartAt,
      nextExpiresAt,
      now,
      now
    )
  ]);
}

function ensureAlipayConfigured(env) {
  if (!env.ALIPAY_APP_ID || !env.ALIPAY_APP_PRIVATE_KEY || !env.ALIPAY_PUBLIC_KEY) {
    throw new HttpError(500, '支付宝支付配置不完整，请先补齐环境变量。');
  }
}

async function registerUser(body, env) {
  const username = normalizeUsername(body?.username);
  const displayName = normalizeDisplayName(body?.displayName || username);
  const password = normalizePassword(body?.password);

  if (!env.ALLOW_PUBLIC_REGISTRATION || env.ALLOW_PUBLIC_REGISTRATION === 'false') {
    throw new HttpError(403, '当前站点暂时关闭公开注册。');
  }

  const existing = await env.MMC_DB.prepare('SELECT id FROM users WHERE username = ?').bind(username).first();
  if (existing) {
    throw new HttpError(409, '这个账号名已经被注册了。');
  }

  const salt = generateId('salt');
  const passwordHash = await derivePasswordHash(password, salt);
  const now = nowIso();
  const userId = generateId('user');
  const publicId = await allocateUserPublicId(env);
  const ownerCountRow = await env.MMC_DB.prepare("SELECT COUNT(*) AS count FROM users WHERE role = 'owner'").first();
  const role = Number(ownerCountRow?.count || 0) === 0 ? 'owner' : 'user';

  await env.MMC_DB.prepare(
    `
      INSERT INTO users (id, username, display_name, password_hash, password_salt, role, status, created_at, updated_at, public_id)
      VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?, ?)
    `
  ).bind(userId, username, displayName, passwordHash, salt, role, now, now, publicId).run();

  return {
    ok: true,
    message: role === 'owner' ? '注册成功，你现在是首个站长账号。' : '注册成功，现在可以直接登录了。'
  };
}

async function loginUser(body, env) {
  const username = normalizeUsername(body?.username);
  const password = normalizePassword(body?.password);

  const user = await env.MMC_DB.prepare('SELECT * FROM users WHERE username = ?').bind(username).first();
  if (!user || user.status !== 'active') {
    throw new HttpError(401, '账号不存在，或已被停用。');
  }

  const verified = await verifyPassword(password, user.password_salt, user.password_hash);
  if (!verified) {
    throw new HttpError(401, '密码不正确。');
  }

  const sessionToken = generateId('sess');
  const sessionHash = await sha256(sessionToken + (env.SESSION_SECRET || 'mmc-dev-secret'));
  const sessionId = generateId('dbsess');
  const now = nowIso();
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 86400000).toISOString();

  await env.MMC_DB.prepare(
    `
      INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at, last_seen_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `
  ).bind(sessionId, user.id, sessionHash, expiresAt, now, now).run();

  const headers = new Headers();
  headers.append('set-cookie', buildSessionCookie(sessionToken, expiresAt));
  return withHeaders(json({ ok: true, user: serializeUser(user) }), headers);
}

async function logoutUser(request, env) {
  const token = getCookie(request.headers.get('cookie'), SESSION_COOKIE);
  if (token) {
    const tokenHash = await sha256(token + (env.SESSION_SECRET || 'mmc-dev-secret'));
    await env.MMC_DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(tokenHash).run();
  }

  const headers = new Headers();
  headers.append('set-cookie', clearSessionCookie());
  return withHeaders(json({ ok: true }), headers);
}

async function createFolderWithAssets(request, env, user) {
  const form = await request.formData();
  const name = normalizeFolderName(form.get('name'));
  const description = String(form.get('description') || '').trim().slice(0, 600);
  const slug = normalizeSlug(String(form.get('slug') || name));
  const files = collectUploadFiles(form);
  const canPublishDirectly = ['admin', 'owner'].includes(user.role);
  const folderStatus = canPublishDirectly ? 'published' : 'pending_review';
  const assetStatus = canPublishDirectly ? 'published' : 'pending';

  if (!files.length) {
    throw new HttpError(400, '至少要上传一个图片或视频文件。');
  }

  if (files.length > MAX_FILES_PER_FOLDER) {
    throw new HttpError(400, `单次最多上传 ${MAX_FILES_PER_FOLDER} 个文件。`);
  }

  const slugExists = await env.MMC_DB.prepare('SELECT id FROM folders WHERE slug = ?').bind(slug).first();
  if (slugExists) {
    throw new HttpError(409, '这个文件夹路径已经有人用了，请换一个名称。');
  }

  const folderId = generateId('folder');
  const now = nowIso();

  await env.MMC_DB.prepare(
    `
      INSERT INTO folders (id, owner_user_id, name, slug, description, status, published_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
  ).bind(folderId, user.id, name, slug, description, folderStatus, canPublishDirectly ? now : null, now, now).run();

  await writeUploadedAssets(env, {
    files,
    folderId,
    userId: user.id,
    assetStatus,
    publishedAt: canPublishDirectly ? now : null,
    now
  });

  await addReviewLog(env, folderId, user.id, canPublishDirectly ? 'approve' : 'submit', canPublishDirectly ? '管理员/站长直接发布' : '用户提交审核');
  return {
    ok: true,
    message: canPublishDirectly ? '文件夹已直接发布。' : '文件夹已经提交审核，管理员审核通过后就会自动公开。',
    folder: await getFolderById(env, folderId, user)
  };
}

async function getFoldersForUser(env, userId) {
  const folderRows = await env.MMC_DB.prepare(
    `
      SELECT *
      FROM folders
      WHERE owner_user_id = ?
      ORDER BY datetime(created_at) DESC
    `
  ).bind(userId).all();

  const folders = folderRows.results || [];
  return Promise.all(folders.map(folder => getFolderById(env, folder.id, { id: userId, role: 'user' })));
}

async function allocateUserPublicId(env) {
  const row = await env.MMC_DB.prepare('SELECT COALESCE(MAX(public_id), 10000) + 1 AS next_id FROM users').first();
  return Number(row?.next_id || 10001);
}

async function ensureUserPublicId(env, user) {
  if (Number(user?.public_id)) return Number(user.public_id);
  const publicId = await allocateUserPublicId(env);
  await env.MMC_DB.prepare('UPDATE users SET public_id = ?, updated_at = ? WHERE id = ?').bind(publicId, nowIso(), user.id).run();
  user.public_id = publicId;
  return publicId;
}

function serializeProfileUser(user, { includePrivate = false } = {}) {
  const base = {
    id: user.public_id,
    displayName: user.display_name,
    role: user.role,
    createdAt: user.created_at
  };
  if (includePrivate) {
    base.username = user.username;
    base.status = user.status;
  }
  return base;
}

async function getProfileUserByPublicId(env, publicId) {
  return env.MMC_DB.prepare('SELECT * FROM users WHERE public_id = ? AND status = ?').bind(publicId, 'active').first();
}

async function getOwnProfile(env, user) {
  const publicId = await ensureUserPublicId(env, user);
  const fresh = await getProfileUserByPublicId(env, publicId);
  return {
    viewer: serializeProfileUser(fresh, { includePrivate: true }),
    folders: await getFoldersForUser(env, fresh.id),
    favorites: await getFavoriteFolders(env, fresh.id),
    activities: await getRecentProfileActivity(env, fresh.id),
    stats: await getProfileStats(env, fresh.id),
    isOwner: true
  };
}

async function getPublicProfile(env, publicId, viewer = null) {
  const user = await getProfileUserByPublicId(env, publicId);
  if (!user) throw new HttpError(404, '这个个人中心不存在，或者账号不可用。');
  const isSelf = viewer?.id === user.id;
  if (isSelf) return getOwnProfile(env, viewer);
  return {
    viewer: serializeProfileUser(user),
    folders: await getPublishedFoldersForProfile(env, user.id),
    favorites: [],
    activities: [],
    stats: await getProfileStats(env, user.id),
    isOwner: false
  };
}

async function updateOwnProfile(env, user, body) {
  const displayName = normalizeDisplayName(body?.displayName || user.display_name);
  const now = nowIso();
  await env.MMC_DB.prepare('UPDATE users SET display_name = ?, updated_at = ? WHERE id = ?').bind(displayName, now, user.id).run();
  return getOwnProfile(env, { ...user, display_name: displayName, updated_at: now });
}

async function verifyProfileExportPassword(env, user, body) {
  const password = normalizePassword(body?.password);
  const fresh = await env.MMC_DB.prepare('SELECT * FROM users WHERE id = ?').bind(user.id).first();
  const verified = fresh && await verifyPassword(password, fresh.password_salt, fresh.password_hash);
  if (!verified) throw new HttpError(401, '密码不正确，无法保存账号信息。');
  await ensureUserPublicId(env, fresh);
  return {
    ok: true,
    account: {
      publicId: fresh.public_id,
      displayName: fresh.display_name,
      username: fresh.username
    }
  };
}

async function getPublishedFoldersForProfile(env, userId) {
  const rows = await env.MMC_DB.prepare(
    `
      SELECT f.*, u.display_name, u.public_id
      FROM folders f
      JOIN users u ON u.id = f.owner_user_id
      WHERE f.owner_user_id = ? AND f.status = 'published'
      ORDER BY datetime(COALESCE(f.updated_at, f.published_at, f.created_at)) DESC
    `
  ).bind(userId).all();
  return serializePublicFolderSummaries(env, rows.results || []);
}

async function getFavoriteFolders(env, userId) {
  const rows = await env.MMC_DB.prepare(
    `
      SELECT f.*, u.display_name, u.public_id, fav.created_at AS favorited_at
      FROM user_favorites fav
      JOIN folders f ON f.id = fav.folder_id
      JOIN users u ON u.id = f.owner_user_id
      WHERE fav.user_id = ? AND f.status = 'published'
      ORDER BY datetime(fav.created_at) DESC
    `
  ).bind(userId).all();
  return serializePublicFolderSummaries(env, rows.results || []);
}

async function addFavoriteFolder(env, userId, folderId) {
  const folder = await env.MMC_DB.prepare('SELECT id FROM folders WHERE id = ? AND status = ?').bind(folderId, 'published').first();
  if (!folder) throw new HttpError(404, '找不到可以收藏的内容。');
  await env.MMC_DB.prepare(
    'INSERT OR IGNORE INTO user_favorites (user_id, folder_id, created_at) VALUES (?, ?, ?)'
  ).bind(userId, folderId, nowIso()).run();
  return { ok: true, favorited: true };
}

async function removeFavoriteFolder(env, userId, folderId) {
  await env.MMC_DB.prepare('DELETE FROM user_favorites WHERE user_id = ? AND folder_id = ?').bind(userId, folderId).run();
  return { ok: true, favorited: false };
}

async function isFolderFavorited(env, userId, folderId) {
  const row = await env.MMC_DB.prepare(
    'SELECT 1 FROM user_favorites WHERE user_id = ? AND folder_id = ? LIMIT 1'
  ).bind(userId, folderId).first();
  return Boolean(row);
}

async function addFolderLike(env, userId, folderId) {
  await assertPublishedFolder(env, folderId);
  await env.MMC_DB.prepare(
    'INSERT OR IGNORE INTO folder_likes (user_id, folder_id, created_at) VALUES (?, ?, ?)'
  ).bind(userId, folderId, nowIso()).run();
  return getFolderSocialState(env, folderId, userId);
}

async function removeFolderLike(env, userId, folderId) {
  await env.MMC_DB.prepare('DELETE FROM folder_likes WHERE user_id = ? AND folder_id = ?').bind(userId, folderId).run();
  return getFolderSocialState(env, folderId, userId);
}

async function followProfile(env, followerUserId, publicId) {
  const target = await getProfileUserByPublicId(env, publicId);
  if (!target) throw new HttpError(404, '这个发布者不存在，或者账号不可用。');
  await env.MMC_DB.prepare(
    'INSERT OR IGNORE INTO user_follows (follower_user_id, following_user_id, created_at) VALUES (?, ?, ?)'
  ).bind(followerUserId, target.id, nowIso()).run();
  return getFollowState(env, followerUserId, target.id);
}

async function unfollowProfile(env, followerUserId, publicId) {
  const target = await getProfileUserByPublicId(env, publicId);
  if (!target) throw new HttpError(404, '这个发布者不存在，或者账号不可用。');
  await env.MMC_DB.prepare(
    'DELETE FROM user_follows WHERE follower_user_id = ? AND following_user_id = ?'
  ).bind(followerUserId, target.id).run();
  return getFollowState(env, followerUserId, target.id);
}

async function getFolderSocialState(env, folderId, userId = null) {
  const [likeCount, commentCount] = await Promise.all([
    countFolderLikes(env, folderId),
    countFolderComments(env, folderId)
  ]);
  const isLiked = userId ? await isFolderLiked(env, userId, folderId) : false;
  return { ok: true, likeCount, commentCount, isLiked };
}

async function getFollowState(env, followerUserId, followingUserId) {
  const [followerCount, isFollowingOwner] = await Promise.all([
    countFollowers(env, followingUserId),
    followerUserId ? isFollowingUser(env, followerUserId, followingUserId) : false
  ]);
  return { ok: true, followerCount, isFollowingOwner };
}

async function countFolderLikes(env, folderId) {
  const row = await env.MMC_DB.prepare('SELECT COUNT(*) AS count FROM folder_likes WHERE folder_id = ?').bind(folderId).first();
  return Number(row?.count || 0);
}

async function isFolderLiked(env, userId, folderId) {
  const row = await env.MMC_DB.prepare('SELECT 1 FROM folder_likes WHERE user_id = ? AND folder_id = ? LIMIT 1').bind(userId, folderId).first();
  return Boolean(row);
}

async function countFollowers(env, userId) {
  const row = await env.MMC_DB.prepare('SELECT COUNT(*) AS count FROM user_follows WHERE following_user_id = ?').bind(userId).first();
  return Number(row?.count || 0);
}

async function isFollowingUser(env, followerUserId, followingUserId) {
  const row = await env.MMC_DB.prepare('SELECT 1 FROM user_follows WHERE follower_user_id = ? AND following_user_id = ? LIMIT 1').bind(followerUserId, followingUserId).first();
  return Boolean(row);
}

async function assertPublishedFolder(env, folderId) {
  const folder = await env.MMC_DB.prepare('SELECT id FROM folders WHERE id = ? AND status = ?').bind(folderId, 'published').first();
  if (!folder) throw new HttpError(404, '找不到这个公开内容。');
  return folder;
}

async function countFolderComments(env, folderId) {
  const row = await env.MMC_DB.prepare('SELECT COUNT(*) AS count FROM folder_comments WHERE folder_id = ? AND status = ?').bind(folderId, 'published').first();
  return Number(row?.count || 0);
}

async function getFolderComments(env, folderId, viewer = null) {
  await assertPublishedFolder(env, folderId);
  const rows = await env.MMC_DB.prepare(
    `
      SELECT c.*, u.display_name, u.public_id, u.username, u.role
      FROM folder_comments c
      JOIN users u ON u.id = c.user_id
      WHERE c.folder_id = ? AND c.status = 'published'
      ORDER BY datetime(c.created_at) DESC
      LIMIT 100
    `
  ).bind(folderId).all();
  const comments = rows.results || [];
  return comments.map(comment => ({
    id: comment.id,
    content: comment.content,
    createdAt: comment.created_at,
    updatedAt: comment.updated_at,
    authorName: comment.display_name,
    authorPublicId: Number(comment.public_id || 0),
    authorRole: comment.role,
    canDelete: canOperateComment(viewer, comment),
    canManage: canOperateComment(viewer, comment) && viewer?.id !== comment.user_id
  }));
}

async function addFolderComment(env, user, folderId, body) {
  await assertPublishedFolder(env, folderId);
  const content = normalizeFolderCommentContent(body?.content);
  const now = nowIso();
  const comment = {
    id: generateId('comment'),
    folderId,
    userId: user.id,
    content,
    status: 'published',
    createdAt: now,
    updatedAt: now
  };
  await env.MMC_DB.prepare(
    `
      INSERT INTO folder_comments (
        id, folder_id, user_id, content, status, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
  ).bind(comment.id, comment.folderId, comment.userId, comment.content, comment.status, comment.createdAt, comment.updatedAt).run();
  return { ok: true, comment, commentCount: await countFolderComments(env, folderId), comments: await getFolderComments(env, folderId, user) };
}

async function deleteFolderComment(env, user, commentId) {
  const comment = await env.MMC_DB.prepare(
    `
      SELECT c.*, f.owner_user_id, u.role AS author_role
      FROM folder_comments c
      JOIN folders f ON f.id = c.folder_id
      JOIN users u ON u.id = c.user_id
      WHERE c.id = ?
    `
  ).bind(commentId).first();
  if (!comment) throw new HttpError(404, '找不到这条评论。');
  if (!canOperateComment(user, { user_id: comment.user_id, role: comment.author_role })) {
    throw new HttpError(403, '你没有权限操作这条评论。');
  }
  await env.MMC_DB.prepare('UPDATE folder_comments SET status = ?, updated_at = ? WHERE id = ?').bind('deleted', nowIso(), commentId).run();
  return { ok: true, commentId, folderId: comment.folder_id, commentCount: await countFolderComments(env, comment.folder_id), comments: await getFolderComments(env, comment.folder_id, user) };
}

function canOperateComment(viewer, comment) {
  if (!viewer) return false;
  if (viewer.id === comment.user_id) return true;
  if (viewer.role === 'owner') return comment.role !== 'owner';
  if (viewer.role === 'admin') return comment.role === 'user';
  return false;
}

async function getRecentProfileActivity(env, userId) {
  const [
    foldersResult,
    commentsResult,
    likesResult,
    followsResult,
    receivedCommentsResult,
    receivedLikesResult,
    receivedFollowsResult
  ] = await Promise.all([
    env.MMC_DB.prepare(
      `
        SELECT id, name, slug, created_at, updated_at, published_at, status
        FROM folders
        WHERE owner_user_id = ?
      `
    ).bind(userId).all(),
    env.MMC_DB.prepare(
      `
        SELECT c.id, c.content, c.created_at, c.updated_at, f.name AS folder_name, f.slug AS folder_slug
        FROM folder_comments c
        JOIN folders f ON f.id = c.folder_id
        WHERE c.user_id = ?
        ORDER BY datetime(c.created_at) DESC
        LIMIT 20
      `
    ).bind(userId).all(),
    env.MMC_DB.prepare(
      `
        SELECT l.created_at, f.name AS folder_name, f.slug AS folder_slug
        FROM folder_likes l
        JOIN folders f ON f.id = l.folder_id
        WHERE l.user_id = ?
        ORDER BY datetime(l.created_at) DESC
        LIMIT 20
      `
    ).bind(userId).all(),
    env.MMC_DB.prepare(
      `
        SELECT fo.created_at, u.display_name AS following_name, u.public_id AS following_public_id
        FROM user_follows fo
        JOIN users u ON u.id = fo.following_user_id
        WHERE fo.follower_user_id = ?
        ORDER BY datetime(fo.created_at) DESC
        LIMIT 20
      `
    ).bind(userId).all(),
    env.MMC_DB.prepare(
      `
        SELECT c.id, c.content, c.created_at, c.updated_at, f.name AS folder_name, f.slug AS folder_slug,
               u.display_name AS actor_name, u.public_id AS actor_public_id
        FROM folder_comments c
        JOIN folders f ON f.id = c.folder_id
        JOIN users u ON u.id = c.user_id
        WHERE f.owner_user_id = ? AND c.status = 'published'
        ORDER BY datetime(c.created_at) DESC
        LIMIT 20
      `
    ).bind(userId).all(),
    env.MMC_DB.prepare(
      `
        SELECT l.created_at, f.name AS folder_name, f.slug AS folder_slug,
               u.display_name AS actor_name, u.public_id AS actor_public_id
        FROM folder_likes l
        JOIN folders f ON f.id = l.folder_id
        JOIN users u ON u.id = l.user_id
        WHERE f.owner_user_id = ?
        ORDER BY datetime(l.created_at) DESC
        LIMIT 20
      `
    ).bind(userId).all(),
    env.MMC_DB.prepare(
      `
        SELECT fo.created_at, u.display_name AS follower_name, u.public_id AS follower_public_id
        FROM user_follows fo
        JOIN users u ON u.id = fo.follower_user_id
        WHERE fo.following_user_id = ?
        ORDER BY datetime(fo.created_at) DESC
        LIMIT 20
      `
    ).bind(userId).all()
  ]);

  const activities = [];
  for (const folder of foldersResult.results || []) {
    activities.push({
      type: 'folder',
      title: `发布了《${folder.name}》`,
      link: `/${encodeURIComponent(folder.slug)}`,
      time: folder.updated_at || folder.published_at || folder.created_at,
      summary: folder.status === 'published' ? '已公开发布' : folderStatusLabel(folder.status)
    });
  }
  for (const comment of commentsResult.results || []) {
    activities.push({
      type: 'comment',
      title: `在《${comment.folder_name}》留下评论`,
      link: `/${encodeURIComponent(comment.folder_slug)}`,
      time: comment.updated_at || comment.created_at,
      summary: comment.content
    });
  }
  for (const like of likesResult.results || []) {
    activities.push({
      type: 'like',
      title: `点赞了《${like.folder_name}》`,
      link: `/${encodeURIComponent(like.folder_slug)}`,
      time: like.created_at,
      summary: '已点赞'
    });
  }
  for (const follow of followsResult.results || []) {
    activities.push({
      type: 'follow',
      title: `关注了 ${follow.following_name || '发布者'}`,
      link: follow.following_public_id ? `/profile/${follow.following_public_id}` : '/profile',
      time: follow.created_at,
      summary: '已关注'
    });
  }
  for (const comment of receivedCommentsResult.results || []) {
    activities.push({
      type: 'received-comment',
      title: `${comment.actor_name || '用户'} 评论了你的作品《${comment.folder_name}》`,
      link: `/${encodeURIComponent(comment.folder_slug)}`,
      time: comment.updated_at || comment.created_at,
      summary: comment.content
    });
  }
  for (const like of receivedLikesResult.results || []) {
    activities.push({
      type: 'received-like',
      title: `${like.actor_name || '用户'} 点赞了你的作品《${like.folder_name}》`,
      link: `/${encodeURIComponent(like.folder_slug)}`,
      time: like.created_at,
      summary: '作品收到点赞'
    });
  }
  for (const follow of receivedFollowsResult.results || []) {
    activities.push({
      type: 'received-follow',
      title: `${follow.follower_name || '用户'} 关注了你`,
      link: follow.follower_public_id ? `/profile/${follow.follower_public_id}` : '/profile',
      time: follow.created_at,
      summary: '收到关注'
    });
  }

  return activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 50);
}

async function getProfileStats(env, userId) {
  const [works, followers, likes, favorites, viewFolders] = await Promise.all([
    env.MMC_DB.prepare(
      'SELECT COUNT(*) AS count FROM folders WHERE owner_user_id = ? AND status = ?'
    ).bind(userId, 'published').first(),
    env.MMC_DB.prepare(
      'SELECT COUNT(*) AS count FROM user_follows WHERE following_user_id = ?'
    ).bind(userId).first(),
    env.MMC_DB.prepare(
      `
        SELECT COUNT(*) AS count
        FROM folder_likes l
        JOIN folders f ON f.id = l.folder_id
        WHERE f.owner_user_id = ? AND f.status = 'published'
      `
    ).bind(userId).first(),
    env.MMC_DB.prepare(
      `
        SELECT COUNT(*) AS count
        FROM user_favorites fav
        JOIN folders f ON f.id = fav.folder_id
        WHERE f.owner_user_id = ? AND f.status = 'published'
      `
    ).bind(userId).first(),
    env.MMC_DB.prepare(
      `
        SELECT id, slug, name, COALESCE(view_count, 0) AS view_count
        FROM folders
        WHERE owner_user_id = ? AND status = 'published'
      `
    ).bind(userId).all()
  ]);
  const viewRows = viewFolders.results || [];
  const boosts = await getFolderViewBoosts(env, viewRows.map(folder => folder.id));
  const views = viewRows.reduce((sum, folder) => sum + getFolderDisplayViewData(folder, boosts.get(folder.id)).viewCount, 0);

  return {
    works: Number(works?.count || 0),
    followers: Number(followers?.count || 0),
    likes: Number(likes?.count || 0),
    favorites: Number(favorites?.count || 0),
    views
  };
}

function normalizeFolderCommentContent(value) {
  const content = String(value || '').trim();
  if (!content) throw new HttpError(400, '评论内容不能为空。');
  if (content.length > 100) throw new HttpError(400, '评论内容不能超过 100 个字。');
  return content;
}

function folderStatusLabel(status) {
  return ({
    draft: '草稿',
    pending_review: '待审核',
    published: '已公开',
    rejected: '已驳回',
    offline: '已下架'
  })[status] || status;
}

async function appendAssetsToFolder(request, env, user, folderId) {
  const folder = await getEditableOwnedFolder(env, user.id, folderId);
  const form = await request.formData();
  const files = collectUploadFiles(form);

  if (!files.length) {
    throw new HttpError(400, '至少要追加一个图片或视频文件。');
  }

  const countRow = await env.MMC_DB.prepare('SELECT COUNT(*) AS count FROM assets WHERE folder_id = ?').bind(folderId).first();
  const existingCount = Number(countRow?.count || 0);
  if (existingCount + files.length > MAX_FILES_PER_FOLDER) {
    throw new HttpError(400, `单个文件夹最多保留 ${MAX_FILES_PER_FOLDER} 个文件。`);
  }

  const sortRow = await env.MMC_DB.prepare('SELECT COALESCE(MAX(sort_order), -1) AS max_sort FROM assets WHERE folder_id = ?').bind(folderId).first();
  let sortOrder = Number(sortRow?.max_sort ?? -1) + 1;
  const now = nowIso();

  await writeUploadedAssets(env, {
    files,
    folderId,
    userId: user.id,
    startSortOrder: sortOrder,
    assetStatus: folder.status === 'draft' ? 'pending' : 'rejected',
    now
  });

  await env.MMC_DB.prepare('UPDATE folders SET updated_at = ? WHERE id = ?').bind(now, folderId).run();
  return {
    ok: true,
    message: '内容已追加到这个文件夹。',
    folder: await getFolderById(env, folderId, user)
  };
}

async function deleteAssetFromFolder(env, user, folderId, assetId) {
  await getEditableOwnedFolder(env, user.id, folderId);
  const asset = await env.MMC_DB.prepare('SELECT * FROM assets WHERE id = ? AND folder_id = ?').bind(assetId, folderId).first();
  if (!asset) {
    throw new HttpError(404, '找不到这个内容。');
  }

  if (asset.r2_key) {
    await env.MMC_MEDIA.delete(asset.r2_key);
  }

  const now = nowIso();
  await env.MMC_DB.batch([
    env.MMC_DB.prepare('DELETE FROM assets WHERE id = ? AND folder_id = ?').bind(assetId, folderId),
    env.MMC_DB.prepare('UPDATE folders SET updated_at = ? WHERE id = ?').bind(now, folderId)
  ]);

  return {
    ok: true,
    message: '内容已删除。',
    folder: await getFolderById(env, folderId, user)
  };
}

async function resubmitFolderForReview(env, user, folderId) {
  await getEditableOwnedFolder(env, user.id, folderId);
  const countRow = await env.MMC_DB.prepare('SELECT COUNT(*) AS count FROM assets WHERE folder_id = ?').bind(folderId).first();
  if (Number(countRow?.count || 0) <= 0) {
    throw new HttpError(400, '请至少保留一个内容后再提交审核。');
  }

  const now = nowIso();
  await env.MMC_DB.batch([
    env.MMC_DB.prepare(
      `
        UPDATE folders
        SET status = 'pending_review', review_note = '', reviewed_by_user_id = NULL, reviewed_at = NULL, updated_at = ?
        WHERE id = ?
      `
    ).bind(now, folderId),
    env.MMC_DB.prepare(
      `
        UPDATE assets
        SET status = 'pending', published_at = NULL
        WHERE folder_id = ?
      `
    ).bind(folderId)
  ]);

  await addReviewLog(env, folderId, user.id, 'submit', '用户修改后重新提交审核');
  return {
    ok: true,
    message: '文件夹已重新提交审核。',
    folder: await getFolderById(env, folderId, user)
  };
}

async function appendAssetsToFolderAsAdmin(request, env, actor, folderId) {
  const folder = await getAdminManageableFolder(env, folderId);
  const form = await request.formData();
  const files = collectUploadFiles(form);

  if (!files.length) {
    throw new HttpError(400, '至少要追加一个图片或视频文件。');
  }

  const countRow = await env.MMC_DB.prepare('SELECT COUNT(*) AS count FROM assets WHERE folder_id = ?').bind(folderId).first();
  const existingCount = Number(countRow?.count || 0);
  if (existingCount + files.length > MAX_FILES_PER_FOLDER) {
    throw new HttpError(400, `单个文件夹最多保留 ${MAX_FILES_PER_FOLDER} 个文件。`);
  }

  const sortRow = await env.MMC_DB.prepare('SELECT COALESCE(MAX(sort_order), -1) AS max_sort FROM assets WHERE folder_id = ?').bind(folderId).first();
  let sortOrder = Number(sortRow?.max_sort ?? -1) + 1;
  const now = nowIso();
  const { assetStatus, publishedAt } = getAssetWriteStateForFolderStatus(folder.status, now);

  await writeUploadedAssets(env, {
    files,
    folderId,
    userId: actor.id,
    startSortOrder: sortOrder,
    assetStatus,
    publishedAt,
    now
  });

  await env.MMC_DB.prepare('UPDATE folders SET updated_at = ? WHERE id = ?').bind(now, folderId).run();
  return {
    ok: true,
    message: '管理员已为这个文件夹追加资源。',
    folder: await getFolderById(env, folderId, actor)
  };
}

async function deleteAssetFromFolderAsAdmin(env, actor, folderId, assetId) {
  await getAdminManageableFolder(env, folderId);
  const asset = await env.MMC_DB.prepare('SELECT * FROM assets WHERE id = ? AND folder_id = ?').bind(assetId, folderId).first();
  if (!asset) {
    throw new HttpError(404, '找不到这个内容。');
  }

  if (asset.r2_key) {
    await env.MMC_MEDIA.delete(asset.r2_key);
  }

  const now = nowIso();
  await env.MMC_DB.batch([
    env.MMC_DB.prepare('DELETE FROM assets WHERE id = ? AND folder_id = ?').bind(assetId, folderId),
    env.MMC_DB.prepare('UPDATE folders SET updated_at = ? WHERE id = ?').bind(now, folderId)
  ]);

  return {
    ok: true,
    message: '管理员已删除这个资源。',
    folder: await getFolderById(env, folderId, actor)
  };
}

async function updateFolderAsAdmin(env, actor, folderId, body) {
  const folder = await getAdminManageableFolder(env, folderId);
  const name = normalizeFolderName(body?.name ?? folder.name);
  const slug = normalizeSlug(body?.slug ?? name);
  const description = String(body?.description ?? folder.description ?? '').trim().slice(0, 600);
  const nextStatus = normalizeManagedFolderStatus(body?.status ?? folder.status);

  if (slug !== folder.slug) {
    const slugExists = await env.MMC_DB.prepare('SELECT id FROM folders WHERE slug = ? AND id != ?').bind(slug, folderId).first();
    if (slugExists) {
    throw new HttpError(409, '这个公开路径已经被别的文件夹占用了，请换一个。');
    }
  }

  const now = nowIso();
  const { assetStatus, publishedAt } = getAssetWriteStateForFolderStatus(nextStatus, now);
  await env.MMC_DB.batch([
    env.MMC_DB.prepare(
      `
        UPDATE folders
        SET name = ?, slug = ?, description = ?, status = ?, published_at = ?, updated_at = ?
        WHERE id = ?
      `
    ).bind(name, slug, description, nextStatus, nextStatus === 'published' ? (folder.published_at || publishedAt || now) : null, now, folderId),
    env.MMC_DB.prepare(
      `
        UPDATE assets
        SET status = ?, published_at = ?
        WHERE folder_id = ?
      `
    ).bind(assetStatus, publishedAt, folderId)
  ]);

  return {
    ok: true,
    message: '文件夹信息已更新。',
    folder: await getFolderById(env, folderId, actor)
  };
}

async function getFolderById(env, folderId, viewer = null) {
  const folder = await env.MMC_DB.prepare(
    `
      SELECT f.*, u.username, u.display_name
      FROM folders f
      JOIN users u ON u.id = f.owner_user_id
      WHERE f.id = ?
    `
  ).bind(folderId).first();
  if (!folder) return null;

  const assetsResult = await env.MMC_DB.prepare(
    `
      SELECT *
      FROM assets
      WHERE folder_id = ?
      ORDER BY sort_order ASC, created_at ASC
    `
  ).bind(folderId).all();
  const displayViews = getFolderDisplayViewData(folder, await getFolderViewBoost(env, folder.id));

  const serialized = {
    ...folder,
    ownerName: folder.display_name,
    ownerUsername: folder.username,
    assetCount: (assetsResult.results || []).length,
    viewCount: displayViews.viewCount,
    publicUrl: folder.status === 'published' ? `/${encodeURIComponent(folder.slug)}` : null,
    assets: (assetsResult.results || []).map(asset => ({
      ...asset,
      previewUrl: canPreviewAsset(asset, folder, viewer) ? `/media/${encodeURIComponent(asset.id)}` : null
    }))
  };
  if (canSeeRealViewCount(viewer)) {
    serialized.realViewCount = displayViews.realViewCount;
    serialized.viewBoost = displayViews.viewBoost;
  }
  return serialized;
}

async function getReviewQueue(env, { limit = 50 } = {}) {
  const rows = await env.MMC_DB.prepare(
    `
      SELECT f.*, u.username, u.display_name
      FROM folders f
      JOIN users u ON u.id = f.owner_user_id
      WHERE f.status = 'pending_review'
      ORDER BY datetime(f.updated_at) DESC
      LIMIT ?
    `
  ).bind(Math.max(1, Math.min(100, Number.parseInt(limit, 10) || 50))).all();

  return Promise.all((rows.results || []).map(folder => getFolderForReview(env, folder)));
}

async function getFolderForReview(env, folder) {
  const [assets, countRow] = await Promise.all([
    env.MMC_DB.prepare(
    `
      SELECT id, original_name, mime_type, media_kind, size_bytes, sort_order, status, created_at
      FROM assets
      WHERE folder_id = ?
      ORDER BY sort_order ASC, created_at ASC
      LIMIT 6
    `
    ).bind(folder.id).all(),
    env.MMC_DB.prepare('SELECT COUNT(*) AS count FROM assets WHERE folder_id = ?').bind(folder.id).first()
  ]);

  return {
    ...folder,
    assetCount: Number(countRow?.count || 0),
    assets: (assets.results || []).map(asset => ({
      ...asset,
      previewUrl: `/media/${encodeURIComponent(asset.id)}`
    }))
  };
}

async function reviewFolder(env, reviewer, folderId, body) {
  const action = String(body?.action || '').trim();
  const note = String(body?.note || '').trim().slice(0, 400);
  const folder = await env.MMC_DB.prepare('SELECT * FROM folders WHERE id = ?').bind(folderId).first();

  if (!folder) {
    throw new HttpError(404, '找不到这个待审核文件夹。');
  }

  let nextStatus;
  let assetStatus;
  let publishedAt = null;

  if (action === 'approve') {
    nextStatus = 'published';
    assetStatus = 'published';
    publishedAt = nowIso();
  } else if (action === 'reject') {
    nextStatus = 'rejected';
    assetStatus = 'rejected';
  } else if (action === 'offline') {
    nextStatus = 'offline';
    assetStatus = 'rejected';
  } else {
    throw new HttpError(400, '审核动作无效。');
  }

  const reviewedAt = nowIso();
  if (action === 'offline') {
    const assetsResult = await env.MMC_DB.prepare('SELECT r2_key FROM assets WHERE folder_id = ?').bind(folderId).all();
    const assetKeys = (assetsResult.results || []).map(asset => asset.r2_key).filter(Boolean);
    if (assetKeys.length) {
      await env.MMC_MEDIA.delete(assetKeys);
    }
    await env.MMC_DB.batch([
      env.MMC_DB.prepare(
        `
          UPDATE folders
          SET status = ?, review_note = ?, reviewed_by_user_id = ?, reviewed_at = ?, published_at = NULL, updated_at = ?
          WHERE id = ?
        `
      ).bind(nextStatus, note, reviewer.id, reviewedAt, reviewedAt, folderId),
      env.MMC_DB.prepare('DELETE FROM assets WHERE folder_id = ?').bind(folderId)
    ]);
  } else {
    await env.MMC_DB.batch([
      env.MMC_DB.prepare(
        `
          UPDATE folders
          SET status = ?, review_note = ?, reviewed_by_user_id = ?, reviewed_at = ?, published_at = COALESCE(?, published_at), updated_at = ?
          WHERE id = ?
        `
      ).bind(nextStatus, note, reviewer.id, reviewedAt, publishedAt, reviewedAt, folderId),
      env.MMC_DB.prepare(
        `
          UPDATE assets
          SET status = ?, published_at = CASE WHEN ? = 'published' THEN ? ELSE published_at END
          WHERE folder_id = ?
        `
      ).bind(assetStatus, assetStatus, reviewedAt, folderId)
    ]);
  }

  await addReviewLog(env, folderId, reviewer.id, action, note || '无备注');
  return {
    ok: true,
    message: action === 'approve' ? '审核通过，前台已经可以访问这个文件夹了。' : '审核结果已保存。',
    folder: await getFolderById(env, folderId, reviewer)
  };
}

async function getUsersForOwner(env) {
  const rows = await env.MMC_DB.prepare(
    `
      SELECT id, username, display_name, role, status, created_at, updated_at
      FROM users
      ORDER BY CASE role WHEN 'owner' THEN 0 WHEN 'admin' THEN 1 ELSE 2 END, datetime(created_at) ASC
    `
  ).all();
  return rows.results || [];
}

async function getRemoveBgRedeemCodes(env) {
  const rows = await env.MMC_DB.prepare(
    `
      SELECT c.code,
             c.product_code,
             c.amount,
             c.duration_days,
             c.status,
             c.created_at,
             c.redeemed_at,
             creator.username AS created_by_username,
             creator.display_name AS created_by_name,
             redeemer.username AS redeemed_by_username,
             redeemer.display_name AS redeemed_by_name
      FROM remove_bg_redeem_codes c
      LEFT JOIN users creator ON creator.id = c.created_by_user_id
      LEFT JOIN users redeemer ON redeemer.id = c.redeemed_by_user_id
      ORDER BY datetime(c.created_at) DESC
      LIMIT 500
    `
  ).all();
  return rows.results || [];
}

async function getAiApiUsersForOwner(env) {
  const usageDate = getLocalDateString(AI_API_TIMEZONE);
  const rows = await env.MMC_DB.prepare(
    `
      SELECT u.id,
             u.username,
             u.display_name,
             u.role,
             COALESCE(b.balance, '0.000') AS balance,
             COALESCE(k.key_count, 0) AS key_count,
             COALESCE(k.active_key_count, 0) AS active_key_count,
             k.last_used_at,
             m.status AS membership_status,
             m.expires_at AS membership_expires_at,
             COALESCE(d.success_count, 0) AS success_count,
             COALESCE(d.failed_count, 0) AS failed_count,
             COALESCE(d.charged_count, 0) AS charged_count,
             COALESCE(d.total_cost, '0.000') AS total_cost
      FROM users u
      LEFT JOIN ai_api_balances b ON b.user_id = u.id
      LEFT JOIN (
        SELECT user_id,
               COUNT(*) AS key_count,
               SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active_key_count,
               MAX(last_used_at) AS last_used_at
        FROM ai_api_keys
        GROUP BY user_id
      ) k ON k.user_id = u.id
      LEFT JOIN ai_api_memberships m ON m.user_id = u.id AND m.status = 'active' AND (m.expires_at IS NULL OR m.expires_at > CURRENT_TIMESTAMP)
      LEFT JOIN ai_api_daily_usage d ON d.user_id = u.id AND d.usage_date = ?
      ORDER BY datetime(u.created_at) DESC
      LIMIT 500
    `
  ).bind(usageDate).all();

  return (rows.results || []).map(row => ({
    ...row,
    balance: formatMoney(row.balance || '0'),
    total_cost: formatMoney(row.total_cost || '0')
  }));
}

async function rechargeAiApiBalance(env, actor, userId, body) {
  const amount = normalizePositiveMoney(body?.amount);
  const note = String(body?.note || '站长手动充值').trim().slice(0, 200);
  const now = nowIso();
  const user = await env.MMC_DB.prepare('SELECT id FROM users WHERE id = ? LIMIT 1').bind(userId).first();
  if (!user) {
    throw new HttpError(404, '找不到这个用户。');
  }

  const balanceRow = await env.MMC_DB.prepare('SELECT balance FROM ai_api_balances WHERE user_id = ? LIMIT 1').bind(userId).first();
  const nextBalance = addMoney(balanceRow?.balance || '0', amount);

  await env.MMC_DB.batch([
    env.MMC_DB.prepare(
      `
        INSERT INTO ai_api_balances (user_id, balance, updated_at)
        VALUES (?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET
          balance = excluded.balance,
          updated_at = excluded.updated_at
      `
    ).bind(userId, nextBalance, now),
    env.MMC_DB.prepare(
      `
        INSERT INTO ai_api_balance_logs (id, user_id, actor_user_id, type, amount, balance_after, note, created_at)
        VALUES (?, ?, ?, 'recharge', ?, ?, ?, ?)
      `
    ).bind(generateId('apilog'), userId, actor.id, amount, nextBalance, note, now)
  ]);

  return {
    ok: true,
    message: `已充值 ${amount} 元。`,
    users: await getAiApiUsersForOwner(env)
  };
}

async function grantAiApiMembership(env, actor, userId, body) {
  const days = Math.max(1, Math.min(365, Number.parseInt(body?.days || AI_API_MEMBER_DURATION_DAYS, 10) || AI_API_MEMBER_DURATION_DAYS));
  const now = nowIso();
  const user = await env.MMC_DB.prepare('SELECT id FROM users WHERE id = ? LIMIT 1').bind(userId).first();
  if (!user) {
    throw new HttpError(404, '找不到这个用户。');
  }

  const existing = await env.MMC_DB.prepare('SELECT * FROM ai_api_memberships WHERE user_id = ? LIMIT 1').bind(userId).first();
  const nextStartAt = existing?.expires_at && existing.expires_at > now ? existing.expires_at : now;
  const nextExpiresAt = addDaysIso(nextStartAt, days);

  await env.MMC_DB.batch([
    env.MMC_DB.prepare(
      `
        INSERT INTO ai_api_memberships (user_id, status, started_at, expires_at, created_at, updated_at)
        VALUES (?, 'active', ?, ?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET
          status = 'active',
          started_at = CASE
            WHEN ai_api_memberships.expires_at IS NOT NULL AND ai_api_memberships.expires_at > excluded.started_at
              THEN ai_api_memberships.started_at
            ELSE excluded.started_at
          END,
          expires_at = excluded.expires_at,
          updated_at = excluded.updated_at
      `
    ).bind(userId, nextStartAt, nextExpiresAt, now, now),
    env.MMC_DB.prepare(
      `
        INSERT INTO ai_api_balance_logs (id, user_id, actor_user_id, type, amount, balance_after, note, created_at)
        VALUES (?, ?, ?, 'adjust', '0.000', COALESCE((SELECT balance FROM ai_api_balances WHERE user_id = ?), '0.000'), ?, ?)
      `
    ).bind(generateId('apilog'), userId, actor.id, userId, `站长开通 API 调用会员 ${days} 天`, now)
  ]);

  return {
    ok: true,
    message: `已开通 API 调用会员 ${days} 天。`,
    users: await getAiApiUsersForOwner(env)
  };
}

async function rechargeAiApiBalanceByRedeem(env, userId, amount, now = nowIso()) {
  const normalizedAmount = normalizePositiveMoney(amount);
  const balanceRow = await env.MMC_DB.prepare('SELECT balance FROM ai_api_balances WHERE user_id = ? LIMIT 1').bind(userId).first();
  const nextBalance = addMoney(balanceRow?.balance || '0', normalizedAmount);

  await env.MMC_DB.batch([
    env.MMC_DB.prepare(
      `
        INSERT INTO ai_api_balances (user_id, balance, updated_at)
        VALUES (?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET
          balance = excluded.balance,
          updated_at = excluded.updated_at
      `
    ).bind(userId, nextBalance, now),
    env.MMC_DB.prepare(
      `
        INSERT INTO ai_api_balance_logs (id, user_id, actor_user_id, type, amount, balance_after, note, created_at)
        VALUES (?, ?, NULL, 'recharge', ?, ?, '兑换码充值 API 余额', ?)
      `
    ).bind(generateId('apilog'), userId, normalizedAmount, nextBalance, now)
  ]);
}

async function grantAiApiMembershipByRedeem(env, userId, days, now = nowIso()) {
  const safeDays = Math.max(1, Math.min(365, Number.parseInt(days || AI_API_MEMBER_DURATION_DAYS, 10) || AI_API_MEMBER_DURATION_DAYS));
  const existing = await env.MMC_DB.prepare('SELECT * FROM ai_api_memberships WHERE user_id = ? LIMIT 1').bind(userId).first();
  const nextStartAt = existing?.expires_at && existing.expires_at > now ? existing.expires_at : now;
  const nextExpiresAt = addDaysIso(nextStartAt, safeDays);

  await env.MMC_DB.batch([
    env.MMC_DB.prepare(
      `
        INSERT INTO ai_api_memberships (user_id, status, started_at, expires_at, created_at, updated_at)
        VALUES (?, 'active', ?, ?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET
          status = 'active',
          started_at = CASE
            WHEN ai_api_memberships.expires_at IS NOT NULL AND ai_api_memberships.expires_at > excluded.started_at
              THEN ai_api_memberships.started_at
            ELSE excluded.started_at
          END,
          expires_at = excluded.expires_at,
          updated_at = excluded.updated_at
      `
    ).bind(userId, nextStartAt, nextExpiresAt, now, now),
    env.MMC_DB.prepare(
      `
        INSERT INTO ai_api_balance_logs (id, user_id, actor_user_id, type, amount, balance_after, note, created_at)
        VALUES (?, ?, NULL, 'adjust', '0.000', COALESCE((SELECT balance FROM ai_api_balances WHERE user_id = ?), '0.000'), ?, ?)
      `
    ).bind(generateId('apilog'), userId, userId, `兑换码开通 API 调用会员 ${safeDays} 天`, now)
  ]);
}

async function addRemoveBgRedeemCodes(env, owner, body) {
  const product = normalizeRedeemProduct(body?.productCode || body?.product_code);
  const codes = String(body?.codes || body?.code || '')
    .split(/[\r\n,，\s]+/u)
    .map(normalizeRedeemCode)
    .filter(Boolean);
  const uniqueCodes = [...new Set(codes)];

  if (!uniqueCodes.length) {
    throw new HttpError(400, '请输入至少一个兑换码。');
  }
  if (uniqueCodes.length > 200) {
    throw new HttpError(400, '单次最多添加 200 个兑换码。');
  }

  const now = nowIso();
  let inserted = 0;
  const duplicates = [];

  for (const code of uniqueCodes) {
    const result = await env.MMC_DB.prepare(
      `
        INSERT OR IGNORE INTO remove_bg_redeem_codes (
          code, product_code, amount, duration_days, status, created_by_user_id, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, 'active', ?, ?, ?)
      `
    ).bind(code, product.code, product.amount, product.durationDays, owner.id, now, now).run();

    if (Number(result.meta?.changes || 0) > 0) {
      inserted += 1;
    } else {
      duplicates.push(code);
    }
  }

  return {
    ok: true,
    inserted,
    duplicates,
    message: duplicates.length
      ? `已添加 ${inserted} 个${product.label}，${duplicates.length} 个已存在未重复添加。`
      : `已添加 ${inserted} 个${product.label}。`,
    codes: await getRemoveBgRedeemCodes(env)
  };
}

function normalizeRedeemProduct(value) {
  const code = String(value || REMOVE_BG_MEMBER_PRODUCT_CODE).trim();
  if (code === REMOVE_BG_MEMBER_PRODUCT_CODE) {
    return {
      code: REMOVE_BG_MEMBER_PRODUCT_CODE,
      label: '抠图会员月卡兑换码',
      amount: '0.000',
      durationDays: 30
    };
  }
  if (code === AI_API_MEMBER_PRODUCT_CODE) {
    return {
      code: AI_API_MEMBER_PRODUCT_CODE,
      label: 'API会员月卡兑换码',
      amount: '0.000',
      durationDays: AI_API_MEMBER_DURATION_DAYS
    };
  }
  if (code === AI_API_BALANCE_1_PRODUCT_CODE) {
    return {
      code: AI_API_BALANCE_1_PRODUCT_CODE,
      label: 'API余额1元兑换码',
      amount: '1.000',
      durationDays: 0
    };
  }
  if (code === AI_API_BALANCE_10_PRODUCT_CODE) {
    return {
      code: AI_API_BALANCE_10_PRODUCT_CODE,
      label: 'API余额10元兑换码',
      amount: '10.000',
      durationDays: 0
    };
  }
  throw new HttpError(400, '兑换码类型无效。');
}

async function getFoldersForAdmin(env, viewer, { limit = 50, search = '' } = {}) {
  const safeLimit = Math.max(1, Math.min(100, Number.parseInt(limit, 10) || 50));
  const query = String(search || '').trim().toLowerCase();
  const where = query
    ? `WHERE lower(f.name) LIKE ? OR lower(f.slug) LIKE ? OR lower(u.username) LIKE ? OR lower(u.display_name) LIKE ?`
    : '';
  const params = query ? [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`, safeLimit] : [safeLimit];
  const rows = await env.MMC_DB.prepare(
    `
      SELECT
        f.id,
        f.owner_user_id,
        f.name,
        f.slug,
        f.description,
        f.status,
        f.review_note,
        f.reviewed_by_user_id,
        f.reviewed_at,
        f.published_at,
        f.created_at,
        f.updated_at,
        COALESCE(f.view_count, 0) AS view_count,
        u.username,
        u.display_name,
        COUNT(a.id) AS asset_count,
        (
          SELECT ap.id
          FROM assets ap
          WHERE ap.folder_id = f.id
          ORDER BY ap.sort_order ASC, ap.created_at ASC
          LIMIT 1
        ) AS cover_asset_id,
        (
          SELECT ap.media_kind
          FROM assets ap
          WHERE ap.folder_id = f.id
          ORDER BY ap.sort_order ASC, ap.created_at ASC
          LIMIT 1
        ) AS cover_media_kind
      FROM folders f
      JOIN users u ON u.id = f.owner_user_id
      LEFT JOIN assets a ON a.folder_id = f.id
      ${where}
      GROUP BY f.id
      ORDER BY datetime(COALESCE(f.updated_at, f.created_at)) DESC
      LIMIT ?
    `
  ).bind(...params).all();

  const folders = rows.results || [];
  const boosts = await getFolderViewBoosts(env, folders.map(folder => folder.id));
  return folders.map(folder => {
    const displayViews = getFolderDisplayViewData(folder, boosts.get(folder.id));
    const serialized = {
      ...folder,
      ownerName: folder.display_name,
      ownerUsername: folder.username,
      assetCount: Number(folder.asset_count || 0),
      viewCount: displayViews.viewCount,
      publicUrl: folder.status === 'published' ? `/${encodeURIComponent(folder.slug)}` : null,
      assetsLoaded: false,
      assets: folder.cover_asset_id ? [{
        id: folder.cover_asset_id,
        original_name: 'cover',
        media_kind: folder.cover_media_kind || 'image',
        status: folder.status === 'published' ? 'published' : 'pending',
        previewUrl: `/media/${encodeURIComponent(folder.cover_asset_id)}`
      }] : []
    };
    if (canSeeRealViewCount(viewer)) {
      serialized.realViewCount = displayViews.realViewCount;
      serialized.viewBoost = displayViews.viewBoost;
    }
    return serialized;
  });
}

async function changeUserRole(env, owner, targetUserId, body) {
  const nextRole = String(body?.role || '').trim();
  if (!['user', 'admin'].includes(nextRole)) {
    throw new HttpError(400, '只能修改成普通用户或管理员。');
  }

  const target = await env.MMC_DB.prepare('SELECT * FROM users WHERE id = ?').bind(targetUserId).first();
  if (!target) {
    throw new HttpError(404, '用户不存在。');
  }
  if (target.role === 'owner') {
    throw new HttpError(400, '不能改动站长账号。');
  }

  await env.MMC_DB.prepare(
    'UPDATE users SET role = ?, updated_at = ? WHERE id = ?'
  ).bind(nextRole, nowIso(), targetUserId).run();

  return { ok: true, message: `已把 ${target.username} 调整为 ${nextRole}。` };
}

async function deleteUser(env, owner, targetUserId) {
  const target = await env.MMC_DB.prepare('SELECT * FROM users WHERE id = ?').bind(targetUserId).first();
  if (!target) {
    throw new HttpError(404, '用户不存在。');
  }
  if (target.role === 'owner') {
    throw new HttpError(400, '站长账号不能删除。');
  }

  await env.MMC_DB.prepare('DELETE FROM users WHERE id = ?').bind(targetUserId).run();
  return { ok: true, message: `已删除账号 ${target.username}。` };
}

async function deleteFolder(env, actor, folderId) {
  const folder = await env.MMC_DB.prepare(
    `
      SELECT f.*, u.username, u.display_name
      FROM folders f
      JOIN users u ON u.id = f.owner_user_id
      WHERE f.id = ?
    `
  ).bind(folderId).first();

  if (!folder) {
    throw new HttpError(404, '文件夹不存在。');
  }

  const assetsResult = await env.MMC_DB.prepare(
    'SELECT r2_key FROM assets WHERE folder_id = ?'
  ).bind(folderId).all();
  const assetKeys = (assetsResult.results || []).map(asset => asset.r2_key).filter(Boolean);

  if (assetKeys.length) {
    await env.MMC_MEDIA.delete(assetKeys);
  }

  await env.MMC_DB.prepare('DELETE FROM folders WHERE id = ?').bind(folderId).run();

  return {
    ok: true,
    message: `已删除文件夹 ${folder.name}。`,
    deletedFolder: {
      id: folder.id,
      name: folder.name,
      ownerUsername: folder.username,
      ownerName: folder.display_name
    }
  };
}

function canPreviewAsset(asset, folder, viewer) {
  if (asset.status === 'published' && folder.status === 'published') {
    return true;
  }
  if (!viewer) {
    return false;
  }
  if (viewer.role && viewer.role !== 'user') {
    return true;
  }
  return viewer.id === folder.owner_user_id;
}

function getAssetWriteStateForFolderStatus(folderStatus, now) {
  if (folderStatus === 'published') {
    return { assetStatus: 'published', publishedAt: now };
  }
  if (folderStatus === 'draft' || folderStatus === 'pending_review') {
    return { assetStatus: 'pending', publishedAt: null };
  }
  return { assetStatus: 'rejected', publishedAt: null };
}

function normalizeManagedFolderStatus(value) {
  const text = String(value || '').trim();
  if (!['draft', 'pending_review', 'published', 'rejected', 'offline'].includes(text)) {
    throw new HttpError(400, '文件夹状态无效。');
  }
  return text;
}

function serializePublicFolderSummary(folder, assetSummary, boost) {
  const displayViews = getFolderDisplayViewData(folder, boost);

  return {
    id: folder.id,
    name: folder.name,
    slug: folder.slug,
    description: folder.description,
    status: folder.status,
    ownerName: folder.display_name,
    ownerPublicId: Number(folder.public_id || 0),
    publishedAt: folder.published_at,
    updatedAt: folder.updated_at,
    viewCount: displayViews.viewCount,
    count: Number(assetSummary?.asset_count || 0),
    coverUrl: assetSummary?.cover_id ? `/media/${encodeURIComponent(assetSummary.cover_id)}` : null,
    coverMediaKind: assetSummary?.cover_media_kind || null
  };
}

async function serializePublicFolderSummaries(env, folders) {
  const summaries = new Map();
  const boosts = new Map();

  for (let i = 0; i < folders.length; i += 50) {
    const chunk = folders.slice(i, i + 50);
    const ids = chunk.map(folder => folder.id);
    const placeholders = ids.map(() => '?').join(',');
    const [assetRows, chunkBoosts] = await Promise.all([
      env.MMC_DB.prepare(
        `
          WITH ranked_assets AS (
            SELECT
              folder_id,
              id,
              media_kind,
              COUNT(*) OVER (PARTITION BY folder_id) AS asset_count,
              ROW_NUMBER() OVER (
                PARTITION BY folder_id
                ORDER BY sort_order ASC, created_at ASC
              ) AS cover_rank
            FROM assets
            WHERE status = 'published' AND folder_id IN (${placeholders})
          )
          SELECT
            folder_id,
            asset_count,
            id AS cover_id,
            media_kind AS cover_media_kind
          FROM ranked_assets
          WHERE cover_rank = 1
        `
      ).bind(...ids).all(),
      getFolderViewBoosts(env, ids)
    ]);

    for (const row of assetRows.results || []) summaries.set(row.folder_id, row);
    for (const [folderId, boost] of chunkBoosts) boosts.set(folderId, boost);
  }

  return folders.map(folder => serializePublicFolderSummary(
    folder,
    summaries.get(folder.id),
    boosts.get(folder.id)
  ));
}

async function incrementFolderViewCount(env, folderId) {
  await env.MMC_DB.prepare(
    `
      UPDATE folders
      SET view_count = COALESCE(view_count, 0) + 1
      WHERE id = ?
    `
  ).bind(folderId).run();
  const row = await env.MMC_DB.prepare('SELECT view_count FROM folders WHERE id = ?').bind(folderId).first();
  return Number(row?.view_count || 0);
}

async function promoteFolderViewBoost(env, owner, folderId) {
  const folder = await env.MMC_DB.prepare(
    `
      SELECT f.*, u.display_name, u.public_id
      FROM folders f
      JOIN users u ON u.id = f.owner_user_id
      WHERE f.id = ? AND f.status = 'published'
      LIMIT 1
    `
  ).bind(folderId).first();
  if (!folder) throw new HttpError(404, '找不到可以站长推的公开作品。');

  const allFoldersResult = await env.MMC_DB.prepare(
    `
      SELECT id, slug, name, COALESCE(view_count, 0) AS view_count
      FROM folders
      WHERE status = 'published'
      LIMIT 5000
    `
  ).all();
  const allFolders = allFoldersResult.results || [];
  const boosts = await getFolderViewBoosts(env, allFolders.map(item => item.id));
  const currentData = getFolderDisplayViewData(folder, boosts.get(folder.id));
  const otherMax = allFolders.reduce((max, item) => {
    if (item.id === folder.id) return max;
    return Math.max(max, getFolderDisplayViewData(item, boosts.get(item.id)).viewCount);
  }, 0);
  const targetDisplayViewCount = Math.max(
    currentData.viewCount + 1,
    otherMax + boostTargetOffset(folder)
  );
  const now = nowIso();
  const ratePerHour = boostRatePerHour(folder);

  await env.MMC_DB.prepare(
    `
      INSERT INTO folder_view_boosts (
        folder_id, status, started_at, base_real_view_count, base_display_view_count,
        target_display_view_count, rate_per_hour, created_by_user_id, updated_at
      )
      VALUES (?, 'active', ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(folder_id) DO UPDATE SET
        status = 'active',
        started_at = excluded.started_at,
        base_real_view_count = excluded.base_real_view_count,
        base_display_view_count = excluded.base_display_view_count,
        target_display_view_count = excluded.target_display_view_count,
        rate_per_hour = excluded.rate_per_hour,
        created_by_user_id = excluded.created_by_user_id,
        updated_at = excluded.updated_at
    `
  ).bind(
    folder.id,
    now,
    currentData.realViewCount,
    currentData.viewCount,
    targetDisplayViewCount,
    ratePerHour,
    owner.id,
    now
  ).run();

  const boost = await getFolderViewBoost(env, folder.id);
  const displayViews = getFolderDisplayViewData(folder, boost);
  return {
    ok: true,
    folderId: folder.id,
    viewCount: displayViews.viewCount,
    realViewCount: displayViews.realViewCount,
    boost: displayViews.viewBoost
  };
}

function parsePublicFolderPageInteger(value, name, fallback, min, max) {
  if (value === null || value === '') return fallback;
  if (!/^\d+$/.test(value)) throw new HttpError(400, `${name} 必须是整数。`);
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < min || number > max) {
    throw new HttpError(400, `${name} 必须在 ${min} 到 ${max} 之间。`);
  }
  return number;
}

async function getPublicFolderCount(env) {
  const row = await env.MMC_DB.prepare(
    "SELECT COUNT(*) AS total FROM folders WHERE status = 'published'"
  ).first();
  return Number(row?.total || 0);
}

async function getPublicFolders(env, limit = 24, offset = 0) {
  const rows = await env.MMC_DB.prepare(
    `
      SELECT f.*, u.display_name, u.public_id
      FROM folders f
      JOIN users u ON u.id = f.owner_user_id
      WHERE f.status = 'published'
      ORDER BY datetime(COALESCE(f.published_at, f.updated_at)) DESC, f.id DESC
      LIMIT ? OFFSET ?
    `
  ).bind(limit, offset).all();

  const folders = rows.results || [];
  return serializePublicFolderSummaries(env, folders);
}

async function getPublicFolderBySlug(env, slug, viewer = null) {
  const folder = await env.MMC_DB.prepare(
    `
      SELECT f.*, u.display_name, u.public_id
      FROM folders f
      JOIN users u ON u.id = f.owner_user_id
      WHERE f.slug = ? AND f.status = 'published'
    `
  ).bind(slug).first();

  if (!folder) {
    throw new HttpError(404, '这个分类暂时不存在，或者还没有通过审核。');
  }

  const realViewCount = await incrementFolderViewCount(env, folder.id);
  const countedFolder = { ...folder, view_count: realViewCount };
  const displayViews = getFolderDisplayViewData(countedFolder, await getFolderViewBoost(env, folder.id));

  const assets = await env.MMC_DB.prepare(
    `
      SELECT id, original_name, mime_type, media_kind, size_bytes, created_at
      FROM assets
      WHERE folder_id = ? AND status = 'published'
      ORDER BY sort_order ASC, created_at ASC
    `
  ).bind(folder.id).all();

  const [socialState, followerState, comments] = await Promise.all([
    getFolderSocialState(env, folder.id, viewer?.id || null),
    getFollowState(env, viewer?.id || null, folder.owner_user_id),
    getFolderComments(env, folder.id, viewer)
  ]);

  const serializedFolder = {
    id: folder.id,
    name: folder.name,
    slug: folder.slug,
    description: folder.description,
    ownerName: folder.display_name,
    ownerPublicId: Number(folder.public_id || 0),
    isFavorited: viewer ? await isFolderFavorited(env, viewer.id, folder.id) : false,
    publishedAt: folder.published_at,
    likeCount: socialState.likeCount,
    isLiked: socialState.isLiked,
    commentCount: socialState.commentCount,
    viewCount: displayViews.viewCount,
    followerCount: followerState.followerCount,
    isFollowingOwner: viewer ? followerState.isFollowingOwner : false
  };
  if (canSeeRealViewCount(viewer)) {
    serializedFolder.realViewCount = displayViews.realViewCount;
    serializedFolder.viewBoost = displayViews.viewBoost;
  }

  return {
    folder: serializedFolder,
    assets: (assets.results || []).map(asset => ({
      ...asset,
      url: `/media/${encodeURIComponent(asset.id)}`
    })),
    comments
  };
}

async function getSoftwareUpdatePayload(env, rawProjectId, searchParams) {
  const projectId = normalizeSoftwareProjectId(rawProjectId);
  const channel = normalizeSoftwareChannel(searchParams.get('channel') || 'prod');
  const currentVersion = normalizeSoftwareVersion(searchParams.get('currentVersion') || '', false);
  const releases = await getSoftwareReleases(env, {
    projectId,
    channel,
    activeOnly: true,
    limit: 50
  });
  const latest = releases[0] || null;
  const hasUpdate = Boolean(latest && currentVersion && compareVersions(latest.version, currentVersion) > 0);

  return {
    projectId,
    channel,
    currentVersion,
    hasUpdate,
    latest,
    history: releases
  };
}

async function getSoftwareReleases(env, options = {}) {
  const projectId = normalizeSoftwareProjectId(options.projectId || 'cs2-bot-improver');
  const channel = normalizeSoftwareChannel(options.channel || 'prod');
  const limit = Math.max(1, Math.min(Number(options.limit || 50), 100));
  const activeOnly = options.activeOnly !== false;
  const query = activeOnly
    ? `SELECT * FROM software_releases WHERE project_id = ? AND channel = ? AND is_active = 1 ORDER BY datetime(published_at) DESC, datetime(updated_at) DESC LIMIT ?`
    : `SELECT * FROM software_releases WHERE project_id = ? AND channel = ? ORDER BY datetime(published_at) DESC, datetime(updated_at) DESC LIMIT ?`;
  const rows = await env.MMC_DB.prepare(query).bind(projectId, channel, limit).all();
  const releases = (rows.results || []).map(serializeSoftwareRelease);
  releases.sort((a, b) => compareVersions(b.version, a.version) || String(b.publishedAt).localeCompare(String(a.publishedAt)));
  return releases;
}

async function upsertSoftwareRelease(env, userId, body) {
  const projectId = normalizeSoftwareProjectId(body?.projectId || 'cs2-bot-improver');
  const channel = normalizeSoftwareChannel(body?.channel || 'prod');
  const version = normalizeSoftwareVersion(body?.version || '', true);
  const title = String(body?.title || `v${version} 更新`).trim().slice(0, 160);
  const summary = String(body?.summary || '').trim().slice(0, 2000);
  const items = normalizeSoftwareReleaseItems(body?.items);
  const downloadUrl = normalizeSoftwareReleaseUrl(body?.downloadUrl || body?.download?.url || '');
  const downloadCode = String(body?.downloadCode || body?.download?.code || '').trim().slice(0, 80);
  const downloadLabel = String(body?.downloadLabel || body?.download?.label || '打开夸克网盘').trim().slice(0, 80);
  const downloadType = String(body?.downloadType || body?.download?.type || 'quark').trim().toLowerCase();
  const severity = normalizeSoftwareSeverity(body?.severity || 'recommended');
  const isActive = body?.isActive === false ? 0 : 1;
  const publishedAt = normalizeSoftwarePublishedAt(body?.publishedAt);
  const id = body?.id ? String(body.id).trim().slice(0, 80) : generateId('release');

  // 支持的下载类型：quark (夸克网盘), direct (直链), apk (Android APK)
  const allowedDownloadTypes = new Set(['quark', 'direct', 'apk']);
  if (!allowedDownloadTypes.has(downloadType)) {
    throw new HttpError(400, `不支持的下载类型：${downloadType}。允许的类型：quark, direct, apk`);
  }

  const now = nowIso();
  await env.MMC_DB.prepare(
    `
      INSERT INTO software_releases (
        id, project_id, channel, version, title, summary, items_json,
        download_type, download_label, download_url, download_code,
        severity, is_active, published_at,
        created_by_user_id, updated_by_user_id, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        updated_by_user_id = excluded.updated_by_user_id,
        updated_at = excluded.updated_at
    `
  ).bind(
    id,
    projectId,
    channel,
    version,
    title,
    summary,
    JSON.stringify(items),
    downloadType,
    downloadLabel,
    downloadUrl,
    downloadCode,
    severity,
    isActive,
    publishedAt,
    userId,
    userId,
    now,
    now
  ).run();

  return {
    ok: true,
    message: '软件更新记录已保存。',
    release: {
      projectId,
      channel,
      version,
      severity,
      isActive: Boolean(isActive)
    }
  };
}

function serializeSoftwareRelease(row) {
  let items = [];
  try {
    const parsed = JSON.parse(row.items_json || '[]');
    items = Array.isArray(parsed) ? parsed.map(item => String(item || '').trim()).filter(Boolean) : [];
  } catch {
    items = [];
  }

  return {
    id: row.id,
    projectId: row.project_id,
    channel: row.channel,
    version: row.version,
    title: row.title || `v${row.version} 更新`,
    summary: row.summary || '',
    items,
    severity: row.severity || 'recommended',
    isCritical: row.severity === 'critical',
    isActive: Boolean(row.is_active),
    publishedAt: row.published_at,
    download: {
      type: row.download_type || 'quark',
      label: row.download_label || '打开夸克网盘',
      url: row.download_url,
      code: row.download_code || ''
    }
  };
}

function normalizeSoftwareProjectId(value) {
  const projectId = String(value || '').trim().toLowerCase();
  if (!/^[a-z0-9-]{3,80}$/.test(projectId)) {
    throw new HttpError(400, '软件项目 ID 格式不正确。');
  }
  return projectId;
}

function normalizeSoftwareChannel(value) {
  const channel = String(value || 'prod').trim().toLowerCase();
  if (!SOFTWARE_RELEASE_CHANNELS.has(channel)) {
    throw new HttpError(400, '软件更新通道无效。');
  }
  return channel;
}

function normalizeSoftwareSeverity(value) {
  const severity = String(value || 'recommended').trim().toLowerCase();
  if (!SOFTWARE_RELEASE_SEVERITIES.has(severity)) {
    throw new HttpError(400, '软件更新强度无效。');
  }
  return severity;
}

function normalizeSoftwareVersion(value, required) {
  const version = String(value || '').trim().replace(/^v/i, '');
  if (!version) {
    if (required) throw new HttpError(400, '新版本必须填写版本号。');
    return '';
  }
  if (!/^\d+(?:\.\d+){0,3}(?:[-+][a-z0-9.-]+)?$/i.test(version)) {
    throw new HttpError(400, '版本号格式不正确。');
  }
  return version;
}

function normalizeSoftwareReleaseUrl(value) {
  const url = String(value || '').trim();
  if (!url) {
    throw new HttpError(400, '新版本必须提供夸克网盘链接。');
  }
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('unsupported protocol');
    }
    return parsed.toString();
  } catch {
    throw new HttpError(400, '夸克网盘链接格式不正确。');
  }
}

function normalizeSoftwarePublishedAt(value) {
  const raw = String(value || '').trim();
  if (!raw) return nowIso();
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    throw new HttpError(400, '发布时间格式不正确。');
  }
  return date.toISOString();
}

function normalizeSoftwareReleaseItems(value) {
  if (Array.isArray(value)) {
    return value.map(item => String(item || '').trim()).filter(Boolean).slice(0, 40);
  }
  const raw = String(value || '').trim();
  if (!raw) return [];
  return raw.split(/\r?\n/).map(item => item.trim()).filter(Boolean).slice(0, 40);
}

function compareVersions(left, right) {
  const parse = value => String(value || '').replace(/^v/i, '').split(/[+-]/)[0].split('.').map(part => Number(part) || 0);
  const a = parse(left);
  const b = parse(right);
  const length = Math.max(a.length, b.length, 4);
  for (let index = 0; index < length; index += 1) {
    const diff = (a[index] || 0) - (b[index] || 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

async function getAnnouncements(env, activeOnly) {
  const query = activeOnly
    ? 'SELECT * FROM announcements WHERE is_active = 1 ORDER BY sort_order ASC, datetime(updated_at) DESC'
    : 'SELECT * FROM announcements ORDER BY sort_order ASC, datetime(updated_at) DESC';
  const rows = await env.MMC_DB.prepare(query).all();
  return rows.results || [];
}

async function upsertAnnouncement(env, userId, body) {
  const id = body?.id ? String(body.id) : generateId('notice');
  const title = String(body?.title || '').trim().slice(0, 120);
  const content = String(body?.content || '').trim().slice(0, 4000);
  const isActive = body?.isActive === false ? 0 : 1;
  const sortOrder = Number(body?.sortOrder || 0);

  if (!title || !content) {
    throw new HttpError(400, '公告标题和内容都需要填写。');
  }

  const now = nowIso();
  await env.MMC_DB.prepare(
    `
      INSERT INTO announcements (id, title, content, is_active, sort_order, created_by_user_id, updated_by_user_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        content = excluded.content,
        is_active = excluded.is_active,
        sort_order = excluded.sort_order,
        updated_by_user_id = excluded.updated_by_user_id,
        updated_at = excluded.updated_at
    `
  ).bind(id, title, content, isActive, sortOrder, userId, userId, now, now).run();

  return { ok: true, message: '公告已保存。', id };
}

async function getEditableSiteSettings(env) {

  return {
    siteNotice: await getSiteSetting(env, 'site_notice', defaultSiteNotice())
  };
}

async function saveSiteSettings(env, userId, body) {
  await saveSiteSetting(env, 'site_notice', body?.siteNotice || defaultSiteNotice(), userId);
  return { ok: true, message: '站点设置已保存。' };
}

async function getSiteSetting(env, key, fallbackValue) {
  const row = await env.MMC_DB.prepare('SELECT value_json FROM site_settings WHERE setting_key = ?').bind(key).first();
  if (!row?.value_json) return fallbackValue;
  try {
    return JSON.parse(row.value_json);
  } catch {
    return fallbackValue;
  }
}

async function saveSiteSetting(env, key, value, userId) {
  const now = nowIso();
  await env.MMC_DB.prepare(
    `
      INSERT INTO site_settings (setting_key, value_json, updated_by_user_id, updated_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(setting_key) DO UPDATE SET
        value_json = excluded.value_json,
        updated_by_user_id = excluded.updated_by_user_id,
        updated_at = excluded.updated_at
    `
  ).bind(key, JSON.stringify(value), userId, now).run();
}

async function addReviewLog(env, folderId, actorUserId, action, note) {
  await env.MMC_DB.prepare(
    `
      INSERT INTO review_logs (id, folder_id, actor_user_id, action, note, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `
  ).bind(generateId('log'), folderId, actorUserId, action, note, nowIso()).run();
}

async function importLegacyFolder(env, body) {
  const folder = body?.folder;
  const assets = Array.isArray(body?.assets) ? body.assets : [];
  if (!folder?.id || !folder?.ownerUserId || !folder?.name || !folder?.slug) {
    throw new HttpError(400, '导入 folder 数据不完整。');
  }
  if (!assets.length) {
    throw new HttpError(400, '导入时至少需要一个资源。');
  }

  const existing = await env.MMC_DB.prepare('SELECT id FROM folders WHERE slug = ?').bind(folder.slug).first();
  if (existing) {
    return { ok: true, skipped: true, reason: 'slug_exists', slug: folder.slug };
  }

  const statements = [
    env.MMC_DB.prepare(
      `
        INSERT INTO folders (id, owner_user_id, name, slug, description, status, review_note, reviewed_by_user_id, reviewed_at, published_at, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 'published', ?, ?, ?, ?, ?, ?)
      `
    ).bind(
      folder.id,
      folder.ownerUserId,
      folder.name,
      folder.slug,
      folder.description || '',
      folder.reviewNote || '旧站迁移导入',
      folder.reviewedByUserId || folder.ownerUserId,
      folder.reviewedAt,
      folder.publishedAt,
      folder.createdAt,
      folder.updatedAt
    )
  ];

  for (const asset of assets) {
    statements.push(
      env.MMC_DB.prepare(
        `
          INSERT INTO assets (id, folder_id, uploader_user_id, r2_key, original_name, mime_type, media_kind, size_bytes, sort_order, status, created_at, published_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?, ?)
        `
      ).bind(
        asset.id,
        folder.id,
        asset.uploaderUserId,
        asset.r2Key,
        asset.originalName,
        asset.mimeType,
        asset.mediaKind,
        Number(asset.sizeBytes || 0),
        Number(asset.sortOrder || 0),
        asset.createdAt,
        asset.publishedAt
      )
    );
  }

  statements.push(
    env.MMC_DB.prepare(
      `
        INSERT INTO review_logs (id, folder_id, actor_user_id, action, note, created_at)
        VALUES (?, ?, ?, 'approve', ?, ?)
      `
    ).bind(
      body.reviewLog?.id || generateId('log'),
      folder.id,
      body.reviewLog?.actorUserId || folder.ownerUserId,
      body.reviewLog?.note || '旧站迁移导入并直接发布',
      body.reviewLog?.createdAt || folder.createdAt
    )
  );

  await env.MMC_DB.batch(statements);
  return { ok: true, skipped: false, slug: folder.slug };
}

async function requireOptionalSession(request, env) {
  const cookieHeader = request.headers.get('cookie');
  const rawToken = getCookie(cookieHeader, SESSION_COOKIE);
  if (!rawToken) {
    return null;
  }

  const tokenHash = await sha256(rawToken + (env.SESSION_SECRET || 'mmc-dev-secret'));
  const session = await env.MMC_DB.prepare(
    `
      SELECT s.id AS session_id, s.expires_at, s.last_seen_at, u.*
      FROM sessions s
      JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = ?
    `
  ).bind(tokenHash).first();

  if (!session) {
    return null;
  }

  if (new Date(session.expires_at).getTime() <= Date.now()) {
    await env.MMC_DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(tokenHash).run();
    return null;
  }

  const nowMs = Date.now();
  if (shouldWriteSessionLastSeen(session.last_seen_at, nowMs)) {
    const now = new Date(nowMs).toISOString();
    const cutoff = new Date(nowMs - SESSION_LAST_SEEN_WRITE_INTERVAL_MS).toISOString();
    await env.MMC_DB.prepare(
      `UPDATE sessions
       SET last_seen_at = ?
       WHERE id = ?
         AND (last_seen_at IS NULL OR julianday(last_seen_at) IS NULL OR last_seen_at <= ?)`
    ).bind(now, session.session_id, cutoff).run();
  }
  return { user: session };
}

export function shouldWriteSessionLastSeen(lastSeenAt, nowMs = Date.now()) {
  const lastSeenMs = new Date(lastSeenAt).getTime();
  return !Number.isFinite(lastSeenMs) || nowMs - lastSeenMs >= SESSION_LAST_SEEN_WRITE_INTERVAL_MS;
}

async function requireSession(request, env) {
  const session = await requireOptionalSession(request, env);
  if (!session?.user) {
    throw new HttpError(401, '请先登录。');
  }
  if (session.user.status !== 'active') {
    throw new HttpError(403, '当前账号已被停用。');
  }
  return session;
}

async function requireRole(request, env, roles) {
  const session = await requireSession(request, env);
  if (!roles.includes(session.user.role)) {
    throw new HttpError(403, '你的权限不足。');
  }
  return session;
}

function serializeUser(user) {
  return {
    id: user.id,
    publicId: Number(user.public_id || 0),
    username: user.username,
    displayName: user.display_name,
    role: user.role,
    status: user.status
  };
}

function normalizeUsername(value) {
  const text = String(value || '').trim().toLowerCase();
  if (!/^[a-z0-9_]{3,24}$/.test(text)) {
    throw new HttpError(400, '账号名只能用 3 到 24 位的小写字母、数字或下划线。');
  }
  return text;
}

function normalizeDisplayName(value) {
  const text = String(value || '').trim();
  if (!text || text.length < 2 || text.length > 32) {
    throw new HttpError(400, '显示名称需要 2 到 32 个字符。');
  }
  return text;
}

function normalizePassword(value) {
  const text = String(value || '');
  if (text.length < 8 || text.length > 64) {
    throw new HttpError(400, '密码长度需要在 8 到 64 位之间。');
  }
  return text;
}

function normalizeRedeemCode(value) {
  return String(value || '').trim().toUpperCase();
}

function normalizeFolderName(value) {
  const text = String(value || '').trim();
  if (!text || text.length > 60) {
    throw new HttpError(400, '文件夹名称不能为空，且不能超过 60 个字符。');
  }
  if (/[\\/#?%]/.test(text)) {
    throw new HttpError(400, '文件夹名称里不能包含 / \\ # ? % 这些路径字符。');
  }
  return text;
}

function normalizeSlug(value) {
  const text = String(value || '').trim().toLowerCase().replace(/\s+/g, '-');
  if (!text || text.length > 80) {
    throw new HttpError(400, '公开路径不能为空，且不能超过 80 个字符。');
  }
  if (!/^[a-z0-9-]{3,80}$/.test(text)) {
    throw new HttpError(400, '公开路径只能使用 3 到 80 位英文小写字母、数字或连字符，请填写不重复的英文路径。');
  }
  if (/--/.test(text) || text.startsWith('-') || text.endsWith('-')) {
    throw new HttpError(400, '公开路径格式不正确，请避免连续连字符，并且不要以连字符开头或结尾。');
  }
  return text;
}

function validateUploadFile(file) {
  if (!(file instanceof File)) {
    throw new HttpError(400, '上传内容里有无效文件。');
  }
  if (!file.size) {
    throw new HttpError(400, `${file.name} 是空文件，不能上传。`);
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new HttpError(400, `${file.name} 超过了 50MB 限制。`);
  }
  if (!isSupportedMime(file.type, file.name)) {
    throw new HttpError(400, `${file.name} 不是支持的图片或视频格式。`);
  }
}

function isSupportedMime(type, fileName) {
  return ALLOWED_IMAGE_TYPES.has(type) || ALLOWED_VIDEO_TYPES.has(type) || /\.(jpg|jpeg|png|webp|gif|mp4|webm|mov)$/i.test(fileName);
}

function detectMediaKind(file) {
  const type = file.type || guessContentTypeFromName(file.name);
  return type.startsWith('video/') ? 'video' : 'image';
}

function collectUploadFiles(form) {
  return [
    ...form.getAll('files').filter(item => item instanceof File),
    ...form.getAll('folderFiles').filter(item => item instanceof File)
  ];
}

async function writeUploadedAssets(env, { files, folderId, userId, startSortOrder = 0, assetStatus, publishedAt = null, now = nowIso() }) {
  const records = files.map((file, index) => {
    validateUploadFile(file);
    const assetId = generateId('asset');
    const ext = getFileExtension(file.name);
    return {
      id: assetId,
      folderId,
      userId,
      r2Key: `pending/${folderId}/${assetId}${ext}`,
      originalName: file.name,
      mimeType: file.type || guessContentTypeFromName(file.name),
      mediaKind: detectMediaKind(file),
      sizeBytes: file.size,
      sortOrder: startSortOrder + index,
      status: assetStatus,
      createdAt: now,
      publishedAt,
      file
    };
  });

  for (let index = 0; index < records.length; index += UPLOAD_R2_CONCURRENCY) {
    const batch = records.slice(index, index + UPLOAD_R2_CONCURRENCY);
    const results = await Promise.allSettled(batch.map(record => env.MMC_MEDIA.put(record.r2Key, record.file.stream(), {
      httpMetadata: {
        contentType: record.mimeType
      }
    })));
    const failures = results.filter(result => result.status === 'rejected');
    if (failures.length) {
      await compensateUploadedKeys(env, batch.filter((_, i) => results[i].status === 'fulfilled').map(record => record.r2Key));
      throw failures[0].reason;
    }
  }

  if (records.length) {
    try {
      await env.MMC_DB.batch(records.map(record => env.MMC_DB.prepare(
      `
        INSERT INTO assets (
          id, folder_id, uploader_user_id, r2_key, original_name, mime_type, media_kind,
          size_bytes, sort_order, status, created_at, published_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
    ).bind(
      record.id,
      record.folderId,
      record.userId,
      record.r2Key,
      record.originalName,
      record.mimeType,
      record.mediaKind,
      record.sizeBytes,
      record.sortOrder,
      record.status,
      record.createdAt,
      record.publishedAt
      )));
    } catch (error) {
      await compensateUploadedKeys(env, records.map(record => record.r2Key));
      throw error;
    }
  }

  return records;
}

async function compensateUploadedKeys(env, keys) {
  for (const key of keys) {
    try {
      const referenced = await env.MMC_DB.prepare('SELECT 1 FROM assets WHERE r2_key = ? LIMIT 1').bind(key).first();
      if (!referenced) await env.MMC_MEDIA.delete(key);
    } catch (error) {
      console.error(JSON.stringify({ event: 'r2_upload_compensation_error', key, error: error?.message || String(error) }));
    }
  }
}

function validateImportR2Key(key) {
  if (!/^published\/[^/]+\/[^/]+\.(jpg|jpeg|png|bmp|webp|gif|mp4|webm|mov|m4v)$/i.test(key) || key.includes('..') || key.includes('\\') || key.startsWith('downloads/android/')) {
    throw new HttpError(400, '导入 key 不符合安全格式。');
  }
  if (key.length > 512) throw new HttpError(400, '导入 key 过长。');
}

function validateImportContentType(contentType, key) {
  if (!/^(image\/(jpeg|png|bmp|webp|gif)|video\/(mp4|webm|quicktime|x-m4v))$/i.test(contentType)) {
    throw new HttpError(400, '导入 content type 不受支持。');
  }
  const ext = key.slice(key.lastIndexOf('.') + 1).toLowerCase();
  const allowed = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', bmp: 'image/bmp', webp: 'image/webp', gif: 'image/gif', mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime', m4v: 'video/x-m4v' };
  if (allowed[ext] !== contentType.toLowerCase()) throw new HttpError(400, '扩展名与 content type 不匹配。');
}

async function getEditableOwnedFolder(env, userId, folderId) {
  const folder = await env.MMC_DB.prepare('SELECT * FROM folders WHERE id = ?').bind(folderId).first();
  if (!folder || folder.owner_user_id !== userId) {
    throw new HttpError(404, '找不到这个文件夹。');
  }
  if (!['draft', 'rejected'].includes(folder.status)) {
    throw new HttpError(400, '这个文件夹当前不能再编辑。');
  }
  return folder;
}

async function getAdminManageableFolder(env, folderId) {
  const folder = await env.MMC_DB.prepare('SELECT * FROM folders WHERE id = ?').bind(folderId).first();
  if (!folder) {
    throw new HttpError(404, '找不到这个文件夹。');
  }
  return folder;
}

function guessContentTypeFromName(fileName) {
  const ext = getFileExtension(fileName).toLowerCase();
  if (['.jpg', '.jpeg'].includes(ext)) return 'image/jpeg';
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.gif') return 'image/gif';
  if (ext === '.mp4') return 'video/mp4';
  if (ext === '.webm') return 'video/webm';
  if (ext === '.mov') return 'video/quicktime';
  return 'application/octet-stream';
}

function getFileExtension(fileName) {
  const match = /(\.[A-Za-z0-9]+)$/.exec(fileName);
  return match ? match[1] : '';
}

function buildAttachmentDisposition(fileName) {
  const safeName = String(fileName || 'download')
    .replace(/[\r\n"]/g, '')
    .replace(/[^\x20-\x7E]/g, '_');
  return `attachment; filename="${safeName}"; filename*=UTF-8''${encodeRFC5987ValueChars(fileName || 'download')}`;
}

function encodeRFC5987ValueChars(value) {
  return encodeURIComponent(String(value || 'download'))
    .replace(/['()]/g, char => `%${char.charCodeAt(0).toString(16).toUpperCase()}`)
    .replace(/\*/g, '%2A');
}

function buildSessionCookie(token, expiresAt) {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Expires=${new Date(expiresAt).toUTCString()}`;
}

function clearSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Expires=${new Date(0).toUTCString()}`;
}

function getCookie(cookieHeader, key) {
  if (!cookieHeader) return null;
  const chunks = cookieHeader.split(';').map(part => part.trim());
  for (const chunk of chunks) {
    const [name, ...rest] = chunk.split('=');
    if (name === key) {
      return rest.join('=');
    }
  }
  return null;
}

function getBearerToken(request) {
  const value = request.headers.get('authorization') || '';
  const match = value.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : '';
}

function requireImportToken(request, env) {
  const headerToken = request.headers.get('x-import-token');
  if (!env.IMPORT_TOKEN || !headerToken || headerToken !== env.IMPORT_TOKEN) {
    throw new HttpError(403, '导入令牌无效。');
  }
}

async function derivePasswordHash(password, salt) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: encoder.encode(salt),
      iterations: 100000
    },
    keyMaterial,
    256
  );
  return bytesToHex(new Uint8Array(bits));
}

async function verifyPassword(password, salt, expectedHash) {
  const actual = await derivePasswordHash(password, salt);
  return actual === expectedHash;
}

async function sha256(value) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return bytesToHex(new Uint8Array(digest));
}

function bytesToHex(bytes) {
  return Array.from(bytes).map(byte => byte.toString(16).padStart(2, '0')).join('');
}

async function signAlipayParams(params, privateKeyText) {
  const unsignedContent = buildAlipaySignContent(params);
  const key = await importPrivateKey(privateKeyText);
  const signature = await crypto.subtle.sign(
    { name: 'RSASSA-PKCS1-v1_5' },
    key,
    new TextEncoder().encode(unsignedContent)
  );
  return arrayBufferToBase64(signature);
}

async function verifyAlipaySignature(params, signature, publicKeyText) {
  if (!signature) return false;
  const signPayload = { ...params };
  delete signPayload.sign;
  delete signPayload.sign_type;
  const signedContent = buildAlipaySignContent(signPayload);
  const key = await importPublicKey(publicKeyText);
  return crypto.subtle.verify(
    { name: 'RSASSA-PKCS1-v1_5' },
    key,
    base64ToUint8Array(signature),
    new TextEncoder().encode(signedContent)
  );
}

function buildAlipaySignContent(params) {
  return Object.keys(params)
    .filter(key => params[key] !== undefined && params[key] !== null && params[key] !== '')
    .sort()
    .map(key => `${key}=${String(params[key])}`)
    .join('&');
}

function buildQueryString(params) {
  return Object.keys(params)
    .filter(key => params[key] !== undefined && params[key] !== null && params[key] !== '')
    .sort()
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(String(params[key]))}`)
    .join('&');
}

async function importPrivateKey(privateKeyText) {
  const pem = normalizePem(privateKeyText, 'PRIVATE KEY');
  return crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(pem),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
}

async function importPublicKey(publicKeyText) {
  const pem = normalizePem(publicKeyText, 'PUBLIC KEY');
  return crypto.subtle.importKey(
    'spki',
    pemToArrayBuffer(pem),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify']
  );
}

function normalizePem(rawKey, type) {
  const trimmed = String(rawKey || '').trim();
  if (trimmed.includes('BEGIN')) {
    return trimmed;
  }
  const chunks = trimmed.match(/.{1,64}/g) || [];
  return `-----BEGIN ${type}-----\n${chunks.join('\n')}\n-----END ${type}-----`;
}

function pemToArrayBuffer(pem) {
  const base64 = pem
    .replace(/-----BEGIN [^-]+-----/g, '')
    .replace(/-----END [^-]+-----/g, '')
    .replace(/\s+/g, '');
  return base64ToUint8Array(base64).buffer;
}

function base64ToUint8Array(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function generateId(prefix) {
  const random = crypto.getRandomValues(new Uint8Array(12));
  return `${prefix}_${bytesToHex(random)}`;
}

function getLocalDateString(timeZone) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(new Date());
}

function getNextDayStartIso(timeZone) {
  const currentDate = getLocalDateString(timeZone);
  const noonUtc = new Date(`${currentDate}T12:00:00.000Z`);
  const nextDay = new Date(noonUtc.getTime() + 86400000);
  const nextDate = getLocalDateStringFromDate(nextDay, timeZone);
  return `${nextDate}T00:00:00+08:00`;
}

function getLocalDateStringFromDate(date, timeZone) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(date);
}

function getLocalMinuteKey(isoValue, timeZone) {
  const date = new Date(isoValue || Date.now());
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).formatToParts(date);
  const get = type => parts.find(part => part.type === type)?.value || '00';
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
}

function formatAlipayTimestamp(date) {
  const parts = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ];
  const timeParts = [
    String(date.getHours()).padStart(2, '0'),
    String(date.getMinutes()).padStart(2, '0'),
    String(date.getSeconds()).padStart(2, '0')
  ];
  return `${parts.join('-')} ${timeParts.join(':')}`;
}

function normalizeMoney(value) {
  const amount = Number.parseFloat(String(value || '0'));
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new HttpError(400, '支付金额配置无效。');
  }
  return amount.toFixed(2);
}

function normalizePositiveMoney(value) {
  const amount = Number.parseFloat(String(value || '0'));
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new HttpError(400, '金额必须大于 0。');
  }
  return amount.toFixed(3);
}

function formatMoney(value) {
  const amount = Number.parseFloat(String(value || '0'));
  if (!Number.isFinite(amount)) return '0.000';
  return amount.toFixed(3);
}

function addMoney(left, right) {
  return (Number.parseFloat(formatMoney(left)) + Number.parseFloat(formatMoney(right))).toFixed(3);
}

function subtractMoney(left, right) {
  return (Number.parseFloat(formatMoney(left)) - Number.parseFloat(formatMoney(right))).toFixed(3);
}

function compareMoney(left, right) {
  const diff = Number.parseFloat(formatMoney(left)) - Number.parseFloat(formatMoney(right));
  if (Math.abs(diff) < 0.0005) return 0;
  return diff > 0 ? 1 : -1;
}

function addDaysIso(startIso, days) {
  const date = new Date(startIso);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

function nowIso() {
  return new Date().toISOString();
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    throw new HttpError(400, '请求体不是合法的 JSON。');
  }
}

function defaultSiteNotice() {

  return {
    title: '站内公告',
    content: '欢迎来到猫猫虫咖波表情包仓库后台版。这里的内容将由审核通过后的文件夹自动发布。'
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'x-robots-tag': 'noindex'
    }
  });
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function xmlEscape(value) {
  return escapeHtml(value);
}

function safeJsonLd(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

function trimText(value, maxLength = 160) {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, Math.max(0, maxLength - 1)).trim()}…`;
}

function withHeaders(response, headers) {
  const nextHeaders = new Headers(response.headers);
  headers.forEach((value, key) => nextHeaders.append(key, value));
  return new Response(response.body, { status: response.status, headers: nextHeaders });
}

function withServerTiming(response, startedAt) {
  const headers = new Headers(response.headers);
  headers.set('server-timing', `total;dur=${Math.round(performance.now() - startedAt)}`);
  return new Response(response.body, { status: response.status, headers });
}

function withCors(response) {
  const headers = new Headers(response.headers);
  headers.set('access-control-allow-origin', '*');
  headers.set('access-control-allow-methods', 'GET,POST,PUT,DELETE,OPTIONS');
  headers.set('access-control-allow-headers', 'Content-Type');
  return new Response(response.body, { status: response.status, headers });
}

async function handleAndroidDownload(request, env, url) {
  // 仅支持 GET 请求
  if (request.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const pathname = url.pathname;

  // 路由映射：URL 路径 -> R2 对象键
  let r2Key = null;
  let fileName = null;
  let contentType = 'application/octet-stream';

  if (pathname === '/downloads/maomaochong-android/latest.apk') {
    r2Key = 'downloads/android/latest.apk';
    fileName = 'maomaochong-android-latest.apk';
    contentType = 'application/vnd.android.package-archive';
  } else if (pathname === '/downloads/maomaochong-android/latest.json') {
    r2Key = 'downloads/android/latest.json';
    fileName = 'latest.json';
    contentType = 'application/json; charset=utf-8';
  } else if (pathname.match(/^\/downloads\/maomaochong-android\/v[\d.]+\.apk$/)) {
    // 匹配版本化 APK：/downloads/maomaochong-android/v1.0.0.apk
    const version = pathname.match(/v([\d.]+)\.apk$/)[1];
    r2Key = `downloads/android/maomaochong-android-v${version}.apk`;
    fileName = `maomaochong-android-v${version}.apk`;
    contentType = 'application/vnd.android.package-archive';
  } else {
    // 不匹配任何下载路由，返回 404
    return new Response('Not Found', { status: 404 });
  }

  // 从 R2 获取对象
  try {
    const object = await env.MMC_MEDIA.get(r2Key);

    if (!object) {
      return new Response('File Not Found', { status: 404 });
    }

    // 设置响应头
    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('X-Content-Type-Options', 'nosniff');

    // APK 文件需要设置下载
    if (contentType === 'application/vnd.android.package-archive') {
      headers.set('Content-Disposition', `attachment; filename="${fileName}"`);
      headers.set('Cache-Control', 'public, max-age=3600');
    } else {
      // JSON 元数据缓存时间较短
      headers.set('Cache-Control', 'public, max-age=300');
    }

    // 如果 R2 对象有自定义元数据，保留它们
    if (object.httpMetadata?.contentType) {
      headers.set('Content-Type', object.httpMetadata.contentType);
    }
    if (object.httpMetadata?.cacheControl) {
      headers.set('Cache-Control', object.httpMetadata.cacheControl);
    }

    // 设置内容长度
    headers.set('Content-Length', object.size.toString());

    return new Response(object.body, {
      status: 200,
      headers
    });
  } catch (error) {
    console.error('Android download error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
