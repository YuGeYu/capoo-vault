import { state, escape, attr, formatDate } from './app-support.js';
import { visibleFolders, HOME_RECOMMEND_TOOLS, todayKey } from './app-renderers.js';

export function folderIdentity(folder) {
  return String(folder?.id || folder?.slug || folder?.name || '');
}

export function folderPublishedTime(folder) {
  const value = new Date(folder?.publishedAt || 0).getTime();
  return Number.isFinite(value) ? value : 0;
}

function compareNames(a, b) {
  return String(a?.name || '').localeCompare(String(b?.name || ''), 'zh-CN');
}

function byPublishedDesc(a, b) {
  return folderPublishedTime(b) - folderPublishedTime(a) || compareNames(a, b);
}

function byViewsDesc(a, b) {
  return Number(b?.viewCount || 0) - Number(a?.viewCount || 0) || byPublishedDesc(a, b);
}

export function selectFeaturedFolder(folders) {
  const recent = [...folders].filter(folder => folder?.slug).sort(byPublishedDesc).slice(0, 20);
  const withCover = recent.filter(folder => folder.coverUrl && Number(folder.count || 0) > 0);
  return [...(withCover.length ? withCover : recent)].sort(byViewsDesc)[0] || null;
}

export function takeUnique(target, candidates, count, used) {
  if (target.length >= count) return target;
  for (const folder of candidates) {
    const identity = folderIdentity(folder);
    if (!identity || used.has(identity)) continue;
    target.push(folder);
    used.add(identity);
    if (target.length >= count) break;
  }
  return target;
}

export function stableHash(value) {
  let hash = 2166136261;
  for (const char of String(value || '')) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function stableDailyShuffle(items, seed) {
  return [...items].sort((a, b) => {
    const keyA = folderIdentity(a);
    const keyB = folderIdentity(b);
    return stableHash(`${seed}:${keyA}`) - stableHash(`${seed}:${keyB}`)
      || keyA.localeCompare(keyB, 'zh-CN');
  });
}

export function buildMixedRecommendations(folders, featuredFolder, seed = `${todayKey()}:lobby-recommend-v1`) {
  const target = [];
  const featuredIdentity = folderIdentity(featuredFolder);
  const used = new Set(featuredIdentity ? [featuredIdentity] : []);
  const candidates = folders.filter(folder => folder?.slug && folderIdentity(folder) !== featuredIdentity);

  takeUnique(target, [...candidates].sort(byPublishedDesc), 8, used);
  takeUnique(target, [...candidates].sort(byViewsDesc), 16, used);
  takeUnique(target, [...candidates].sort((a, b) =>
    Number(a?.viewCount || 0) - Number(b?.viewCount || 0) || byPublishedDesc(a, b)
  ), 24, used);
  takeUnique(target, stableDailyShuffle(candidates, `${seed}:fill`), 24, used);

  return stableDailyShuffle(target, seed);
}

function betaCoverMedia(folder, { featured = false } = {}) {
  if (!folder?.coverUrl) return `<div class="${featured ? 'beta-featured' : 'beta-folder'}-placeholder">暂无封面</div>`;
  if (folder.coverMediaKind === 'video') {
    return `<video src="${attr(folder.coverUrl)}" aria-label="${attr(folder.name)}" preload="metadata" muted playsinline></video>`;
  }
  return `<img src="${attr(folder.coverUrl)}" alt="${attr(folder.name)}" loading="lazy" decoding="async"${featured ? ' fetchpriority="high"' : ''}>`;
}

export function renderBetaHomePage() {
  const site = state.bootstrap?.site || {};
  const allFolders = visibleFolders();
  const viewer = state.bootstrap?.viewer;

  // 获取当前频道，默认为推荐
  const currentChannel = state.betaChannel || 'recommend';

  let folders = [...allFolders];
  let channelTitle = '为你精选';
  let featuredFolder = null;

  if (currentChannel === 'latest') {
    channelTitle = '最新发布';
    folders = folders.sort(byPublishedDesc);
  } else if (currentChannel === 'popular') {
    channelTitle = '浏览最多';
    folders = folders.sort(byViewsDesc);
  } else if (currentChannel === 'tools') {
    channelTitle = '站内工具';
  } else if (state.searchQuery) {
    channelTitle = '搜索结果';
  } else {
    const recommendationSource = [...(state.bootstrap?.folders || [])];
    featuredFolder = selectFeaturedFolder(recommendationSource);
    folders = buildMixedRecommendations(recommendationSource, featuredFolder);
  }

  const betaNav = `
    <nav class="beta-home-nav">
      <div class="beta-nav-left">
        <a href="/" class="beta-nav-logo" data-link>
          <i class="fas fa-cat"></i>
          <span>猫猫虫咖波</span>
        </a>
        <div class="beta-nav-links">
          <a href="/" data-link class="beta-nav-link active">首页</a>
          <a href="/tools/list" data-link class="beta-nav-link">工具</a>
          <a href="/site-info" data-link class="beta-nav-link">公告</a>
          <a href="/dashboard" data-link class="beta-nav-link">后台</a>
          <a href="${viewer ? `/profile/${viewer.publicId || ''}` : '/profile'}" data-link class="beta-nav-link">个人中心</a>
        </div>
      </div>
      <div class="beta-nav-center">
        <form id="beta-search-form" class="beta-search-box">
          <i class="fas fa-search"></i>
          <input id="beta-search-input" type="text" placeholder="搜索分类、发布者..." value="${attr(state.searchDraft)}">
          <button type="submit" class="beta-search-btn">搜索</button>
        </form>
      </div>
      <div class="beta-nav-right">
        <button id="theme-toggle" class="beta-nav-icon-btn" title="切换主题">
          <i class="fas ${state.theme === 'dark' ? 'fa-sun' : 'fa-moon'}"></i>
        </button>
        ${viewer ? `
          <a href="/profile/${viewer.publicId || ''}" data-link class="beta-nav-avatar" title="${escape(viewer.displayName)}">
            <i class="fas fa-user-circle"></i>
          </a>
        ` : `
          <a href="/profile" data-link class="beta-nav-login-btn">登录</a>
        `}
      </div>
    </nav>
  `;

  const betaBanner = `
    <section class="beta-home-banner">
      <div class="beta-banner-content">
        <span class="beta-banner-kicker"><i class="fas fa-circle"></i> 新版主页已上线</span>
        <h2>欢迎来到猫猫虫咖波表情包仓库</h2>
        <p>收集并分享可爱的猫猫虫咖波图片、表情包和视频内容</p>
        <div class="beta-banner-stats">
          <span><i class="fas fa-folder"></i> ${site.totalCategories || 0} 个分类</span>
          <span><i class="fas fa-images"></i> ${site.totalAssets || 0} 项内容</span>
        </div>
      </div>
    </section>
  `;

  const betaChannels = `
    <section class="beta-home-channels">
      <button type="button" class="beta-channel-item ${currentChannel === 'recommend' ? 'active' : ''}" data-beta-channel="recommend">
        <i class="fas fa-star"></i>
        <span>推荐</span>
      </button>
      <button type="button" class="beta-channel-item ${currentChannel === 'latest' ? 'active' : ''}" data-beta-channel="latest">
        <i class="fas fa-clock"></i>
        <span>最新</span>
      </button>
      <button type="button" class="beta-channel-item ${currentChannel === 'popular' ? 'active' : ''}" data-beta-channel="popular">
        <i class="fas fa-fire"></i>
        <span>热门</span>
      </button>
      <button type="button" class="beta-channel-item ${currentChannel === 'tools' ? 'active' : ''}" data-beta-channel="tools">
        <i class="fas fa-wrench"></i>
        <span>工具</span>
      </button>
      ${viewer ? `
        <a href="/dashboard" data-link class="beta-channel-item beta-dashboard-entry">
          <i class="fas fa-gauge"></i>
          <span>后台</span>
        </a>
      ` : ''}
    </section>
  `;

  const betaFolderCard = (folder) => `
    <a href="/${encodeURIComponent(folder.slug)}" data-link class="beta-folder-card">
      <div class="beta-folder-cover">
        ${betaCoverMedia(folder)}
        <div class="beta-folder-badge">${folder.coverMediaKind === 'video' ? '视频' : '图片'}</div>
      </div>
      <div class="beta-folder-info">
        <h4>${escape(folder.name)}</h4>
        <p class="beta-folder-desc">${escape(folder.description || '')}</p>
        <div class="beta-folder-meta">
          <span><i class="fas fa-eye"></i> ${Number(folder.viewCount || 0)}</span>
          <span><i class="fas fa-images"></i> ${Number(folder.count || 0)}</span>
        </div>
        <div class="beta-folder-author">${escape(folder.ownerName || '匿名用户')}</div>
      </div>
    </a>
  `;

  const isStandaloneToolHref = (href) =>
    String(href || '').startsWith('/tools/') && String(href || '').endsWith('/');

  const betaToolCard = (tool) => `
    <a href="${attr(tool.href)}"${isStandaloneToolHref(tool.href) ? '' : ' data-link'} class="beta-tool-card">
      <div class="beta-tool-icon">
        <i class="fas ${tool.icon}"></i>
      </div>
      <div class="beta-tool-info">
        <span class="beta-tool-badge">${escape(tool.badge)}</span>
        <h4>${escape(tool.title)}</h4>
        <p>${escape(tool.summary)}</p>
      </div>
    </a>
  `;

  // 根据频道显示不同内容
  let mainContent = '';

  if (currentChannel === 'tools') {
    // 工具频道
    mainContent = `
      <section class="beta-home-section">
        <div class="beta-section-head">
          <h3><i class="fas fa-wrench"></i> ${channelTitle}</h3>
        </div>
        <div class="beta-tools-grid">
          ${HOME_RECOMMEND_TOOLS.map(betaToolCard).join('')}
        </div>
      </section>
    `;
  } else {
    const displayFolders = folders.slice(0, 24);
    const showFeatured = currentChannel === 'recommend' && !state.searchQuery && featuredFolder;

    mainContent = `
      ${showFeatured ? `
        <section class="beta-home-featured">
          <a href="/${encodeURIComponent(featuredFolder.slug)}" data-link class="beta-featured-card">
            <div class="beta-featured-cover">
              ${betaCoverMedia(featuredFolder, { featured: true })}
            </div>
            <div class="beta-featured-info">
              <span class="beta-featured-badge">精选推荐</span>
              <h3>${escape(featuredFolder.name)}</h3>
              <p>${escape(featuredFolder.description || '猫猫虫咖波表情包合集')}</p>
              <div class="beta-featured-meta">
                <span><i class="fas fa-clock"></i> ${formatDate(featuredFolder.updatedAt || featuredFolder.publishedAt, true)}</span>
                <span><i class="fas fa-eye"></i> ${Number(featuredFolder.viewCount || 0)}</span>
                <span><i class="fas fa-images"></i> ${Number(featuredFolder.count || 0)}</span>
                <span><i class="fas fa-user"></i> ${escape(featuredFolder.ownerName || '匿名')}</span>
              </div>
              <span class="beta-featured-action">查看作品 <i class="fas fa-arrow-right"></i></span>
            </div>
          </a>
        </section>
      ` : ''}
      <section class="beta-home-section">
        <div class="beta-section-head">
          <h3><i class="fas ${currentChannel === 'latest' ? 'fa-clock' : currentChannel === 'popular' ? 'fa-fire' : currentChannel === 'tools' ? 'fa-wrench' : 'fa-star'}"></i> ${channelTitle}</h3>
        </div>
        <div class="beta-folder-grid">
          ${displayFolders.map(betaFolderCard).join('')}
        </div>
      </section>
    `;
  }

  const betaFooter = `
    <footer class="beta-home-footer">
      <div class="beta-footer-content">
        <p>© 2024-2026 猫猫虫咖波表情包仓库 · <a href="/site-info" data-link>站务说明</a> · <a href="/app" data-link>安卓APP</a></p>
      </div>
    </footer>
  `;

  document.getElementById('app').innerHTML = `
    ${betaNav}
    <div class="beta-home-container">
      ${betaBanner}
      ${betaChannels}
      ${mainContent}
      ${betaFooter}
    </div>
  `;

  // 绑定搜索
  const betaSearchForm = document.getElementById('beta-search-form');
  const betaSearchInput = document.getElementById('beta-search-input');
  if (betaSearchForm && betaSearchInput) {
    betaSearchForm.onsubmit = (e) => {
      e.preventDefault();
      const value = betaSearchInput.value.trim();
      state.searchDraft = value;
      state.searchQuery = value.toLowerCase();
      renderBetaHomePage();
    };

    // 监听输入框变化，如果清空则重置搜索
    betaSearchInput.oninput = (e) => {
      if (!betaSearchInput.value.trim()) {
        state.searchDraft = '';
        state.searchQuery = '';
        renderBetaHomePage();
      }
    };
  }

  // 绑定频道切换
  document.querySelectorAll('[data-beta-channel]').forEach(btn => {
    btn.onclick = () => {
      const channel = btn.dataset.betaChannel;
      state.betaChannel = channel;
      renderBetaHomePage();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
  });
}
