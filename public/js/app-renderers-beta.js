import { state, escape, attr, formatDate } from './app-support.js';
import { visibleFolders, HOME_RECOMMEND_TOOLS } from './app-renderers.js';

export function renderBetaHomePage() {
  const site = state.bootstrap?.site || {};
  const allFolders = visibleFolders();
  const viewer = state.bootstrap?.viewer;

  // 获取当前频道，默认为推荐
  const currentChannel = state.betaChannel || 'recommend';

  // 根据频道过滤和排序
  let folders = [...allFolders];
  let channelTitle = '推荐';

  if (currentChannel === 'latest') {
    channelTitle = '最新发布';
    // 已经按发布时间排序
  } else if (currentChannel === 'popular') {
    channelTitle = '浏览最多';
    folders = folders.sort((a, b) => Number(b.viewCount || 0) - Number(a.viewCount || 0));
  } else if (currentChannel === 'tools') {
    channelTitle = '站内工具';
  } else {
    channelTitle = '推荐';
  }

  // 推荐分组
  const featuredFolder = allFolders[0];

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
          <a href="/app" data-link class="beta-nav-link">APP</a>
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

  const betaToolCard = (tool) => `
    <a href="${attr(tool.href)}" data-link class="beta-tool-card">
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
    // 推荐、最新、热门频道
    const displayFolders = folders.slice(0, 24);
    const showFeatured = currentChannel === 'recommend' && featuredFolder;

    mainContent = `
      ${showFeatured ? `
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
      ` : ''}
      <section class="beta-home-section">
        <div class="beta-section-head">
          <h3><i class="fas ${currentChannel === 'latest' ? 'fa-clock' : currentChannel === 'popular' ? 'fa-fire' : 'fa-star'}"></i> ${channelTitle}</h3>
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
