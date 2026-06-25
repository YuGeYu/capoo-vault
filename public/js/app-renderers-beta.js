import { state, escape, attr, formatDate } from './app-support.js';
import { visibleFolders } from './app-renderers.js';

export function renderBetaHomePage() {
  const site = state.bootstrap?.site || {};
  const folders = visibleFolders();
  const viewer = state.bootstrap?.viewer;

  // 推荐分组
  const latestFolders = folders.slice(0, 12);
  const popularFolders = [...folders].sort((a, b) => Number(b.viewCount || 0) - Number(a.viewCount || 0)).slice(0, 8);
  const featuredFolder = folders[0];

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
          ${viewer ? `<a href="/dashboard" data-link class="beta-nav-link">个人中心</a>` : ''}
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
          <a href="/dashboard" data-link class="beta-nav-avatar" title="${escape(viewer.displayName)}">
            <i class="fas fa-user-circle"></i>
          </a>
        ` : `
          <a href="/dashboard" data-link class="beta-nav-login-btn">登录</a>
        `}
        <button class="beta-nav-icon-btn" data-switch-to-classic title="返回旧版">
          <i class="fas fa-rotate-left"></i>
        </button>
      </div>
    </nav>
  `;

  const betaBanner = `
    <section class="beta-home-banner">
      <div class="beta-banner-content">
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
      <div class="beta-channel-item active" data-beta-channel="recommend">
        <i class="fas fa-star"></i>
        <span>推荐</span>
      </div>
      <div class="beta-channel-item" data-beta-channel="latest">
        <i class="fas fa-clock"></i>
        <span>最新</span>
      </div>
      <div class="beta-channel-item" data-beta-channel="popular">
        <i class="fas fa-fire"></i>
        <span>热门</span>
      </div>
      <div class="beta-channel-item" data-beta-channel="tools">
        <i class="fas fa-wrench"></i>
        <span>工具</span>
      </div>
      ${viewer ? `
        <div class="beta-channel-item" data-beta-channel="mine">
          <i class="fas fa-heart"></i>
          <span>我的</span>
        </div>
      ` : ''}
    </section>
  `;

  const betaFeatured = featuredFolder ? `
    <section class="beta-home-featured">
      <a href="/${encodeURIComponent(featuredFolder.slug)}" data-link class="beta-featured-card">
        <div class="beta-featured-cover">
          ${featuredFolder.coverUrl ? `<img src="${attr(featuredFolder.coverUrl)}" alt="${attr(featuredFolder.name)}" loading="lazy">` : '<div class="beta-featured-placeholder">暂无封面</div>'}
        </div>
        <div class="beta-featured-info">
          <span class="beta-featured-badge">精选推荐</span>
          <h3>${escape(featuredFolder.name)}</h3>
          <p>${escape(featuredFolder.description || '猫猫虫咖波表情包合集')}</p>
          <div class="beta-featured-meta">
            <span><i class="fas fa-eye"></i> ${Number(featuredFolder.viewCount || 0)}</span>
            <span><i class="fas fa-images"></i> ${Number(featuredFolder.count || 0)}</span>
            <span><i class="fas fa-user"></i> ${escape(featuredFolder.ownerName || '匿名')}</span>
          </div>
        </div>
      </a>
    </section>
  ` : '';

  const betaFolderCard = (folder) => `
    <a href="/${encodeURIComponent(folder.slug)}" data-link class="beta-folder-card">
      <div class="beta-folder-cover">
        ${folder.coverUrl ? `<img src="${attr(folder.coverUrl)}" alt="${attr(folder.name)}" loading="lazy">` : '<div class="beta-folder-placeholder">暂无封面</div>'}
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

  const betaRecommendSection = `
    <section class="beta-home-section">
      <div class="beta-section-head">
        <h3><i class="fas fa-fire"></i> 今日推荐</h3>
        <a href="/" data-link>查看更多 <i class="fas fa-arrow-right"></i></a>
      </div>
      <div class="beta-folder-grid">
        ${latestFolders.slice(0, 8).map(betaFolderCard).join('')}
      </div>
    </section>
  `;

  const betaLatestSection = `
    <section class="beta-home-section">
      <div class="beta-section-head">
        <h3><i class="fas fa-clock"></i> 最新发布</h3>
        <a href="/" data-link>查看更多 <i class="fas fa-arrow-right"></i></a>
      </div>
      <div class="beta-folder-grid">
        ${latestFolders.slice(0, 8).map(betaFolderCard).join('')}
      </div>
    </section>
  `;

  const betaPopularSection = `
    <section class="beta-home-section">
      <div class="beta-section-head">
        <h3><i class="fas fa-chart-line"></i> 浏览最多</h3>
        <a href="/" data-link>查看更多 <i class="fas fa-arrow-right"></i></a>
      </div>
      <div class="beta-folder-grid">
        ${popularFolders.map(betaFolderCard).join('')}
      </div>
    </section>
  `;

  const betaFooter = `
    <footer class="beta-home-footer">
      <div class="beta-footer-content">
        <p>© 2024-2026 猫猫虫咖波表情包仓库 · <a href="/site-info" data-link>站务说明</a></p>
        <p class="beta-footer-hint">
          <i class="fas fa-flask"></i> 您正在使用新版首页内测 ·
          <button class="beta-footer-link" data-switch-to-classic>返回旧版</button>
        </p>
      </div>
    </footer>
  `;

  document.getElementById('app').innerHTML = `
    ${betaNav}
    <div class="beta-home-container">
      ${betaBanner}
      ${betaChannels}
      ${betaFeatured}
      ${betaRecommendSection}
      ${betaLatestSection}
      ${betaPopularSection}
      ${betaFooter}
    </div>
  `;

  // 绑定搜索
  const betaSearchForm = document.getElementById('beta-search-form');
  const betaSearchInput = document.getElementById('beta-search-input');
  if (betaSearchForm && betaSearchInput) {
    betaSearchForm.onsubmit = (e) => {
      e.preventDefault();
      state.searchDraft = betaSearchInput.value;
      state.searchQuery = betaSearchInput.value.trim().toLowerCase();
      renderBetaHomePage();
    };
  }
}
