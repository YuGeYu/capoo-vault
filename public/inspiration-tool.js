const TYPE_LABELS = {
  text: '文字',
  image: '图片',
  audio: '声音',
  video: '视频'
};

export function mountInspirationTool({ root, api, toast }) {
  const state = {
    tools: [],
    category: '全部',
    query: '',
    activeId: '',
    loadingList: true,
    generating: false,
    result: null
  };

  async function init() {
    try {
      const data = await api('/api/tools/inspiration/list');
      state.tools = data.tools || [];
      state.activeId = state.tools[0]?.id || '';
    } catch (error) {
      toast(error.message || '加载失败', 'error');
    } finally {
      state.loadingList = false;
      render();
    }
  }

  function filteredTools() {
    const query = normalize(state.query);
    return state.tools.filter(tool => {
      const categoryMatched = state.category === '全部' || tool.category === state.category;
      const queryMatched = !query || normalize(`${tool.name} ${tool.description} ${tool.category}`).includes(query);
      return categoryMatched && queryMatched;
    });
  }

  function categories() {
    return ['全部', ...Array.from(new Set(state.tools.map(tool => tool.category)))];
  }

  function activeTool() {
    return state.tools.find(tool => tool.id === state.activeId) || filteredTools()[0] || state.tools[0] || null;
  }

  function render() {
    const list = filteredTools();
    const tool = activeTool();
    root.innerHTML = `
      <div class="inspiration-shell">
        <section class="inspiration-panel">
          <div class="inspiration-toolbar">
            <label class="music-search inspiration-search">
              <i class="fas fa-magnifying-glass"></i>
              <input type="search" value="${attr(state.query)}" placeholder="搜索文案、壁纸、二维码、查询">
            </label>
            <div class="music-tabs inspiration-tabs">
              ${categories().map(category => `<button type="button" class="${category === state.category ? 'is-active' : ''}" data-inspiration-category="${attr(category)}">${escapeHtml(category)}</button>`).join('')}
            </div>
          </div>
          <div class="inspiration-grid">
            ${state.loadingList ? '<p class="music-empty compact">正在整理工具...</p>' : list.map(toolCard).join('') || '<p class="music-empty compact">没有找到匹配的小功能。</p>'}
          </div>
        </section>
        <section class="inspiration-panel inspiration-workbench">
          ${tool ? renderWorkbench(tool) : '<p class="music-empty">暂时没有可用的小功能。</p>'}
        </section>
      </div>
    `;
  }

  function toolCard(tool) {
    const active = tool.id === state.activeId;
    return `
      <button class="inspiration-card ${active ? 'is-active' : ''}" type="button" data-inspiration-tool="${attr(tool.id)}">
        <span class="inspiration-card-icon"><i class="fas ${toolIcon(tool)}"></i></span>
        <span class="inspiration-card-text">
          <span class="notice-badge">${escapeHtml(tool.category)} · ${escapeHtml(TYPE_LABELS[tool.type] || '内容')}</span>
          <strong>${escapeHtml(tool.name)}</strong>
          <small>${escapeHtml(tool.description || '')}</small>
        </span>
      </button>
    `;
  }

  function renderWorkbench(tool) {
    const result = state.result;
    return `
      <div class="inspiration-workbench-head">
        <div>
          <span class="site-info-kicker">${escapeHtml(tool.category)}</span>
          <h3>${escapeHtml(tool.name)}</h3>
          <p>${escapeHtml(tool.description || '点一下即可生成内容。')}</p>
        </div>
        <span class="inspiration-type"><i class="fas ${toolIcon(tool)}"></i> ${escapeHtml(TYPE_LABELS[tool.type] || '内容')}</span>
      </div>
      <form class="inspiration-form" data-inspiration-form="${attr(tool.id)}">
        ${(tool.fields || []).map(field => `
          <label class="field">
            <span>${escapeHtml(field.label)}</span>
            <input name="${attr(field.key)}" placeholder="${attr(field.placeholder || '')}" autocomplete="off" required>
          </label>
        `).join('')}
        <button class="footer-btn" type="submit" ${state.generating ? 'disabled' : ''}>
          <i class="fas ${state.generating ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'}"></i>
          ${state.generating ? '生成中...' : '生成内容'}
        </button>
      </form>
      <div class="inspiration-result">
        ${result ? renderResult(result) : '<div class="music-empty"><i class="fas fa-sparkles"></i><p>选择一个小功能，然后点击生成。</p></div>'}
      </div>
    `;
  }

  function renderResult(result) {
    if (result.type === 'image') {
      return `
        <div class="inspiration-media-result">
          <img src="${attr(result.contentUrl)}" alt="${attr(result.name)}" loading="lazy">
          <div class="review-button-row">
            ${result.fullscreenable ? `<button class="footer-btn footer-link-btn" type="button" data-view-inspiration-image="${attr(result.contentUrl)}">全屏查看</button>` : ''}
            ${result.downloadable ? `<a class="footer-btn footer-link-btn" href="${attr(result.contentUrl)}" download="${attr(downloadName(result))}">下载图片</a>` : ''}
            ${result.openable ? `<a class="footer-btn footer-link-btn" href="${attr(result.contentUrl)}" target="_blank" rel="noreferrer">打开原图</a>` : ''}
          </div>
        </div>
      `;
    }
    if (result.type === 'audio') {
      return `<div class="inspiration-media-result"><audio controls src="${attr(result.contentUrl)}"></audio></div>`;
    }
    if (result.type === 'video') {
      return `<div class="inspiration-media-result"><video controls src="${attr(result.contentUrl)}"></video></div>`;
    }
    return `
      <article class="inspiration-text-result">
        ${formatTextResult(result)}
        <button class="copy-btn" type="button" data-copy-inspiration="${attr(result.content || '')}">复制文字</button>
      </article>
    `;
  }

  async function generate(form) {
    const id = form.getAttribute('data-inspiration-form');
    const fd = new FormData(form);
    const params = {};
    for (const [key, value] of fd.entries()) params[key] = value;

    state.generating = true;
    state.result = null;
    render();
    try {
      state.result = await api('/api/tools/inspiration/generate', {
        method: 'POST',
        body: JSON.stringify({ id, params })
      });
    } catch (error) {
      toast(error.message || '生成失败', 'error');
    } finally {
      state.generating = false;
      render();
    }
  }

  root.addEventListener('click', async event => {
    const category = event.target.closest('[data-inspiration-category]');
    if (category) {
      state.category = category.dataset.inspirationCategory;
      state.activeId = filteredTools()[0]?.id || state.tools[0]?.id || '';
      state.result = null;
      render();
      return;
    }
    const card = event.target.closest('[data-inspiration-tool]');
    if (card) {
      state.activeId = card.dataset.inspirationTool;
      state.result = null;
      render();
      return;
    }
    const copy = event.target.closest('[data-copy-inspiration]');
    if (copy) {
      await navigator.clipboard.writeText(copy.dataset.copyInspiration || '');
      toast('已复制');
    }
    const image = event.target.closest('[data-view-inspiration-image]');
    if (image) {
      openImageViewer(image.dataset.viewInspirationImage || '');
    }
  });

  root.addEventListener('input', event => {
    if (!event.target.matches('.inspiration-search input')) return;
    state.query = event.target.value;
    state.activeId = filteredTools()[0]?.id || state.tools[0]?.id || '';
    render();
  });

  root.addEventListener('submit', event => {
    const form = event.target.closest('[data-inspiration-form]');
    if (!form) return;
    event.preventDefault();
    generate(form);
  });

  render();
  init();
}

function formatTextResult(result) {
  const content = String(result.content || '这次没有生成文字，请再试一次。');
  const rankLines = content.split(/\n|\\r|\\n|\r/).map(line => line.trim()).filter(Boolean);
  if (result.id === 'gpu-rank' && rankLines.length > 1) {
    const title = rankLines[0].replace(/排行榜$/, '排行榜');
    const rows = rankLines.slice(1).map(line => {
      const match = line.match(/^(\d+)\s*[:：]\s*(.+)$/);
      if (!match) return `<li><span></span><strong>${escapeHtml(line)}</strong></li>`;
      return `<li><span>${escapeHtml(match[1])}</span><strong>${escapeHtml(match[2])}</strong></li>`;
    }).join('');
    return `<div class="inspiration-rank-result"><h4>${escapeHtml(title)}</h4><ol>${rows}</ol></div>`;
  }
  return `<p>${escapeHtml(content)}</p>`;
}

function openImageViewer(src) {
  if (!src) return;
  const old = document.getElementById('inspiration-image-viewer');
  if (old) old.remove();
  const node = document.createElement('div');
  node.id = 'inspiration-image-viewer';
  node.className = 'inspiration-image-viewer';
  node.innerHTML = `
    <button type="button" class="inspiration-image-viewer-close" aria-label="关闭"><i class="fas fa-xmark"></i></button>
    <img src="${attr(src)}" alt="全屏查看">
  `;
  node.addEventListener('click', event => {
    if (event.target === node || event.target.closest('.inspiration-image-viewer-close')) node.remove();
  });
  document.body.appendChild(node);
}

function downloadName(result) {
  const base = result.id === 'meme-search' ? 'maomaochong-meme' : 'maomaochong-wallpaper';
  return `${base}.jpg`;
}

function toolIcon(tool) {
  if (tool.id === 'qrcode') return 'fa-qrcode';
  if (tool.type === 'image') return 'fa-image';
  if (tool.type === 'audio') return 'fa-volume-high';
  if (tool.type === 'video') return 'fa-video';
  if (tool.category === '生活小帮手') return 'fa-compass';
  return 'fa-feather';
}

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function escapeHtml(value) {
  return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

function attr(value) {
  return escapeHtml(value);
}
