import { state, app, collator, api, toast, copyText, escape, attr, formatDate, isAdmin, isOwner, roleLabel, statusLabel } from './app-support.js';

import { normalize } from './app-support.js';

let homeIntroTimer = null;
let homeRestoreHintTimer = null;
const HOME_RECOMMEND_SNOOZE_KEY = 'mmc_home_recommend_snooze_date';
const LINK_MATCH_RECOMMEND_UNTIL = '2026-06-01';
const LINK_MATCH_TOOL_HREF = '/tools/link-match';
const HOME_RECOMMEND_TOOLS = [
  { badge: 'AI 工具', title: 'AI 聊天', summary: '问站内问题、看图片、想表情包名字。', href: '/tools/ai-chat', icon: 'fa-comments' },
  { badge: 'AI 工具', title: 'AI 对话 API 申请', summary: '申请 API Key，用本站接口调用 AI 对话服务。', href: '/tools/ai-api', icon: 'fa-key' },
  { badge: 'AI 工具', title: 'AI 抠图', summary: '上传图片后在浏览器内去背景。', href: '/tools/remove-bg', icon: 'fa-wand-magic-sparkles' },
  { badge: '站内工具', title: '灵感工坊', summary: '随机文案、每日早报、壁纸、二维码和生活查询。', href: '/tools/inspiration', icon: 'fa-sparkles' },
  { badge: '音乐工具', title: '慢慢听歌', summary: '搜索歌曲、收藏、看歌词，站内直接播放。', href: '/tools/music', icon: 'fa-headphones' },
  { badge: '趣味小游戏', title: '咖波连连看', summary: '用站内表情包生成牌面，限时连线消除。', href: '/tools/link-match', icon: 'fa-puzzle-piece' },
  { badge: '趣味测试', title: 'SBTI 人格测试', summary: '轻松向人格测试，做完直接看结果。', href: '/tools/sbti/', icon: 'fa-heart' },
  { badge: '趣味测试', title: 'CSTI 人格测试', summary: '偏 CS 对局风格的轻量测试。', href: '/tools/csti/', icon: 'fa-crosshairs' },
  { badge: '趣味测试', title: 'YSTI 原神人格测试', summary: '原神主题人格测试和角色画像。', href: '/tools/ysti/', icon: 'fa-star' }
];

async function loadDashboardData() {
  if (!state.bootstrap?.viewer) return;
  state.dashboard = await api('/api/dashboard/folders');
  if (isAdmin()) {
    state.reviews = await api('/api/admin/reviews');
    state.existingFolders = await api('/api/admin/folders');
  }
  if (isOwner()) {
    state.announcements = await api('/api/admin/announcements');
    state.siteSettings = await api('/api/admin/site-settings');
    state.users = await api('/api/admin/users');
    state.redeemCodes = await api('/api/admin/remove-bg/redeem-codes');
    state.aiApiUsers = await api('/api/admin/ai-api/users');
  }
}

export function header({ title, subtitle, stats, htmlTitle = false }) {
  return `
    <header>
      <div class="container">
        <div class="header-content">
          <h1>${htmlTitle ? title : `<i class="fas fa-cat"></i> ${escape(title)}`}</h1>
          <p class="subtitle">${escape(subtitle)}</p>
          <div class="stats">${stats}</div>
          <button id="theme-toggle" class="theme-toggle" title="切换亮色/暗色模式">
            <i class="fas ${state.theme === 'dark' ? 'fa-sun' : 'fa-moon'}"></i>
          </button>
        </div>
      </div>
    </header>
  `;
}

export function isPanelCollapsed(key) {
  return Boolean(state.collapsedPanels?.[key]);
}

export function adminPanel(title, key, body, intro = '') {
  const collapsed = isPanelCollapsed(key);
  return `<article class="admin-panel ${collapsed ? 'is-collapsed' : ''}"><div class="admin-panel-head"><div><h3>${title}</h3>${intro ? `<p class="small admin-panel-intro">${intro}</p>` : ''}</div><button class="copy-btn admin-panel-toggle" type="button" data-toggle-panel="${key}">${collapsed ? '展开' : '收起'}</button></div>${collapsed ? '' : `<div class="admin-panel-body">${body}</div>`}</article>`;
}

export function announcementEditorForm(item) {
  const editing = Boolean(item?.id);
  return `<form id="announcement-form" class="admin-form">
    <input type="hidden" name="id" value="${attr(item?.id || '')}">
    <div class="admin-form-tip">${editing ? `正在编辑：${escape(item.title)}` : '新公告会直接保存为一条新记录，下面的现有公告也支持直接编辑和排序。'}</div>
    <label class="field"><span>标题</span><input name="title" value="${attr(item?.title || '')}" required></label>
    <label class="field"><span>内容</span><textarea name="content" required>${escape(item?.content || '')}</textarea></label>
    <label class="field"><span>排序</span><input type="number" name="sortOrder" value="${attr(item?.sort_order ?? 0)}"></label>
    <div class="review-button-row">
      <button class="footer-btn" type="submit">${editing ? '保存修改' : '保存公告'}</button>
      ${editing ? '<button class="copy-btn" type="button" data-reset-announcement-editor="1">取消编辑</button>' : ''}
    </div>
  </form>`;
}

export function renderSiteInfoPage() {
  document.title = '\u732b\u732b\u866b\u5496\u6ce2\u8868\u60c5\u5305\u4ed3\u5e93 - \u7ad9\u5185\u516c\u544a\u4e0e\u7ad9\u52a1';
  const entries = state.bootstrap?.announcements || [];
  app.innerHTML = `
    ${header({ title: `<a href="/" class="site-title-link" data-link aria-label="\u8fd4\u56de\u4e3b\u9875"><i class="fas fa-cat"></i> \u732b\u732b\u866b\u5496\u6ce2\u8868\u60c5\u5305\u4ed3\u5e93</a>`, subtitle: '\u7ad9\u5185\u516c\u544a\u4e0e\u7ad9\u52a1\u8bf4\u660e', stats: '\u5b8c\u6574\u516c\u544a\u9875', htmlTitle: true })}
    <main class="container">
      <section class="site-info-hero">
        <div class="site-info-hero-text">
          <span class="site-info-kicker">\u516c\u544a\u4e2d\u5fc3</span>
          <h2>\u7ad9\u5185\u66f4\u65b0\u3001\u4f7f\u7528\u63d0\u793a\u548c\u7ad9\u52a1\u8bf4\u660e\u90fd\u653e\u5728\u8fd9\u91cc</h2>
          <p>\u8fd9\u91cc\u96c6\u4e2d\u5c55\u793a\u7f6e\u9876\u8bf4\u660e\u3001\u5386\u53f2\u66f4\u65b0\u548c\u5b8c\u6574\u7ad9\u52a1\u5185\u5bb9\uff0c\u60f3\u770b\u7f51\u7ad9\u53d8\u5316\u65f6\u76f4\u63a5\u6765\u8fd9\u91cc\u5c31\u884c\u3002</p>
        </div>
        <a class="site-info-backlink" href="/" data-link>\u8fd4\u56de\u9996\u9875</a>
      </section>
      <section class="site-overview-card">
        <div class="site-overview-head"><span class="notice-badge">\u7f6e\u9876\u8bf4\u660e</span><h2>${escape(state.bootstrap?.siteNotice?.title || '\u7ad9\u5185\u516c\u544a')}</h2></div>
        <p class="notice-summary">${escape(state.bootstrap?.siteNotice?.content || '')}</p>
      </section>
      <section class="notice-board" id="site-notice-board" data-mode="full">
        <div class="notice-board-head"><div><span class="notice-kicker">\u7ad9\u5185\u516c\u544a</span><h2>\u5b8c\u6574\u516c\u544a\u4e0e\u7ad9\u52a1</h2><p>\u8fd9\u91cc\u6309\u65f6\u95f4\u6574\u7406\u5386\u53f2\u66f4\u65b0\uff0c\u4ece\u65b0\u5230\u65e7\u6392\u5217\uff0c\u65b9\u4fbf\u96c6\u4e2d\u67e5\u770b\u7f51\u7ad9\u53d8\u5316\u3002</p></div></div>
        <div class="notice-entry-list full">${entries.length ? entries.map(noticeEntry).join('') : '<article class="notice-entry"><p class="notice-summary">\u6682\u65f6\u8fd8\u6ca1\u6709\u66f4\u591a\u516c\u544a\u5185\u5bb9\u3002</p></article>'}</div>
      </section>
      ${backendEntry()}
    </main>
    ${fullFooter()}
    ${imageModal()}
  `;
}

export async function renderRemoveBgPage() {
  document.title = 'AI 抠图';
  app.innerHTML = `
    ${header({
      title: `<a href="/" class="site-title-link" data-link aria-label="返回首页"><i class="fas fa-cat"></i> 猫猫虫咖波表情包仓库</a>`,
      subtitle: 'AI 抠图工具，浏览器本地处理，不上传原图',
      stats: 'AI 工具',
      htmlTitle: true
    })}
    <main class="container">
      <section class="site-info-hero">
        <div class="site-info-hero-text">
          <span class="site-info-kicker">AI 工具</span>
          <h2>上传一张图片，直接在浏览器里完成去背景</h2>
          <p>预览不限次数。普通登录用户每天可下载 10 次，抠图会员每天可下载 10000 次。</p>
        </div>
        <div class="review-button-row">
          <a class="site-info-backlink" href="/" data-link>返回首页</a>
        </div>
      </section>
      <section id="rembg-tool-app"></section>
    </main>
    ${compactFooter()}
  `;

  const { mountRembgTool } = await import('/rembg-tool.js');
  mountRembgTool({
    root: document.getElementById('rembg-tool-app'),
    toast,
    api,
    viewer: state.bootstrap?.viewer || null
  });
  window.scrollTo(0, 0);
}

export async function renderAiChatPage() {
  document.title = 'AI 聊天';
  app.innerHTML = `
    ${header({
      title: `<a href="/" class="site-title-link" data-link aria-label="返回首页"><i class="fas fa-cat"></i> 猫猫虫咖波表情包仓库</a>`,
      subtitle: '问站内问题、看图片、想表情包名字',
      stats: 'AI 工具',
      htmlTitle: true
    })}
    <main class="container">
      <section class="site-info-hero">
        <div class="site-info-hero-text">
          <span class="site-info-kicker">AI 工具</span>
          <h2>有问题就直接问，也可以发图片让 AI 帮你看看</h2>
          <p>适合用来问投稿和下载规则、抠图会员兑换方法，也可以让 AI 帮你给表情包起名、写简介、判断适合放到哪个分类。</p>
        </div>
        <div class="review-button-row">
          <a class="site-info-backlink" href="/tools/list" data-link>返回工具列表</a>
        </div>
      </section>
      <section id="ai-chat-tool-app"></section>
    </main>
    ${compactFooter()}
  `;

  const { mountAiChatTool } = await import('/ai-chat-tool.js');
  mountAiChatTool({
    root: document.getElementById('ai-chat-tool-app'),
    api,
    toast
  });
  window.scrollTo(0, 0);
}

export async function renderAiApiPage() {
  document.title = 'AI 对话 API 申请';
  if (!state.bootstrap?.viewer) return renderAuthPage();
  app.innerHTML = `
    ${header({
      title: `<a href="/" class="site-title-link" data-link aria-label="返回首页"><i class="fas fa-cat"></i> 猫猫虫咖波表情包仓库</a>`,
      subtitle: '申请 Key，用本站中转调用 AI 对话服务',
      stats: 'AI 工具',
      htmlTitle: true
    })}
    <main class="container">
      <section class="site-info-hero">
        <div class="site-info-hero-text">
          <span class="site-info-kicker">AI API</span>
          <h2>申请你的 AI 对话 API Key</h2>
          <p>普通用户每天前 50 次成功调用免费，API 调用会员每天前 500 次成功调用免费。超过免费额度后按低价从余额扣费，调用失败不计次数也不扣费。</p>
        </div>
        <div class="review-button-row">
          <a class="site-info-backlink" href="/tools/list" data-link>返回工具列表</a>
        </div>
      </section>
      <section id="ai-api-tool-app"></section>
    </main>
    ${compactFooter()}
  `;

  const { mountAiApiTool } = await import('/ai-api-tool.js');
  mountAiApiTool({
    root: document.getElementById('ai-api-tool-app'),
    api,
    toast
  });
  window.scrollTo(0, 0);
}

export async function renderMusicPage() {
  document.title = '慢慢听歌';
  app.innerHTML = `
    ${header({
      title: `<a href="/" class="site-title-link" data-link aria-label="返回首页"><i class="fas fa-cat"></i> 猫猫虫咖波表情包仓库</a>`,
      subtitle: '搜索、播放、收藏和查看歌词',
      stats: '站内工具',
      htmlTitle: true
    })}
    <main class="container">
      <section class="site-info-hero music-hero">
        <div class="site-info-hero-text">
          <span class="site-info-kicker">慢慢听歌</span>
          <h2>搜索一首歌，留在站内慢慢听</h2>
          <p>支持歌曲搜索、推荐分类、收藏、播放历史和歌词查看。收藏与历史只保存在当前浏览器里。</p>
        </div>
        <div class="review-button-row">
          <a class="site-info-backlink" href="/tools/list" data-link>返回工具列表</a>
        </div>
      </section>
      <section id="music-tool-app"></section>
    </main>
    ${compactFooter()}
  `;

  const { mountMusicTool } = await import('/music-tool.js');
  mountMusicTool({
    root: document.getElementById('music-tool-app'),
    toast
  });
  window.scrollTo(0, 0);
}

export async function renderInspirationPage() {
  document.title = '灵感工坊';
  app.innerHTML = `
    ${header({
      title: `<a href="/" class="site-title-link" data-link aria-label="返回首页"><i class="fas fa-cat"></i> 猫猫虫咖波表情包仓库</a>`,
      subtitle: '随机文案、图片灵感和生活小帮手',
      stats: '站内工具',
      htmlTitle: true
    })}
    <main class="container">
      <section class="site-info-hero">
        <div class="site-info-hero-text">
          <span class="site-info-kicker">灵感工坊</span>
          <h2>想找一句文案、一张图，或者临时查点小东西，都放在这里</h2>
          <p>这里整理了一些轻量小功能：随机文案、每日早报、壁纸、二维码生成、号码归属地、显卡排行等，点一下就能生成。</p>
        </div>
        <div class="review-button-row">
          <a class="site-info-backlink" href="/tools/list" data-link>返回工具列表</a>
        </div>
      </section>
      <section id="inspiration-tool-app"></section>
    </main>
    ${compactFooter()}
  `;

  const { mountInspirationTool } = await import('/inspiration-tool.js');
  mountInspirationTool({
    root: document.getElementById('inspiration-tool-app'),
    api,
    toast
  });
  window.scrollTo(0, 0);
}

export async function renderLinkMatchPage() {
  document.title = '咖波连连看';
  app.innerHTML = `
    ${header({
      title: `<a href="/" class="site-title-link" data-link aria-label="返回首页"><i class="fas fa-cat"></i> 猫猫虫咖波表情包仓库</a>`,
      subtitle: '用站内表情包玩限时连线小游戏',
      stats: '趣味小游戏',
      htmlTitle: true
    })}
    <main class="container">
      <section class="site-info-hero link-match-hero">
        <div class="site-info-hero-text">
          <span class="site-info-kicker">咖波连连看</span>
          <h2>随机抽取站内表情包，连出一局轻松小游戏</h2>
          <p>先点第一张表情包，再点第二张相同表情包；如果两张之间最多转弯两次可以连通，就会连线消除并加分。</p>
        </div>
        <div class="review-button-row">
          <a class="site-info-backlink" href="/tools/list" data-link>返回工具列表</a>
        </div>
      </section>
      <section id="link-match-tool-app"></section>
    </main>
    ${compactFooter()}
  `;

  const { mountLinkMatchTool } = await import('/link-match-tool.js');
  mountLinkMatchTool({
    root: document.getElementById('link-match-tool-app'),
    bootstrap: state.bootstrap,
    api,
    toast
  });
  window.scrollTo(0, 0);
}

export function renderToolsListPage() {
  document.title = '工具列表';
  app.innerHTML = `
    ${header({
      title: `<a href="/" class="site-title-link" data-link aria-label="返回首页"><i class="fas fa-cat"></i> 猫猫虫咖波表情包仓库</a>`,
      subtitle: '常用小工具',
      stats: '工具列表',
      htmlTitle: true
    })}
    <main class="container">
      <section class="site-info-hero">
        <div class="site-info-hero-text">
          <span class="site-info-kicker">工具</span>
          <h2>这里整理了目前可用的小工具</h2>
          <p>现在可以直接使用 AI 聊天、AI 抠图、灵感工坊、慢慢听歌、咖波连连看、SBTI 人格测试、CSTI 人格测试和 YSTI 原神人格测试，想用哪个就点进去即可。</p>
        </div>
        <div class="review-button-row">
          <a class="site-info-backlink" href="/" data-link>返回首页</a>
        </div>
      </section>
      <section class="admin-card-list">
        ${toolListCard({
          badge: 'AI 工具',
          title: 'AI 聊天',
          summary: '问站内使用方法，或者上传图片让 AI 帮你描述内容、起名字、想分类。',
          href: '/tools/ai-chat',
          actionText: '开始聊天',
          dataLink: true
        })}
        ${toolListCard({
          badge: 'AI 工具',
          title: 'AI 对话 API 申请',
          summary: '申请 API Key，用本站作为中转调用 AI 对话服务。普通用户每日 50 次免费，API 会员每日 500 次免费。',
          href: '/tools/ai-api',
          actionText: '申请 API Key',
          dataLink: true
        })}
        ${toolListCard({
          badge: 'AI 工具',
          title: 'AI 抠图',
          summary: '上传图片后直接在浏览器内去背景。预览不限次数；登录用户有每日下载额度，会员额度更高。',
          href: '/tools/remove-bg',
          actionText: '进入工具',
          dataLink: true
        })}
        ${toolListCard({
          badge: '站内工具',
          title: '灵感工坊',
          summary: '随机生成文案、每日早报、壁纸、二维码，也能做号码归属地和显卡排行。',
          href: '/tools/inspiration',
          actionText: '打开工坊',
          dataLink: true
        })}
        ${toolListCard({
          badge: '音乐工具',
          title: '慢慢听歌',
          summary: '站内音乐播放器，支持搜索歌曲、推荐分类、收藏、播放历史和歌词查看。',
          href: '/tools/music',
          actionText: '开始听歌',
          dataLink: true
        })}
        ${toolListCard({
          badge: '趣味小游戏',
          title: '咖波连连看',
          summary: '随机使用站内公开表情包生成牌面，限时连线消除，支持提示、洗牌、分数和背景音乐。',
          href: '/tools/link-match',
          actionText: '开始游戏',
          dataLink: true
        })}
        ${toolListCard({
          badge: '趣味测试',
          title: 'SBTI 人格测试',
          summary: '做完题目后会给你一份轻松向的测试结果，包含人格代号、简短说明和维度评分。',
          href: '/tools/sbti/',
          actionText: '开始测试',
          dataLink: false
        })}
        ${toolListCard({
          badge: '趣味测试',
          title: 'CSTI 人格测试',
          summary: '一套偏 CS 对局风格的轻量测试，做完后会给出你的风格类型、简短画像和四项倾向评分。',
          href: '/tools/csti/',
          actionText: '开始测试',
          dataLink: false
        })}
        ${toolListCard({
          badge: '趣味测试',
          title: 'YSTI 原神人格测试',
          summary: '整理自公开前端源码的一套原神主题人格测试，保留题库、角色映射和风格画像资源。',
          href: '/tools/ysti/',
          actionText: '开始测试',
          dataLink: false
        })}
      </section>
    </main>
    ${compactFooter()}
  `;
  window.scrollTo(0, 0);
}

export async function renderDashboardPage() {
  if (!state.bootstrap?.viewer) return renderAuthPage();
  await loadDashboardData();
  const viewer = state.bootstrap.viewer;
  const folders = state.dashboard?.folders || [];
  const reviews = state.reviews?.folders || [];
  const existingFolders = state.existingFolders?.folders || [];
  const announcements = state.announcements?.announcements || [];
  const settings = state.siteSettings || {};
  const users = state.users?.users || [];
  const redeemCodes = state.redeemCodes?.codes || [];
  const aiApiUsers = state.aiApiUsers?.users || [];
  const uploadTitle = isAdmin() ? '上传文件夹' : '上传待审核文件夹';
  const uploadTip = isAdmin()
    ? '你上传的内容会直接发布，并显示在前台页面。'
    : '你上传的内容会先进入审核，审核通过后才会显示在前台。';
  const uploadButtonText = isAdmin() ? '上传并直接发布' : '上传并提交审核';
  document.title = '猫猫虫咖波表情包仓库 - 后台';
  app.innerHTML = `
    ${header({ title: `<a href="/" class="site-title-link" data-link aria-label="返回首页"><i class="fas fa-cat"></i> 猫猫虫咖波表情包仓库</a>`, subtitle: `后台工作台 · 当前账号 ${viewer.displayName}`, stats: roleLabel(viewer.role), htmlTitle: true })}
    <main class="container admin-page">
      <section class="site-info-hero admin-hero">
        <div class="site-info-hero-text"><span class="site-info-kicker">后台入口</span><h2>这里负责上传、审核、公告和账号管理</h2><p>公开入口已经收进公告页，后台只保留给需要维护网站的人使用。</p></div>
        <div class="admin-hero-actions"><a class="site-info-backlink" href="/site-info" data-link>返回公告页</a><button class="theme-toggle admin-logout-btn" id="logout-btn" title="退出登录"><i class="fas fa-right-from-bracket"></i></button></div>
      </section>
      <section class="admin-panels">
        ${adminPanel(uploadTitle, 'upload', `<form id="folder-form" class="admin-form"><label class="field"><span>文件夹名称</span><input name="name" required></label><label class="field"><span>公开路径</span><input name="slug" placeholder="example-folder" pattern="[a-z0-9-]{3,80}" title="请填写不重复的英文小写路径，例如 example-folder" required><small class="field-hint">请填写不重复的英文小写路径，例如 <code>example-folder</code>。最终访问地址会显示为：域名/你的公开路径</small></label><label class="field"><span>说明</span><textarea name="description"></textarea></label><label class="field"><span>直接上传一个文件夹</span><input data-folder-picker name="folderFiles" type="file" webkitdirectory directory multiple></label><label class="field"><span>或上传多个图片 / 视频文件</span><input name="files" type="file" multiple accept="image/*,video/mp4,video/webm,video/quicktime"></label><p class="small">两种方式任选一种即可；如果选择文件夹，系统会自动尝试填入文件夹名称。</p><button class="footer-btn" type="submit">${uploadButtonText}</button></form>`, uploadTip)}
        ${adminPanel('我的文件夹', 'mine', `<div class="admin-card-list">${folders.length ? folders.map(ownedFolderCard).join('') : '<p class="small">你还没有上传任何文件夹。</p>'}</div>`)}
      </section>
      ${isAdmin() ? `<section class="admin-panels">${adminPanel('待审核内容', 'reviews', `<div class="admin-card-list">${reviews.length ? reviews.map(reviewCard).join('') : '<p class="small">当前没有待审核内容。</p>'}</div>`)}${adminPanel('现有文件夹管理', 'existingFolders', `<label class="field"><span>搜索文件夹</span><input id="admin-folder-search" value="${attr(state.adminFolderSearch)}" placeholder="按名称、路径或上传者搜索"></label><div class="admin-card-list">${filterAdminFolders(existingFolders).length ? filterAdminFolders(existingFolders).map(adminFolderCard).join('') : '<p class="small">没有找到匹配的文件夹。</p>'}</div>`)} </section>` : ''}
      ${isOwner() ? `<section class="admin-panels">${adminPanel('公告管理', 'announcements', `${announcementEditorForm(state.announcementDraft)}<div class="admin-list-toolbar"><span class="small">现有公告支持直接编辑，也可以用上移下移快速调整排序。</span></div><div class="admin-card-list">${announcements.length ? announcements.map((item, index) => adminTextCard(item, index, announcements.length)).join('') : '<p class="small">暂时还没有公告。</p>'}</div>`, '默认收起，展开后可新增、编辑和排序公告。')}${adminPanel('置顶说明', 'settings', `<form id="settings-form" class="admin-form"><label class="field"><span>说明标题</span><input name="noticeTitle" value="${attr(settings.siteNotice?.title || "")}"></label><label class="field"><span>说明内容</span><textarea name="noticeContent">${escape(settings.siteNotice?.content || "")}</textarea></label><button class="footer-btn" type="submit">保存置顶说明</button></form>`, '这里对应前台公告页顶部的置顶说明内容。')} </section><section class="admin-panels">${adminPanel('AI API 余额与会员', 'aiApi', aiApiAdminPanel(aiApiUsers), '给用户手动充值 API 余额，或开通 API 调用会员。')}${adminPanel('兑换码补货', 'redeemCodes', redeemCodesPanel(redeemCodes), '支持抠图会员、API会员月卡、API余额1元和10元兑换码；每个兑换码只能使用一次。')}${adminPanel('账号管理', 'users', `<div class="admin-card-list">${users.map(userCard).join('')}</div>`)} </section>` : ''}
    </main>
    ${compactFooter()}
  `;
}

export function renderAuthPage() {
  const allowRegistration = state.bootstrap?.site?.allowPublicRegistration !== false;
  document.title = '猫猫虫咖波表情包仓库 - 登录后台';
  app.innerHTML = `
    ${header({ title: `<a href="/" class="site-title-link" data-link aria-label="返回首页"><i class="fas fa-cat"></i> 猫猫虫咖波表情包仓库</a>`, subtitle: '登录后台后可以投稿、管理与审核内容', stats: '后台入口', htmlTitle: true })}
    <main class="container admin-page">
      <section class="admin-panels">
        <article class="admin-panel">
          <h3>登录后台</h3>
          <p class="small">已有账号可直接登录，登录成功后会自动进入后台工作台。</p>
          <form id="login-form" class="admin-form">
            <label class="field"><span>用户名</span><input name="username" autocomplete="username" required></label>
            <label class="field"><span>密码</span><input type="password" name="password" autocomplete="current-password" required></label>
            <div class="review-button-row">
              <button class="footer-btn" type="submit">登录</button>
              <a class="site-info-backlink" href="/site-info" data-link>返回站务页</a>
            </div>
          </form>
        </article>
        ${allowRegistration ? `
        <article class="admin-panel">
          <h3>注册账号</h3>
          <p class="small">注册后即可登录后台，上传和管理你的内容。</p>
          <form id="register-form" class="admin-form">
            <label class="field"><span>显示名称</span><input name="displayName" autocomplete="nickname" minlength="2" maxlength="32" required></label>
            <label class="field"><span>用户名</span><input name="username" autocomplete="username" minlength="3" maxlength="24" required></label>
            <label class="field"><span>密码</span><input type="password" name="password" autocomplete="new-password" minlength="8" maxlength="64" required></label>
            <div class="review-button-row">
              <button class="footer-btn" type="submit">注册</button>
            </div>
          </form>
        </article>` : ''}
      </section>
    </main>
    ${compactFooter()}
  `;
  window.scrollTo(0, 0);
}

export function renderMessagePage(title, message) {
  document.title = `猫猫虫咖波表情包仓库 - ${title}`;
  app.innerHTML = `
    ${header({ title: `<a href="/" class="site-title-link" data-link aria-label="返回首页"><i class="fas fa-cat"></i> 猫猫虫咖波表情包仓库</a>`, subtitle: title, stats: '页面提示', htmlTitle: true })}
    <main class="container admin-page">
      <section class="admin-panels">
        <article class="admin-panel">
          <h3>${escape(title)}</h3>
          <p>${escape(message || '页面暂时无法打开，请稍后再试。')}</p>
          <div class="review-button-row">
            <a class="footer-btn" href="/" data-link>返回首页</a>
            <a class="site-info-backlink" href="/site-info" data-link>前往站务页</a>
          </div>
        </article>
      </section>
    </main>
    ${compactFooter()}
  `;
  window.scrollTo(0, 0);
}

export function backendEntry() {
  const viewer = state.bootstrap?.viewer;
  return `<section class="support-card backend-entry-card"><div class="support-card-head"><span class="notice-badge">站务入口</span><h2>后台入口已经移动到这里</h2></div><p class="support-summary">普通访客只需要浏览公开页面；如果你需要投稿、审核、改公告或处理站务，请从这里进入后台。</p><div class="support-points"><p>${viewer ? `当前已登录：${escape(viewer.displayName)}，${escape(roleLabel(viewer.role))}` : '当前未登录后台账号。'}</p></div><a class="support-open-btn admin-entry-btn" href="/dashboard" data-link>${viewer ? '进入后台工作台' : '登录后台'}</a><p class="support-legal-note">为了减少首页干扰，后台入口不再单独放在首页或分类页里。</p></section>`;
}

export function profileEntryLink() {
  const viewer = state.bootstrap?.viewer;
  const href = viewer?.publicId ? `/profile/${viewer.publicId}` : '/profile';
  return `<a class="home-quick-btn profile-entry-link" href="${href}" data-link><i class="fas fa-user"></i> 个人中心</a>`;
}

export function homeQuickEntries(showNotice, showTools) {
  const buttons = [profileEntryLink()];
  if (!showNotice) {
    buttons.push('<button class="home-quick-btn" type="button" data-home-show-notice="1"><i class="fas fa-bullhorn"></i> 公告</button>');
  }
  if (!showTools) {
    buttons.push('<button class="home-quick-btn" type="button" data-home-show-tools="1"><i class="fas fa-toolbox"></i> 工具</button>');
  }
  return `<section class="home-quick-entry-row">${buttons.join('')}</section>`;
}

export const ownedFolderCard = function (folder) {
  const editable = ['rejected', 'draft'].includes(folder.status);
  return `<article class="admin-item-card"><div class="folder-status"><span class="notice-badge">${statusLabel(folder.status)}</span>${folder.publicUrl ? `<a href="${folder.publicUrl}" data-link class="site-info-backlink mini-link">查看页面</a>` : ''}</div><h4>${escape(folder.name)}</h4>${folder.status === 'offline' ? '' : `<p>${escape(folder.description || '暂无说明')}</p>`}${folder.review_note ? `<p class="small">审核备注：${escape(folder.review_note)}</p>` : ''}${folder.status === 'offline' ? '' : renderFolderAssetGallery(folder, { editable })}${editable ? renderFolderEditTools(folder) : ''}</article>`;
};

export function noticeEntry(item) {
  return `<article class="notice-entry"><div class="notice-entry-head"><span class="notice-badge">${formatDate(item.updated_at, true)}</span><h3>${escape(item.title)}</h3></div><p class="notice-summary">${escape(item.content || '')}</p></article>`;
}

export function adminFolderCard(folder) {
  const editing = state.adminEditingFolderId === folder.id;
  return `<article class="admin-item-card"><div class="folder-status"><span class="notice-badge">${statusLabel(folder.status)}</span>${folder.publicUrl ? `<a href="${folder.publicUrl}" data-link class="site-info-backlink mini-link">查看页面</a>` : ''}</div><h4>${escape(folder.name)}</h4><p class="small">路径：${escape(folder.slug)} · 资源数：${folder.assetCount}</p><p class="small">上传者：${escape(folder.ownerName)} @${escape(folder.ownerUsername)}</p><p>${escape(folder.description || '暂无说明')}</p><div class="review-button-row admin-card-actions"><button class="footer-btn footer-btn-small" type="button" data-edit-folder="${folder.id}">${editing ? '收起编辑' : '编辑文件夹'}</button><button class="copy-btn" type="button" data-delete-folder="${folder.id}">删除文件夹</button></div>${editing ? renderAdminFolderEditor(folder) : ''}</article>`;
}

export const reviewCard = function (folder) {
  return `<article class="admin-item-card"><div class="folder-status"><span class="notice-badge">${statusLabel(folder.status)}</span><span class="small">${escape(folder.display_name)} @${escape(folder.username)}</span></div><h4>${escape(folder.name)}</h4><p>${escape(folder.description || '暂无说明')}</p>${renderFolderAssetGallery(folder)}<div class="review-action-row"><textarea class="review-note-input" data-review-note="${folder.id}" placeholder="审核备注"></textarea><div class="review-button-row"><button class="footer-btn footer-btn-small" type="button" data-folder-id="${folder.id}" data-review-action="approve">通过</button><button class="review-secondary-btn" type="button" data-folder-id="${folder.id}" data-review-action="reject">驳回</button><button class="danger-btn" type="button" data-folder-id="${folder.id}" data-review-action="offline">下架</button></div></div></article>`;
};

export function adminTextCard(item, index, total) {
  return `<article class="admin-item-card">
    <div class="folder-status"><span class="notice-badge">公告 #${index + 1}</span><span class="small">排序值：${Number(item.sort_order || 0)}</span></div>
    <h4>${escape(item.title)}</h4>
    <p>${escape(item.content)}</p>
    <div class="review-button-row admin-card-actions">
      <button class="footer-btn footer-btn-small" type="button" data-edit-announcement="${item.id}">编辑</button>
      <button class="copy-btn" type="button" data-move-announcement="${item.id}" data-direction="up" ${index === 0 ? 'disabled' : ''}>上移</button>
      <button class="copy-btn" type="button" data-move-announcement="${item.id}" data-direction="down" ${index === total - 1 ? 'disabled' : ''}>下移</button>
      <button class="danger-btn" type="button" data-delete-announcement="${item.id}">删除</button>
    </div>
  </article>`;
}

export function userCard(user) {
  return `<article class="admin-item-card"><div class="folder-status"><strong>${escape(user.display_name)}</strong><span class="notice-badge">${escape(roleLabel(user.role))}</span></div><p class="small">@${escape(user.username)}</p>${user.role === 'owner' ? '<p class="small">站长账号不可删除。</p>' : `<div class="review-button-row"><button class="copy-btn" type="button" data-role-user="${user.id}">设为用户</button><button class="footer-btn footer-btn-small" type="button" data-role-admin="${user.id}">设为管理员</button><button class="copy-btn" type="button" data-delete-user="${user.id}">删除账号</button></div>`} </article>`;
}

export function redeemCodesPanel(codes) {
  const activeCount = codes.filter(item => item.status === 'active').length;
  const redeemedCount = codes.filter(item => item.status === 'redeemed').length;
  return `
    <form id="redeem-codes-form" class="admin-form">
      <div class="rembg-quota-grid">
        <div class="rembg-quota-item"><span>可用兑换码</span><strong>${activeCount}</strong></div>
        <div class="rembg-quota-item"><span>已使用兑换码</span><strong>${redeemedCount}</strong></div>
      </div>
      <label class="field"><span>兑换码类型</span><select name="productCode">
        <option value="remove_bg_member_monthly">抠图会员月卡</option>
        <option value="ai_api_member_monthly">API会员月卡 ￥6.00 / 30 天</option>
        <option value="ai_api_balance_1">API余额 1 元</option>
        <option value="ai_api_balance_10">API余额 10 元</option>
      </select></label>
      <label class="field"><span>新增兑换码</span><textarea name="codes" placeholder="一行一个兑换码，也可以用空格或逗号分隔" required></textarea></label>
      <p class="small">系统会自动去除首尾空格并转成大写；已经存在的兑换码不会重复添加。</p>
      <button class="footer-btn" type="submit">添加兑换码</button>
    </form>
    <div class="admin-card-list">
      ${codes.length ? codes.map(redeemCodeCard).join('') : '<p class="small">暂时还没有兑换码。</p>'}
    </div>
  `;
}

export function renderProfileEntryPage() {
  if (state.bootstrap?.viewer?.publicId) {
    history.replaceState({}, '', `/profile/${state.bootstrap.viewer.publicId}`);
    state.profile = null;
    api('/api/profile/me').then(data => {
      state.profile = data;
      renderProfilePage();
    }).catch(error => renderMessagePage('个人中心暂时打不开', error.message));
    return;
  }
  document.title = '个人中心 - 登录或注册';
  app.innerHTML = `
    ${header({ title: `<a href="/" class="site-title-link" data-link aria-label="返回首页"><i class="fas fa-cat"></i> 猫猫虫咖波表情包仓库</a>`, subtitle: '登录或注册后进入个人中心', stats: '个人中心', htmlTitle: true })}
    <main class="container admin-page">
      <section class="site-info-hero">
        <div class="site-info-hero-text"><span class="site-info-kicker">个人中心</span><h2>登录后查看收藏、作品和账号信息</h2><p>这里是普通用户的个人入口；原来的后台工作台仍然保留。</p></div>
        <div class="review-button-row"><a class="site-info-backlink" href="/" data-link>返回首页</a><a class="site-info-backlink" href="/dashboard" data-link>旧后台入口</a></div>
      </section>
      <section class="admin-panels">
        <article class="admin-panel">
          <div class="admin-panel-head"><div><h3>登录</h3></div></div>
          <div class="admin-panel-body">
            <form id="login-form" class="admin-form">
              <label class="field"><span>用户名</span><input name="username" autocomplete="username" required></label>
              <label class="field"><span>密码</span><input name="password" type="password" autocomplete="current-password" required></label>
              <div class="review-button-row"><button class="footer-btn" type="submit">登录个人中心</button></div>
            </form>
          </div>
        </article>
        <article class="admin-panel">
          <div class="admin-panel-head"><div><h3>注册</h3></div></div>
          <div class="admin-panel-body">
            <form id="register-form" class="admin-form">
              <label class="field"><span>显示名称</span><input name="displayName" autocomplete="nickname" required></label>
              <label class="field"><span>用户名</span><input name="username" autocomplete="username" required></label>
              <label class="field"><span>密码</span><input name="password" type="password" autocomplete="new-password" minlength="8" required></label>
              <div class="review-button-row"><button class="footer-btn" type="submit">注册账号</button></div>
            </form>
          </div>
        </article>
      </section>
    </main>
    ${compactFooter()}
  `;
}

export function renderProfilePage() {
  const profile = state.profile;
  if (!profile) return renderMessagePage('个人中心加载中', '请稍候。');
  const user = profile.viewer || {};
  const own = Boolean(profile.isOwner);
  const folders = profile.folders || [];
  const favorites = profile.favorites || [];
  const activities = profile.activities || [];
  const stats = profile.stats || {};
  const activeTab = state.profileActiveTab || 'works';
  const listed = own && activeTab === 'favorites' ? favorites : folders;
  const contentTitle = own && activeTab === 'favorites' ? '我的收藏' : own && activeTab === 'info' ? '我的信息' : own ? '我的作品' : '发布的内容';
  const contentIntro = own && activeTab === 'favorites'
    ? '这里显示你收藏过的分类。'
    : own && activeTab === 'info'
      ? '按时间从晚到早展示你在本站留下的动态。'
      : '按修改时间从晚到早排序。';
  document.title = `${user.displayName || '个人中心'} - 个人中心`;
  app.innerHTML = `
    ${header({ title: `<a href="/" class="site-title-link" data-link aria-label="返回首页"><i class="fas fa-cat"></i> 猫猫虫咖波表情包仓库</a>`, subtitle: `${escape(user.displayName || '用户')} 的个人中心`, stats: `ID ${escape(user.id || '')}`, htmlTitle: true })}
    <main class="container admin-page profile-page">
      <section class="site-info-hero profile-hero">
        <div class="site-info-hero-text">
          <span class="site-info-kicker">个人中心</span>
          <h2>${escape(user.displayName || '未命名用户')}</h2>
          <p>数字 ID：${escape(user.id || '')}</p>
          ${profileStatsGrid(stats, 'profile-hero-stats')}
        </div>
        <div class="review-button-row"><a class="site-info-backlink" href="/" data-link>返回首页</a>${own ? '<a class="site-info-backlink" href="/dashboard" data-link>旧后台工作台</a>' : ''}</div>
      </section>
      ${own ? profilePrivatePanel(user) : profilePublicPanel(user)}
      ${own ? profileFeatureTabs(activeTab) : ''}
      <section class="admin-panel profile-content-panel">
        <div class="admin-panel-head"><div><h3>${contentTitle}</h3><p class="small">${contentIntro}</p></div></div>
        <div class="admin-panel-body">
          ${own && activeTab === 'info' ? profileInfoOverview(stats, activities) : `<div class="admin-card-list">${listed.length ? listed.map(profileFolderCard).join('') : '<p class="small">这里暂时没有内容。</p>'}</div>`}
        </div>
      </section>
    </main>
    ${own ? '<button class="profile-logout-fixed" type="button" id="logout-btn"><i class="fas fa-right-from-bracket"></i> 退出登录</button>' : ''}
    ${compactFooter()}
  `;
}

export function profilePrivatePanel(user) {
  const stats = state.profile?.stats || {};
  return `<section class="admin-panel profile-info-panel"><div class="admin-panel-head"><div><h3>账号信息</h3><p class="small">显示名称可以修改；用户名和密码不可修改。</p></div></div><div class="admin-panel-body">${profileStatsGrid(stats, 'profile-info-stats')}<form id="profile-name-form" class="admin-form"><label class="field"><span>显示名称</span><input name="displayName" value="${attr(user.displayName || '')}" required></label><label class="field"><span>用户名</span><input value="${attr(user.username || '')}" readonly></label><label class="field"><span>密码</span><input value="********" readonly></label><div class="review-button-row"><button class="footer-btn" type="submit">保存信息</button><button class="copy-btn" type="button" data-export-profile>保存账号 txt</button></div></form></div></section>`;
}

export function profilePublicPanel(user) {
  const stats = state.profile?.stats || {};
  return `<section class="admin-panel profile-info-panel"><div class="admin-panel-head"><div><h3>公开信息</h3></div></div><div class="admin-panel-body">${profileStatsGrid(stats, 'profile-info-stats')}<p>显示名称：${escape(user.displayName || '')}</p><p class="small">这个页面只显示公开资料和发布内容。</p></div></section>`;
}

export function profileStatsGrid(stats = {}, extraClass = '') {
  const items = [
    ['works', '作品数量', stats.works || 0],
    ['followers', '被关注数', stats.followers || 0],
    ['likes', '被点赞数', stats.likes || 0],
    ['favorites', '被收藏数', stats.favorites || 0]
  ];
  return `<div class="profile-stats-grid ${extraClass}">${items.map(([key, label, value]) => `<div class="profile-stat profile-stat-${key}"><span>${escape(label)}</span><strong>${Number(value || 0)}</strong></div>`).join('')}</div>`;
}

export function profileInfoOverview(stats, activities) {
  return `
    ${profileStatsGrid(stats, 'profile-info-stats')}
    <div class="profile-info-extra">
      <article class="admin-item-card profile-info-extra-card">
        <span class="notice-badge">其他信息</span>
        <p>这里会按时间从晚到早记录你的作品、互动，以及别人对你的关注、点赞、收藏和评论。</p>
      </article>
    </div>
    ${profileActivityFeed(activities)}
  `;
}

export function profileFeatureTabs(activeTab) {
  const tabs = [
    ['works', '我的作品'],
    ['favorites', '我的收藏'],
    ['info', '我的信息'],
    ['upload', '上传作品'],
    ['blacklist', '黑名单'],
    ['contact', '联系我们']
  ];
  return `<section class="profile-feature-tabs">${tabs.map(([key, label]) => `<button class="${activeTab === key ? 'is-active' : ''}" type="button" data-profile-tab="${key}">${label}</button>`).join('')}</section>`;
}

export function profileFolderCard(folder) {
  const activeTab = state.profileActiveTab || 'works';
  const canRemoveFavorite = state.profile?.isOwner && activeTab === 'favorites';
  return `<article class="admin-item-card profile-folder-card"><div class="folder-status"><span class="notice-badge">${Number(folder.count) || 0} 项内容</span>${folder.ownerPublicId ? `<a class="site-info-backlink mini-link" href="/profile/${folder.ownerPublicId}" data-link>${escape(folder.ownerName || '发布者')}</a>` : ''}</div><h4>${escape(folder.name)}</h4><p>${escape(folder.description || '暂无说明')}</p><div class="review-button-row admin-card-actions"><a class="footer-btn footer-link-btn" href="/${encodeURIComponent(folder.slug)}" data-link>查看内容</a>${canRemoveFavorite ? `<button class="copy-btn" type="button" data-favorite-folder="${folder.id}" data-favorited="true">取消收藏</button>` : ''}</div></article>`;
}

export function profileActivityFeed(activities) {
  if (!activities.length) return '<p class="small">还没有可展示的动态。</p>';
  return `<div class="profile-activity-list">${activities.map(activity => `
    <article class="admin-item-card profile-activity-card">
      <div class="folder-status"><span class="notice-badge">${escape(profileActivityTypeLabel(activity.type))}</span><span class="small">${formatDate(activity.time)}</span></div>
      <h4>${activity.link ? `<a href="${activity.link}" data-link>${escape(activity.title)}</a>` : escape(activity.title)}</h4>
      ${activity.summary ? `<p>${escape(activity.summary)}</p>` : ''}
    </article>
  `).join('')}</div>`;
}

export function profileActivityTypeLabel(type) {
  return ({
    folder: '作品',
    comment: '评论',
    like: '点赞',
    follow: '关注',
    'received-comment': '被评论',
    'received-like': '被点赞',
    'received-follow': '被关注'
  })[type] || '动态';
}

export function redeemCodeCard(item) {
  const used = item.status === 'redeemed';
  const owner = item.created_by_name || item.created_by_username || '站长';
  const redeemer = item.redeemed_by_name || item.redeemed_by_username || '';
  const product = redeemCodeProductLabel(item);
  return `
    <article class="admin-item-card">
      <div class="folder-status">
        <strong>${escape(item.code)}</strong>
        <span class="notice-badge">${used ? '已使用' : '可用'}</span>
      </div>
      <p class="small">类型：${escape(product)}</p>
      <p class="small">添加：${formatDate(item.created_at)} · ${escape(owner)}</p>
      ${used ? `<p class="small">兑换：${formatDate(item.redeemed_at)}${redeemer ? ` · ${escape(redeemer)}` : ''}</p>` : '<p class="small">等待用户兑换。</p>'}
    </article>
  `;
}

export function redeemCodeProductLabel(item) {
  const code = item.product_code || 'remove_bg_member_monthly';
  if (code === 'ai_api_member_monthly') return `API会员月卡 ￥6.00 / ${Number(item.duration_days || 30)} 天`;
  if (code === 'ai_api_balance_1') return 'API余额 1 元';
  if (code === 'ai_api_balance_10') return 'API余额 10 元';
  return '抠图会员月卡';
}

export function aiApiAdminPanel(users) {
  return `
    <div class="admin-list-toolbar">
      <span class="small">普通用户每日 50 次免费，API 会员每日 500 次免费；超额调用从余额扣费，失败不计费。</span>
    </div>
    <div class="admin-card-list">
      ${users.length ? users.map(aiApiUserCard).join('') : '<p class="small">暂时没有用户。</p>'}
    </div>
  `;
}

export function aiApiUserCard(user) {
  const memberActive = user.membership_status === 'active';
  return `
    <article class="admin-item-card">
      <div class="folder-status">
        <strong>${escape(user.display_name)} @${escape(user.username)}</strong>
        <span class="notice-badge">${memberActive ? 'API会员' : '普通'}</span>
      </div>
      <p class="small">余额：￥${escape(user.balance || '0.000')} · 今日成功 ${Number(user.success_count || 0)} 次 · 失败 ${Number(user.failed_count || 0)} 次 · 扣费 ${Number(user.charged_count || 0)} 次</p>
      <p class="small">Key：共 ${Number(user.key_count || 0)} 个，启用 ${Number(user.active_key_count || 0)} 个${user.last_used_at ? ` · 最近调用 ${formatDate(user.last_used_at)}` : ''}</p>
      ${memberActive ? `<p class="small">会员到期：${formatDate(user.membership_expires_at)}</p>` : ''}
      <form class="admin-form compact-form" data-ai-api-recharge-form="${user.id}">
        <label class="field"><span>充值金额</span><input name="amount" type="number" min="0.001" step="0.001" placeholder="1.000" required></label>
        <label class="field"><span>备注</span><input name="note" placeholder="站长手动充值"></label>
        <button class="footer-btn footer-btn-small" type="submit">充值余额</button>
      </form>
      <form class="admin-form compact-form" data-ai-api-member-form="${user.id}">
        <label class="field"><span>开通会员天数</span><input name="days" type="number" min="1" max="365" value="30" required></label>
        <button class="copy-btn" type="submit">开通 / 续期 API 会员</button>
      </form>
    </article>
  `;
}

export function compactFooter() {
  return `<footer><div class="container"><div class="footer-content footer-content-compact"><div class="footer-section"><h3><i class="fas fa-heart"></i> 关于本站</h3><p>这里主要收集和分享猫猫虫咖波表情包，方便按分类查找、预览和下载。</p><p>完整公告、站务说明和详细页脚内容请前往 <a href="/site-info" data-link>site-info 页面</a> 查看。</p></div><div class="footer-section"><h3><i class="fas fa-envelope"></i> 联系方式</h3><p>投稿邮箱：<span id="email">2641821302@qq.com</span></p><p>如需投稿、侵权删除或站务联系，请先前往公告页查看说明。</p></div></div><div class="footer-bottom"><p>猫猫虫咖波表情包仓库 • 本网站仅为个人收藏用途 • 更新日期：<span id="update-date">${new Date().toLocaleDateString('zh-CN')}</span></p><p class="credits">Made with <i class="fas fa-heart"></i> by 慢慢猫</p></div></div></footer>`;
}

export function fullFooter() {
  return `<footer><div class="container"><div class="footer-content"><div class="footer-section"><h3><i class="fas fa-heart"></i> 关于本站</h3><p>本站致力于收集和分享猫猫虫咖波的图片、表情包和视频内容，所有资源均来自网络投稿，仅供娱乐使用。</p><p>关于猫猫虫官方联动《我的英雄学院》：本站立场明确且不会含糊。我们坚定热爱中国，坚定维护国家主权、统一和领土完整，坚定反对任何歪曲侵略历史、美化军国主义、伤害中华民族感情的内容。中华民族伟大复兴的大势不可阻挡，国家统一的大义不容挑战，任何“台独”分裂言行都注定失败。希望广大同胞都站在历史正确的一边，以身为堂堂正正的中国人为荣，铭记抗战苦难与先烈牺牲。本站只欢迎可爱、健康、积极的猫猫虫咖波内容，不欢迎任何伤害国家和民族感情的杂音。</p><p>如果您是表情包作者并希望删除或添加您的作品，请通过下方按钮联系我们。当前页面就是完整公告与站务页。</p></div><div class="footer-section"><h3><i class="fas fa-upload"></i> 投稿表情包</h3><p>欢迎投稿新的猫猫虫咖波表情包！请确保表情包内容健康，不包含龙图等不良内容。</p><p>投稿规则：先注册并登录后台账号；进入后台工作台后新建文件夹；填写分类名称、公开路径和说明；上传表情包图片或视频；提交后等待审核，通过后才会公开显示。</p><p>建议优先上传命名清晰、分类明确、内容完整的资源，这样审核会更顺畅。</p><div class="footer-action-row"><a class="footer-btn footer-link-btn" href="/dashboard" data-link>前往后台投稿</a></div></div><div class="footer-section"><h3><i class="fas fa-shield-heart"></i> 侵权删除</h3><p>如果您发现任何侵权内容，或希望删除某一个表情包，请通过QQ联系我们。</p><div class="footer-action-row"><a class="footer-btn footer-link-btn qq-contact-btn" href="https://qm.qq.com/q/AKPiThhsQg" target="_blank" rel="noreferrer">通过QQ联系删除</a></div><p>点击上方按钮将跳转到QQ聊天页面，请直接发送表情包链接或说明。</p></div></div><div class="footer-bottom"><p>猫猫虫咖波表情包仓库 · 本网站仅为个人收藏用途 · 更新日期：<span id="update-date">${new Date().toLocaleDateString('zh-CN')}</span></p><p class="credits">Made with <i class="fas fa-heart"></i> by 慢慢猫</p></div></div></footer>`;
}

export function imageModal() {
  return `<div class="modal hidden" id="image-modal"><div class="modal-content"><button class="modal-close" id="modal-close">&times;</button><div class="modal-body" id="modal-body"></div></div></div>`;
}

export function mediaHtml(url, alt, video) {
  return video ? `<video src="${url}" preload="metadata" muted playsinline></video>` : `<img src="${url}" alt="${attr(alt)}" loading="lazy">`;
}

export function folderCard(folder) {
  return `
    <article class="category-card">
      <a href="/${encodeURIComponent(folder.slug)}" data-link class="category-card-link">
        <div class="category-preview">
          ${folder.coverUrl ? mediaHtml(folder.coverUrl, folder.name, folder.coverMediaKind === 'video') : '<div class="category-preview-empty">暂无封面</div>'}
        </div>
        <div class="category-info">
          <h3>${escape(folder.name)}</h3>
          <p>${escape(folder.description || '猫猫虫咖波表情包合集')}</p>
          <div class="category-meta">
            <span><i class="fas fa-images"></i> ${Number(folder.count) || 0} 项内容</span>
            <span><i class="fas fa-user"></i> ${escape(folder.ownerName || '匿名用户')}</span>
          </div>
        </div>
      </a>
    </article>
  `;
}

export function visibleFolders() {
  const query = state.searchQuery;
  const folders = [...(state.bootstrap?.folders || [])].filter(folder => {
    if (!query) return true;
    return [
      folder.name,
      folder.description,
      folder.slug,
      folder.ownerName,
      `${folder.name} ${folder.description || ''}`,
      `${folder.slug || ''} ${folder.name || ''}`
    ].some(value => normalize(value).includes(query));
  });
  return folders.sort((a, b) => {
    const publishedA = new Date(a.publishedAt || 0).getTime();
    const publishedB = new Date(b.publishedAt || 0).getTime();
    const updatedA = new Date(a.updatedAt || a.publishedAt || 0).getTime();
    const updatedB = new Date(b.updatedAt || b.publishedAt || 0).getTime();
    if (state.sortBy === 'count-asc') return Number(a.count) - Number(b.count) || collator.compare(a.name, b.name);
    if (state.sortBy === 'count-desc') return Number(b.count) - Number(a.count) || collator.compare(a.name, b.name);
    if (state.sortBy === 'published-asc') return publishedA - publishedB || collator.compare(a.name, b.name);
    if (state.sortBy === 'published-desc') return publishedB - publishedA || collator.compare(a.name, b.name);
    if (state.sortBy === 'updated-asc') return updatedA - updatedB || collator.compare(a.name, b.name);
    if (state.sortBy === 'updated-desc') return updatedB - updatedA || collator.compare(a.name, b.name);
    if (state.sortBy === 'name-asc') return collator.compare(a.name, b.name);
    return collator.compare(b.name, a.name);
  });
}

export function homeSearchSummary(total, shown) {
  if (!state.searchQuery) return '';
  return `<p class="search-summary" id="search-summary">搜索“${escape(state.searchDraft || state.searchQuery)}”找到 <strong>${shown}</strong> 个分类，共 ${total} 个分类。</p>`;
}

export function getHomeRecommendation() {
  const folders = [...(state.bootstrap?.folders || [])].filter(folder => folder?.slug);
  if (!folders.length || !HOME_RECOMMEND_TOOLS.length) return null;
  const day = todayKey();
  return {
    tool: getForcedHomeRecommendTool(day) || pickStable(HOME_RECOMMEND_TOOLS, `${day}:tool`),
    folder: pickStable(folders, `${day}:folder`)
  };
}

export function getForcedHomeRecommendTool(day) {
  if (day >= LINK_MATCH_RECOMMEND_UNTIL) return null;
  return HOME_RECOMMEND_TOOLS.find(tool => tool.href === LINK_MATCH_TOOL_HREF) || null;
}

export function isHomeRecommendationSnoozedToday() {
  return localStorage.getItem(HOME_RECOMMEND_SNOOZE_KEY) === todayKey();
}

export function todayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function pickStable(items, seed) {
  let hash = 2166136261;
  for (const char of seed) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return items[Math.abs(hash) % items.length];
}

export function filterAdminFolders(folders) {
  const query = state.adminFolderSearch;
  if (!query) return folders;
  return folders.filter(folder =>
    normalize(folder.name).includes(query) ||
    normalize(folder.slug).includes(query) ||
    normalize(folder.ownerName).includes(query) ||
    normalize(folder.ownerUsername).includes(query) ||
    normalize(folder.description).includes(query)
  );
}

export function sortedAssets() {
  const assets = [...(state.folderDetail?.assets || [])];
  return assets.sort((a, b) => state.categorySortBy === 'name-asc' ? collator.compare(a.original_name, b.original_name) : collator.compare(b.original_name, a.original_name));
}

export function lockPreviewScroll() {
  state.previewScrollY = window.scrollY || window.pageYOffset || 0;
  document.body.style.position = 'fixed';
  document.body.style.top = `-${state.previewScrollY}px`;
  document.body.style.left = '0';
  document.body.style.right = '0';
  document.body.style.width = '100%';
}

export function unlockPreviewScroll() {
  const y = Number(state.previewScrollY || 0);
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.left = '';
  document.body.style.right = '';
  document.body.style.width = '';
  requestAnimationFrame(() => {
    window.scrollTo(0, y);
  });
}

export function getAssetShareUrl(asset) {
  const pageUrl = new URL(location.href);
  if (!asset?.id) return pageUrl.toString();
  pageUrl.hash = `asset-${encodeURIComponent(asset.id)}`;
  return pageUrl.toString();
}

export const openPreview = function (index) {
  const asset = sortedAssets()[index];
  if (!asset) return;
  const modal = document.getElementById('image-modal');
  const body = document.getElementById('modal-body');
  const frogLocked = state.folderDetail?.folder?.name === '\u86e4\u87c6\u6ce2';
  const shareUrl = getAssetShareUrl(asset);
  const downloadAction = frogLocked
    ? ''
    : state.bootstrap?.viewer
      ? `<a class="modal-btn" href="/api/download/${encodeURIComponent(asset.id)}"><i class="fas fa-download"></i> \u4e0b\u8f7d\u539f\u6587\u4ef6</a>`
      : `<button class="modal-btn disabled" type="button" disabled title="\u8bf7\u5148\u767b\u5f55"><i class="fas fa-lock"></i> \u767b\u5f55\u540e\u624d\u80fd\u4e0b\u8f7d</button>`;
  const loginHint = frogLocked || state.bootstrap?.viewer
    ? ''
    : `<p class="small">\u8d44\u6e90\u4e0b\u8f7d\u73b0\u5728\u9700\u8981\u5148<a href="/dashboard" data-link>\u767b\u5f55\u540e\u53f0</a>\u3002</p>`;
  body.innerHTML = `${asset.media_kind === 'video' ? `<video src="${asset.url}" controls autoplay playsinline></video>` : `<img id="modal-image" src="${asset.url}" alt="${attr(asset.original_name)}">`}<div class="modal-info"><h3 id="modal-title">\u8d44\u6e90\u9884\u89c8</h3><p>\u5206\u7c7b\uff1a<span id="modal-category">${escape(state.folderDetail.folder.name)}</span></p><p>\u6587\u4ef6\u540d\uff1a<span id="modal-filename">${escape(asset.original_name)}</span></p>${loginHint}<div class="modal-actions">${downloadAction}<button class="modal-btn" type="button" id="modal-copy-btn"><i class="fas fa-link"></i> \u590d\u5236\u94fe\u63a5</button></div></div>`;
  modal.classList.remove('hidden');
  if (!state.previewOpen) {
    lockPreviewScroll();
    history.pushState({ preview: true }, '', location.href);
  }
  state.previewOpen = true;
  document.getElementById('modal-copy-btn')?.addEventListener('click', () => copyText(shareUrl).then(() => toast('\u94fe\u63a5\u5df2\u590d\u5236')), { once: true });
};

export const closeModal = function (fromPopState = false) {
  if (!fromPopState && state.previewOpen) {
    history.back();
    return;
  }
  document.getElementById('image-modal')?.classList.add('hidden');
  const body = document.getElementById('modal-body');
  if (body) body.innerHTML = '';
  if (state.previewOpen) {
    state.previewOpen = false;
    unlockPreviewScroll();
  }
};

export function clearHomeIntroTimer() {
  if (homeIntroTimer) {
    clearTimeout(homeIntroTimer);
    homeIntroTimer = null;
  }
}

export function clearHomeRestoreHintTimer() {
  if (homeRestoreHintTimer) {
    clearTimeout(homeRestoreHintTimer);
    homeRestoreHintTimer = null;
  }
}

export function scheduleHomeIntroAutoHide() {
  clearHomeIntroTimer();
  if (state.homeIntroDismissed || decodeURIComponent(location.pathname) !== '/') return;
  homeIntroTimer = setTimeout(() => {
    if (decodeURIComponent(location.pathname) !== '/') return;
    state.homeIntroDismissed = true;
    state.homeRestoreHintDismissed = false;
    renderHomePage();
  }, 5000);
}

export function scheduleHomeRestoreHintAutoHide(showRestoreHint) {
  clearHomeRestoreHintTimer();
  if (!showRestoreHint || decodeURIComponent(location.pathname) !== '/') return;
  homeRestoreHintTimer = setTimeout(() => {
    if (decodeURIComponent(location.pathname) !== '/') return;
    state.homeRestoreHintDismissed = true;
    renderHomePage();
  }, 4000);
}

export function restoreHomePanels() {
  state.homeIntroDismissed = false;
  state.homeNoticeDismissed = false;
  state.homeToolsDismissed = false;
  state.homeRecommendDismissed = false;
  state.homeRestoreHintDismissed = true;
  renderHomePage();
}

export function dismissHomeNotice() {
  state.homeNoticeDismissed = true;
  state.homeRestoreHintDismissed = false;
  renderHomePage();
}

export function dismissHomeTools() {
  state.homeToolsDismissed = true;
  state.homeRestoreHintDismissed = false;
  renderHomePage();
}

export function showHomeNotice() {
  state.homeNoticeDismissed = false;
  state.homeRestoreHintDismissed = true;
  renderHomePage();
}

export function showHomeTools() {
  state.homeToolsDismissed = false;
  state.homeRestoreHintDismissed = true;
  renderHomePage();
}

export function dismissHomeRecommendation() {
  state.homeRecommendDismissed = true;
  renderHomePage();
}

export function dismissHomeRecommendationsForToday() {
  localStorage.setItem(HOME_RECOMMEND_SNOOZE_KEY, todayKey());
  renderHomePage();
}

export const renderHomePage = function () {
  clearHomeIntroTimer();
  clearHomeRestoreHintTimer();
  document.title = '\u732b\u732b\u866b\u5496\u6ce2\u8868\u60c5\u5305\u4ed3\u5e93';
  const site = state.bootstrap?.site || {};
  const notice = state.bootstrap?.announcements?.[0];
  const folders = visibleFolders();
  const totalFolders = state.bootstrap?.folders?.length || 0;
  const showIntro = !state.homeIntroDismissed;
  const showNotice = !state.homeNoticeDismissed;
  const showTools = !state.homeToolsDismissed;
  const recommendation = getHomeRecommendation();
  const showRecommendation = Boolean(recommendation) && !isHomeRecommendationSnoozedToday() && !state.homeRecommendDismissed;
  const showRestoreHint = (!showIntro || !showNotice || !showTools) && !state.homeRestoreHintDismissed;
  app.innerHTML = `
    ${header({ title: site.name || '\u732b\u732b\u866b\u5496\u6ce2\u8868\u60c5\u5305\u4ed3\u5e93', subtitle: '\u6536\u96c6\u5e76\u5206\u4eab\u53ef\u7231\u7684\u732b\u732b\u866b\u5496\u6ce2\u56fe\u7247\u3001\u8868\u60c5\u5305\u548c\u89c6\u9891\u5185\u5bb9\uff01', stats: `<span>${site.totalCategories || 0}</span> \u4e2a\u5206\u7c7b \u00b7 <span>${site.totalAssets || 0}</span> \u9879\u5185\u5bb9` })}
    <main class="container">
      ${showIntro ? '<section class="intro home-intro-panel"><p>\u672c\u7f51\u7ad9\u4f1a\u6839\u636e\u6587\u4ef6\u5939\u540d\u79f0\u81ea\u52a8\u5206\u7c7b\uff0c\u6bcf\u4e2a\u6587\u4ef6\u5939\u91cc\u7684\u56fe\u7247\u6216\u89c6\u9891\u90fd\u4f1a\u6536\u8fdb\u5bf9\u5e94\u5206\u7c7b\u3002\u70b9\u51fb\u5206\u7c7b\u5361\u7247\u540e\uff0c\u53ef\u4ee5\u7ee7\u7eed\u9884\u89c8\u548c\u4e0b\u8f7d\u5185\u5bb9\uff08\u86e4\u87c6\u6ce2\u5206\u7c7b\u9664\u5916\uff09\u3002</p></section>' : ''}
      ${showNotice ? `<section class="notice-board" id="site-notice-board" data-mode="compact"><div class="notice-board-head"><div><span class="notice-kicker">${escape(state.bootstrap?.siteNotice?.title || '\u7ad9\u5185\u516c\u544a')}</span><h2>\u6700\u65b0\u7ad9\u5185\u516c\u544a</h2><p>${escape(state.bootstrap?.siteNotice?.content || '\u6b22\u8fce\u6765\u5230\u732b\u732b\u866b\u5496\u6ce2\u8868\u60c5\u5305\u4ed3\u5e93\u540e\u53f0\u7248\u3002\u8fd9\u91cc\u7684\u5185\u5bb9\u5c06\u7531\u5ba1\u6838\u901a\u8fc7\u540e\u7684\u6587\u4ef6\u5939\u81ea\u52a8\u53d1\u5e03\u3002')}</p></div><div class="section-head-actions"><button class="copy-btn home-notice-close" type="button" data-close-home-notice="1">\u5173\u95ed</button><a class="notice-board-link" href="/site-info" data-link>\u67e5\u770b\u5b8c\u6574\u516c\u544a</a></div></div><div class="notice-entry-list compact"><article class="notice-entry"><div class="notice-entry-head"><span class="notice-badge">${notice ? formatDate(notice.updated_at, true) : '\u6700\u65b0\u516c\u544a'}</span><h3>${escape(notice?.title || '\u6b22\u8fce\u6765\u5230\u732b\u732b\u866b\u5496\u6ce2\u8868\u60c5\u5305\u4ed3\u5e93\u540e\u53f0\u7248\u3002')}</h3></div><p class="notice-summary">${escape(notice?.content || state.bootstrap?.siteNotice?.content || '')}</p></article></div></section>` : ''}
      ${homeQuickEntries(showNotice, showTools)}
      ${showTools ? homeToolsCard() : ''}
      <section class="controls">
        <form id="search-form" class="search-box" role="search">
          <i class="fas fa-search"></i>
          <input id="search-input" name="keyword" type="text" placeholder="\u641c\u7d22\u5206\u7c7b..." value="${attr(state.searchDraft)}">
          <div class="search-actions">
            <button class="search-submit-btn" type="submit" data-home-search-submit>\u786e\u8ba4</button>
            <button class="search-clear-btn" type="button" data-clear-search ${state.searchDraft || state.searchQuery ? '' : 'disabled'}>\u53d6\u6d88</button>
          </div>
        </form>
        <div class="sort-options">
          <label for="sort-select">\u6392\u5e8f\u65b9\u5f0f</label>
          <select id="sort-select" name="sort">
            <option value="name-asc" ${state.sortBy === 'name-asc' ? 'selected' : ''}>\u540d\u79f0 (A-Z)</option>
            <option value="name-desc" ${state.sortBy === 'name-desc' ? 'selected' : ''}>\u540d\u79f0 (Z-A)</option>
            <option value="count-asc" ${state.sortBy === 'count-asc' ? 'selected' : ''}>\u6570\u91cf (\u4ece\u5c11\u5230\u591a)</option>
            <option value="count-desc" ${state.sortBy === 'count-desc' ? 'selected' : ''}>\u6570\u91cf (\u4ece\u591a\u5230\u5c11)</option>
            <option value="published-asc" ${state.sortBy === 'published-asc' ? 'selected' : ''}>\u53d1\u5e03\u65f6\u95f4 (\u65e9\u5230\u665a)</option>
            <option value="published-desc" ${state.sortBy === 'published-desc' ? 'selected' : ''}>\u53d1\u5e03\u65f6\u95f4 (\u665a\u5230\u65e9)</option>
            <option value="updated-asc" ${state.sortBy === 'updated-asc' ? 'selected' : ''}>\u4fee\u6539\u65f6\u95f4 (\u4ece\u65e9\u5230\u665a)</option>
            <option value="updated-desc" ${state.sortBy === 'updated-desc' ? 'selected' : ''}>\u4fee\u6539\u65f6\u95f4 (\u4ece\u665a\u5230\u65e9)</option>
          </select>
        </div>
        ${homeSearchSummary(totalFolders, folders.length)}
      </section>
      <section class="categories" id="home-categories">${folders.length ? folders.map(folderCard).join('') : '<div class="empty-state">\u6682\u65e0\u53ef\u5c55\u793a\u7684\u5206\u7c7b</div>'}</section>
    </main>
    ${showRecommendation ? homeRecommendationModal(recommendation) : ''}
    ${showRestoreHint ? '<button class="home-restore-hint" type="button" data-home-restore="1">\u70b9\u51fb\u9876\u90e8\u6807\u9898\u680f\u53ef\u91cd\u65b0\u5c55\u5f00\u8bf4\u660e\u3001\u516c\u544a\u548c\u5de5\u5177\u5165\u53e3</button>' : ''}
    ${compactFooter()}
    ${imageModal()}
  `;
  document.querySelector('header .header-content')?.setAttribute('data-home-restore', '1');
  bindHomeSearchControls();
  scheduleHomeIntroAutoHide();
  scheduleHomeRestoreHintAutoHide(showRestoreHint);
};

export function applyHomeSearch(value, { rerender = false, scroll = false } = {}) {
  state.searchDraft = value || '';
  state.searchQuery = normalize(state.searchDraft);
  if (rerender || !refreshHomeSearchResults()) {
    renderHomePage();
  }
  if (scroll) {
    requestAnimationFrame(() => {
      document.getElementById('home-categories')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
}

export function bindHomeSearchControls() {
  const form = document.getElementById('search-form');
  const input = document.getElementById('search-input');
  const clearButton = document.querySelector('[data-clear-search]');
  if (!form || !input) return;

  form.onsubmit = event => {
    event.preventDefault();
    applyHomeSearch(input.value, { rerender: true, scroll: true });
  };
  input.oninput = event => {
    if (event.isComposing) return;
    applyHomeSearch(input.value);
  };
  input.onchange = event => {
    if (event.isComposing) return;
    applyHomeSearch(input.value);
  };
  if (clearButton) {
    clearButton.onclick = event => {
      event.preventDefault();
      applyHomeSearch('', { rerender: true });
    };
  }
}

export function refreshHomeSearchResults() {
  const categories = document.getElementById('home-categories');
  if (!categories) return false;
  const folders = visibleFolders();
  const totalFolders = state.bootstrap?.folders?.length || 0;
  categories.innerHTML = folders.length
    ? folders.map(folderCard).join('')
    : '<div class="empty-state">没有找到匹配的分类</div>';

  const input = document.getElementById('search-input');
  if (input && input.value !== state.searchDraft) input.value = state.searchDraft;

  const clearButton = document.querySelector('[data-clear-search]');
  if (clearButton) clearButton.disabled = !(state.searchDraft || state.searchQuery);

  const controls = document.querySelector('.controls');
  const oldSummary = document.getElementById('search-summary');
  const nextSummary = homeSearchSummary(totalFolders, folders.length);
  if (oldSummary) {
    if (nextSummary) oldSummary.outerHTML = nextSummary;
    else oldSummary.remove();
  } else if (nextSummary && controls) {
    controls.insertAdjacentHTML('beforeend', nextSummary);
  }
  return true;
}

export function homeToolsCard() {
  return `
    <section class="support-card tools-entry-card">
      <div class="notice-board-head">
        <div>
          <span class="notice-kicker">工具入口</span>
          <h2>站内工具列表</h2>
          <p>这里集中放置站内工具。现在可以从工具列表进入 AI 聊天、AI 抠图、灵感工坊、慢慢听歌、咖波连连看、SBTI、CSTI 和 YSTI，后续新增工具也会统一收在这里。</p>
        </div>
        <div class="section-head-actions">
          <button class="copy-btn home-notice-close" type="button" data-close-home-tools="1">关闭</button>
          <a class="notice-board-link" href="/tools/list" data-link>查看工具列表</a>
        </div>
      </div>
      <div class="notice-entry-list compact">
        <article class="notice-entry">
          <div class="notice-entry-head">
            <span class="notice-badge">当前工具</span>
            <h3>AI 聊天 / AI 抠图 / 慢慢听歌 / 咖波连连看 / SBTI / CSTI / YSTI</h3>
          </div>
          <p class="notice-summary">当前已提供 AI 聊天、AI 抠图、灵感工坊、慢慢听歌、咖波连连看、SBTI 人格测试、CSTI 人格测试和 YSTI 原神人格测试入口，统一从工具列表进入。</p>
        </article>
      </div>
    </section>
  `;
}

export function homeRecommendationCard(recommendation) {
  return homeRecommendationModal(recommendation);
}

export function homeRecommendationModal(recommendation) {
  const { tool, folder } = recommendation;
  return `
    <section class="home-recommend-modal" role="dialog" aria-modal="true" aria-label="推荐访问">
      <div class="home-recommend-card">
        <button class="home-recommend-close" type="button" data-close-home-recommend title="继续浏览首页"><i class="fas fa-xmark"></i></button>
        <div class="notice-board-head home-recommend-head">
        <div>
          <span class="notice-kicker">推荐访问</span>
          <h2>今天可以先看看这两个页面</h2>
          <p>从站内工具和表情包分类里各挑一个入口，想快速逛一下可以直接点过去。</p>
        </div>
      </div>
      <div class="home-recommend-grid">
        <a class="home-recommend-item" href="${attr(tool.href)}"${tool.href.startsWith('/tools/') && !tool.href.endsWith('/') ? ' data-link' : ''}>
          <span class="home-recommend-icon"><i class="fas ${attr(tool.icon)}"></i></span>
          <span class="home-recommend-text">
            <span class="notice-badge">${escape(tool.badge)}</span>
            <strong>${escape(tool.title)}</strong>
            <small>${escape(tool.summary)}</small>
          </span>
          <span class="home-recommend-arrow"><i class="fas fa-arrow-right"></i></span>
        </a>
        <a class="home-recommend-item" href="/${encodeURIComponent(folder.slug)}" data-link>
          <span class="home-recommend-cover">
            ${folder.coverUrl ? mediaHtml(folder.coverUrl, folder.name, folder.coverMediaKind === 'video') : '<span>暂无封面</span>'}
          </span>
          <span class="home-recommend-text">
            <span class="notice-badge">表情包分类</span>
            <strong>${escape(folder.name)}</strong>
            <small>${escape(folder.description || `共 ${Number(folder.count) || 0} 项内容`)}</small>
          </span>
          <span class="home-recommend-arrow"><i class="fas fa-arrow-right"></i></span>
        </a>
      </div>
      <label class="home-recommend-snooze">
        <input type="checkbox" data-home-recommend-snooze>
        <span>今日内不再显示</span>
      </label>
      </div>
    </section>
  `;
}

export function toolListCard({ badge, title, summary, href, actionText, dataLink = true }) {
  return `<article class="admin-item-card tool-list-card"><div class="folder-status"><span class="notice-badge">${escape(badge)}</span></div><h4>${escape(title)}</h4><p>${escape(summary)}</p><div class="review-button-row admin-card-actions"><a class="footer-btn footer-link-btn" href="${href}"${dataLink ? ' data-link' : ''}>${escape(actionText)}</a></div></article>`;
}

export function renderFolderPage() {
  const folder = state.folderDetail.folder;
  const assets = sortedAssets();
  const comments = state.folderDetail.comments || [];
  const frogLocked = folder.name === '\u86e4\u87c6\u6ce2' || folder.slug === 'hamabo';
  const pageShareUrl = location.href;
  const qqShareUrl = `https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(pageShareUrl)}&title=${encodeURIComponent(folder.name)}`;
  document.title = `\u732b\u732b\u866b\u5496\u6ce2\u8868\u60c5\u5305\u4ed3\u5e93 - ${folder.name}`;
  app.innerHTML = `
    ${header({ title: `<a href="/" class="site-title-link" data-link data-home-link aria-label="\u8fd4\u56de\u4e3b\u9875"><i class="fas fa-cat"></i> \u732b\u732b\u866b\u5496\u6ce2\u8868\u60c5\u5305\u4ed3\u5e93</a>`, subtitle: `${folder.name} - \u8d44\u6e90\u5408\u96c6`, stats: `<span>1</span> \u4e2a\u5206\u7c7b \u00b7 <span>${assets.length}</span> \u9879\u5185\u5bb9`, htmlTitle: true })}
    <main class="container">
      <section class="category-detail">
        <div class="detail-header">
          <h2>${escape(folder.name)}</h2>
          <div class="profile-folder-meta">
            <span>发布者：${folder.ownerPublicId ? `<a href="/profile/${folder.ownerPublicId}" data-link>${escape(folder.ownerName || '匿名用户')}</a>` : escape(folder.ownerName || '匿名用户')}</span>
            <div class="detail-social-actions">
              ${renderFolderFollowButton(folder)}
              <button class="copy-btn detail-social-btn detail-favorite-btn" type="button" data-favorite-folder="${folder.id}" data-favorited="${folder.isFavorited ? 'true' : 'false'}">${folder.isFavorited ? '已收藏' : '收藏'}</button>
              <button class="copy-btn detail-social-btn" type="button" data-like-folder="${folder.id}" data-liked="${folder.isLiked ? 'true' : 'false'}"><i class="${folder.isLiked ? 'fas' : 'far'} fa-heart"></i> ${folder.isLiked ? '已点赞' : '点赞'} ${Number(folder.likeCount || 0)}</button>
              <button class="copy-btn detail-social-btn" type="button" data-scroll-comments><i class="far fa-comment"></i> 评论 ${Number(folder.commentCount || comments.length || 0)}</button>
            </div>
          </div>
          <div class="detail-header-row">
            <p class="detail-info">\u5171 <span>${assets.length}</span> \u9879\u5185\u5bb9</p>
            <div class="detail-header-actions">
              <button class="modal-share-btn detail-share-toggle" type="button" data-toggle-page-share><i class="fas fa-share-nodes"></i> \u5206\u4eab\u672c\u9875</button>
              <div class="modal-share-grid detail-share-grid hidden" id="page-share-panel">
                <a class="modal-share-btn" href="${qqShareUrl}" target="_blank" rel="noreferrer"><i class="fab fa-qq"></i> QQ</a>
                <button class="modal-share-btn" type="button" data-copy-url="${attr(pageShareUrl)}"><i class="fas fa-comment"></i> \u5fae\u4fe1</button>
                <button class="modal-share-btn" type="button" data-copy-url="${attr(pageShareUrl)}"><i class="fas fa-link"></i> \u590d\u5236\u94fe\u63a5</button>
                <button class="modal-share-btn" type="button" data-share-page><i class="fas fa-share-nodes"></i> \u66f4\u591a\u5206\u4eab</button>
              </div>
              <div class="sort-options">
                <label for="category-sort-select">\u6392\u5e8f\u65b9\u5f0f\uff1a</label>
                <select id="category-sort-select">
                  <option value="name-asc" ${state.categorySortBy === 'name-asc' ? 'selected' : ''}>\u6587\u4ef6\u540d (A-Z)</option>
                  <option value="name-desc" ${state.categorySortBy === 'name-desc' ? 'selected' : ''}>\u6587\u4ef6\u540d (Z-A)</option>
                </select>
              </div>
            </div>
          </div>
          <p class="detail-description">${escape(folder.description || `${folder.name} \u8d44\u6e90\u5408\u96c6`)}</p>
        </div>
        ${frogLocked ? '<div class="warning" id="frog-warning"><i class="fas fa-exclamation-triangle"></i> \u6b64\u5206\u7c7b\u4ec5\u652f\u6301\u9884\u89c8\uff0c\u4e0d\u53ef\u4e0b\u8f7d\u3002</div>' : ''}
        <div class="images-grid">${assets.map((asset, index) => assetCard(asset, index)).join('')}</div>
        ${renderFolderComments(folder, comments)}
      </section>
    </main>
    ${compactFooter()}
    ${imageModal()}
  `;
  window.scrollTo(0, 0);
}

export function renderFolderFollowButton(folder) {
  if (!folder.ownerPublicId) return '';
  return `<button class="copy-btn detail-social-btn" type="button" data-follow-user="${folder.ownerPublicId}" data-following="${folder.isFollowingOwner ? 'true' : 'false'}"><i class="${folder.isFollowingOwner ? 'fas' : 'far'} fa-user"></i> ${folder.isFollowingOwner ? '已关注' : '关注'} ${Number(folder.followerCount || 0)}</button>`;
}

export function renderFolderComments(folder, comments) {
  const viewer = state.bootstrap?.viewer;
  return `
    <section class="folder-comments" id="folder-comments">
      <div class="folder-comments-head">
        <div>
          <span class="site-info-kicker">评论</span>
          <h3>评论 ${Number(folder.commentCount || comments.length || 0)}</h3>
        </div>
      </div>
      ${viewer ? `
        <form class="folder-comment-form" id="folder-comment-form">
          <label class="field">
            <span>发表评论</span>
            <textarea name="content" maxlength="100" placeholder="写点什么，最多 100 字" required></textarea>
          </label>
          <div class="review-button-row">
            <button class="footer-btn footer-btn-small" type="submit">发表评论</button>
          </div>
        </form>
      ` : '<p class="small folder-comments-login">登录后可以发表评论。</p>'}
      <div class="folder-comment-list">
        ${comments.length ? comments.map(folderCommentCard).join('') : '<p class="small">还没有评论。</p>'}
      </div>
    </section>
  `;
}

export function folderCommentCard(comment) {
  return `
    <article class="folder-comment-card">
      <div class="folder-comment-head">
        <div class="folder-comment-author">
          ${comment.authorPublicId ? `<a href="/profile/${comment.authorPublicId}" data-link>${escape(comment.authorName || '用户')}</a>` : escape(comment.authorName || '用户')}
          <span class="small">${formatDate(comment.createdAt)}</span>
        </div>
        ${comment.canDelete ? `<button class="copy-btn" type="button" data-delete-comment="${comment.id}">删除</button>` : ''}
      </div>
      <p>${escape(comment.content)}</p>
    </article>
  `;
}

export function assetCard(asset, index) {
  const video = asset.media_kind === 'video';
  return `<article class="image-card"><button type="button" class="image-card-trigger" data-preview="${index}">${mediaHtml(asset.url, asset.original_name, video)}</button></article>`;
}

export function renderFolderAssetGallery(folder, { editable = false, manageMode = 'owner' } = {}) {
  const assets = folder.assets || [];
  if (!assets.length) return '<p class="small">这个文件夹里暂时还没有内容。</p>';
  return `<div class="admin-asset-grid">${assets.map(asset => `<article class="admin-asset-card"><div class="admin-asset-preview">${asset.previewUrl ? mediaHtml(asset.previewUrl, asset.original_name, asset.media_kind === 'video') : '<div class="category-preview-empty">不可预览</div>'}</div><div class="admin-asset-meta"><p class="small admin-asset-name">${escape(asset.original_name)}</p><p class="small">状态：${escape(statusLabel(asset.status || 'published'))}</p>${editable ? `<button class="copy-btn admin-asset-delete-btn" type="button" data-folder-id="${folder.id}" data-delete-asset="${asset.id}" data-manage-mode="${manageMode}">删除这个内容</button>` : ''}</div></article>`).join('')}</div>`;
}

export function renderFolderEditTools(folder) {
  return `<div class="folder-edit-tools"><form class="admin-form compact-form" data-folder-edit-form="${folder.id}"><label class="field"><span>追加图片 / 视频</span><input name="files" type="file" multiple accept="image/*,video/mp4,video/webm,video/quicktime" required></label><button class="footer-btn footer-btn-small" type="submit">追加内容</button></form><div class="review-button-row"><button class="review-secondary-btn" type="button" data-resubmit-folder="${folder.id}">重新提交审核</button></div></div>`;
}

export function renderAdminFolderEditor(folder) {
  return `<div class="folder-admin-editor"><form class="admin-form" data-admin-folder-meta-form="${folder.id}"><div class="admin-folder-meta-grid"><label class="field"><span>文件夹名称</span><input name="name" value="${attr(folder.name)}" required></label><label class="field"><span>公开路径</span><input name="slug" value="${attr(folder.slug)}" pattern="[a-z0-9-]{3,80}" title="请填写不重复的英文小写路径，例如 example-folder" required></label><label class="field"><span>当前状态</span><select name="status"><option value="draft" ${folder.status === 'draft' ? 'selected' : ''}>草稿</option><option value="pending_review" ${folder.status === 'pending_review' ? 'selected' : ''}>待审核</option><option value="published" ${folder.status === 'published' ? 'selected' : ''}>已公开</option><option value="rejected" ${folder.status === 'rejected' ? 'selected' : ''}>已驳回</option><option value="offline" ${folder.status === 'offline' ? 'selected' : ''}>已下架</option></select></label></div><label class="field"><span>说明</span><textarea name="description">${escape(folder.description || '')}</textarea></label><div class="review-button-row"><button class="footer-btn footer-btn-small" type="submit">保存文件夹信息</button><button class="copy-btn" type="button" data-cancel-admin-folder-edit="1">取消</button></div></form><div class="folder-edit-tools"><form class="admin-form compact-form" data-admin-folder-assets-form="${folder.id}"><label class="field"><span>追加图片 / 视频</span><input name="files" type="file" multiple accept="image/*,video/mp4,video/webm,video/quicktime" required></label><button class="footer-btn footer-btn-small" type="submit">追加资源</button></form></div><div class="admin-existing-assets"><div class="admin-list-toolbar"><span class="small">这里可以直接维护现有资源；改状态会同步影响这个文件夹下的资源公开状态。</span></div>${renderFolderAssetGallery(folder, { editable: true, manageMode: 'admin' })}</div></div>`;
}

