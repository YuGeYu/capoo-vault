const ORT_CDN_URL = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.24.3/dist/ort.min.js';
const ORT_WASM_BASE = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.24.3/dist/';
const REMBG_CDN_URL = 'https://unpkg.com/@bunnio/rembg-web@1.0.2/dist/index.umd.min.js';

export function mountRembgTool({ root, toast, api, viewer }) {
  if (!root) return () => {};

  const request = typeof api === 'function' ? api : defaultApi;
  const state = {
    file: null,
    sourceUrl: '',
    resultUrl: '',
    sourceObjectUrl: '',
    resultObjectUrl: '',
    session: null,
    loadingRuntime: false,
    processing: false,
    progress: 0,
    status: '等待选择图片',
    runtimeReady: false,
    dimensions: '',
    cleanupRequested: false,
    loadingAccess: true,
    downloading: false,
    creatingOrder: false,
    redeemingCode: false,
    access: normalizeAccess(viewer?.removeBg, viewer)
  };

  render();
  bindEvents();
  refreshAccess().catch(handleError);

  return () => {
    state.cleanupRequested = true;
    disposeObjectUrls();
  };

  function bindEvents() {
    root.addEventListener('change', onChange);
    root.addEventListener('click', onClick);
  }

  function onChange(event) {
    if (!event.target.matches('#rembg-file-input')) return;
    handleFileChange(event.target.files?.[0] || null).catch(handleError);
  }

  function onClick(event) {
    const action = event.target.closest('[data-rembg-action]')?.dataset.rembgAction;
    if (!action) return;

    if (action === 'process') return void processImage().catch(handleError);
    if (action === 'download') return void handleDownload().catch(handleError);
    if (action === 'buy-member') return void openMemberShop().catch(handleError);
    if (action === 'redeem-code') return void redeemMemberCode().catch(handleError);
    if (action === 'refresh-access') return void refreshAccess().catch(handleError);
    if (action === 'reset') return void resetState();
  }

  async function refreshAccess() {
    state.loadingAccess = true;
    render();
    const result = await request('/api/tools/remove-bg/access');
    state.access = normalizeAccess(result?.removeBg, result?.viewer || viewer);
    state.loadingAccess = false;
    render();
  }

  async function handleFileChange(file) {
    clearResult();
    state.file = file;
    state.dimensions = '';

    if (!file) {
      state.status = '等待选择图片';
      state.progress = 0;
      render();
      return;
    }

    if (!file.type.startsWith('image/')) {
      throw new Error('请上传 JPG、PNG、WebP 等图片文件');
    }

    if (state.sourceObjectUrl) {
      URL.revokeObjectURL(state.sourceObjectUrl);
    }

    state.sourceObjectUrl = URL.createObjectURL(file);
    state.sourceUrl = state.sourceObjectUrl;
    state.status = '图片已载入，可以开始处理';
    state.progress = 0;
    state.dimensions = await readImageDimensions(state.sourceUrl);

    if (file.size > 8 * 1024 * 1024) {
      toast('这张图片超过 8MB，处理时间可能会更久', 'info');
    }

    render();
  }

  async function processImage() {
    if (!state.file || state.processing) return;

    state.processing = true;
    state.progress = 2;
    state.status = '正在准备处理环境';
    render();

    await ensureRuntime();

    state.status = '正在初始化模型';
    state.progress = 12;
    render();

    const rembg = getRembgRuntime();
    state.session ||= await rembg.newSession('u2netp', undefined, {
      onProgress: info => {
        state.status = `模型准备中：${info.message || info.step}`;
        state.progress = clampProgress(12 + Math.round((Number(info.progress) || 0) * 0.18));
        render();
      }
    });

    const resultBlob = await rembg.remove(state.file, {
      session: state.session,
      postProcessMask: true,
      onProgress: info => {
        state.status = formatProgress(info);
        state.progress = mapRemoveProgress(info);
        render();
      }
    });

    if (state.cleanupRequested) return;

    if (state.resultObjectUrl) {
      URL.revokeObjectURL(state.resultObjectUrl);
    }

    state.resultObjectUrl = URL.createObjectURL(resultBlob);
    state.resultUrl = state.resultObjectUrl;
    state.processing = false;
    state.progress = 100;
    state.status = '处理完成，可以下载透明 PNG';
    render();
    toast('处理完成，可以直接下载结果', 'info');
  }

  async function ensureRuntime() {
    if (state.runtimeReady) return;
    if (state.loadingRuntime) {
      while (state.loadingRuntime) {
        await wait(80);
      }
      return;
    }

    state.loadingRuntime = true;
    render();

    try {
      await loadScript(ORT_CDN_URL, ['ort']);
      if (window.ort?.env?.wasm) {
        window.ort.env.wasm.wasmPaths = ORT_WASM_BASE;
      }

      await loadScript(REMBG_CDN_URL, ['RembgWeb', 'rembgWeb']);
      const rembg = getRembgRuntime();
      window.rembgWeb = rembg;
      rembg.rembgConfig.setCustomModelPath('u2netp', '/models/u2netp.onnx');
      state.runtimeReady = true;
    } finally {
      state.loadingRuntime = false;
      render();
    }
  }

  async function handleDownload() {
    if (!state.resultUrl || state.downloading) return;

    if (!state.access.isLoggedIn) {
      throw new Error('登录后才能下载抠图结果');
    }

    if (!state.access.canDownload) {
      throw new Error('今天的下载额度已用完，但仍然可以继续预览抠图效果');
    }

    state.downloading = true;
    render();

    try {
      const result = await request('/api/tools/remove-bg/download', {
        method: 'POST',
        body: JSON.stringify({})
      });
      state.access = normalizeAccess(result?.removeBg, viewer);
      downloadResult();
      toast(result?.message || '文件已开始下载', 'info');
    } finally {
      state.downloading = false;
      render();
    }
  }

  async function openMemberShop() {
    if (!state.access.isLoggedIn) {
      throw new Error('请先登录，再购买抠图会员月卡。');
    }
    const shopUrl = state.access.billing?.shopUrl || 'https://pay.ldxp.cn/shop/lbtvjbtv';
    window.open(shopUrl, '_blank', 'noopener,noreferrer');
    toast('店铺已在新标签页打开，购买后回到这里填写兑换码。', 'info');
  }

  async function redeemMemberCode() {
    if (state.redeemingCode) return;
    if (!state.access.isLoggedIn) {
      throw new Error('请先登录，再兑换抠图会员月卡。');
    }

    const input = root.querySelector('#rembg-redeem-code');
    const code = String(input?.value || '').trim();
    if (!code) {
      throw new Error('请输入兑换码。');
    }

    state.redeemingCode = true;
    render();

    try {
      const result = await request('/api/tools/remove-bg/redeem', {
        method: 'POST',
        body: JSON.stringify({ code })
      });
      state.access = normalizeAccess(result?.removeBg, viewer);
      if (input) input.value = '';
      toast(result?.message || '兑换成功，会员状态已更新。', 'info');
    } finally {
      state.redeemingCode = false;
      render();
    }
  }

  function downloadResult() {
    if (!state.resultUrl) return;

    const link = document.createElement('a');
    const fileName = (state.file?.name || 'remove-bg').replace(/\.[^.]+$/, '');
    link.href = state.resultUrl;
    link.download = `${fileName}-transparent.png`;
    link.click();
  }

  function resetState() {
    disposeObjectUrls();
    state.file = null;
    state.sourceUrl = '';
    state.resultUrl = '';
    state.sourceObjectUrl = '';
    state.resultObjectUrl = '';
    state.progress = 0;
    state.status = '等待选择图片';
    state.dimensions = '';
    state.processing = false;

    const input = root.querySelector('#rembg-file-input');
    if (input) input.value = '';

    render();
  }

  function clearResult() {
    if (state.resultObjectUrl) {
      URL.revokeObjectURL(state.resultObjectUrl);
    }
    state.resultUrl = '';
    state.resultObjectUrl = '';
    state.processing = false;
  }

  function disposeObjectUrls() {
    if (state.sourceObjectUrl) URL.revokeObjectURL(state.sourceObjectUrl);
    if (state.resultObjectUrl) URL.revokeObjectURL(state.resultObjectUrl);
  }

  function handleError(error) {
    console.error(error);
    state.processing = false;
    state.downloading = false;
    state.creatingOrder = false;
    state.redeemingCode = false;
    state.loadingAccess = false;
    state.status = error?.message || '处理失败，请稍后再试';
    render();
    toast(state.status, 'error');
  }

  function render() {
    const hasFile = Boolean(state.file);
    const hasResult = Boolean(state.resultUrl);
    const downloadDisabled = !hasResult || state.loadingAccess || state.downloading || !state.access.isLoggedIn || !state.access.canDownload;
    const canBuy = state.access.isLoggedIn;

    root.innerHTML = `
      <section class="rembg-layout">
        <article class="rembg-panel rembg-panel-primary">
          <div class="rembg-panel-head">
            <div>
              <span class="notice-badge">AI 抠图</span>
              <h3>上传图片，一键去背景</h3>
            </div>
          </div>

          ${accessCard(state.access, state.loadingAccess, canBuy, state.creatingOrder, state.redeemingCode)}

          <div class="rembg-upload-card">
            <label class="rembg-dropzone" for="rembg-file-input">
              <input id="rembg-file-input" type="file" accept="image/png,image/jpeg,image/webp,image/gif">
              <span class="rembg-dropzone-title">${hasFile ? escapeHtml(state.file.name) : '选择一张本地图片'}</span>
              <span class="rembg-dropzone-subtitle">支持 JPG、PNG、WebP、GIF，推荐单张图片不超过 8MB</span>
            </label>

            <div class="rembg-meta-row">
              <span>${state.dimensions || '尺寸：待读取'}</span>
              <span>${hasFile ? formatFileSize(state.file.size) : '文件：未选择'}</span>
            </div>

            <div class="rembg-action-row">
              <button class="footer-btn" type="button" data-rembg-action="process" ${hasFile ? '' : 'disabled'}>${state.processing ? '处理中...' : '开始处理'}</button>
              <button class="copy-btn rembg-secondary-btn" type="button" data-rembg-action="reset">重新选择</button>
            </div>

            <div class="rembg-progress-card">
              <div class="rembg-progress-head">
                <strong>${escapeHtml(state.status)}</strong>
                <span>${state.loadingRuntime || state.processing || hasResult ? `${state.progress}%` : '未开始'}</span>
              </div>
              <div class="rembg-progress-track"><span style="width:${state.progress}%"></span></div>
              <p class="small">抠图处理始终在当前浏览器内完成。即使今日下载额度用完，你也仍然可以继续查看抠图效果。</p>
            </div>
          </div>
        </article>

        <div class="rembg-preview-grid">
          ${previewCard('原图预览', state.sourceUrl, !hasFile, '选择图片后这里会显示原图')}
          ${resultCard(state.resultUrl, hasResult, hasFile, downloadDisabled, downloadButtonLabel(state, hasResult))}
        </div>
      </section>
    `;
  }
}

function accessCard(access, loadingAccess, canBuy, creatingOrder, redeemingCode = false) {
  if (loadingAccess) {
    return `
      <div class="rembg-access-card">
        <div class="rembg-access-head">
          <strong>正在读取下载权限</strong>
        </div>
        <p class="small">正在同步今日可下载次数...</p>
      </div>
    `;
  }

  const billing = access.billing || {
    price: '6.00',
    durationDays: 30,
    shopUrl: 'https://pay.ldxp.cn/shop/lbtvjbtv'
  };

  if (!access.isLoggedIn) {
    return `
      <div class="rembg-access-card">
        <div class="rembg-access-head">
          <strong>游客模式</strong>
          <span class="notice-badge">仅预览</span>
        </div>
        <p class="small">未登录时可以无限次查看抠图效果，但不能下载结果。</p>
        <div class="rembg-quota-grid">
          <div class="rembg-quota-item"><span>普通用户</span><strong>10 次 / 日下载</strong></div>
          <div class="rembg-quota-item"><span>抠图会员</span><strong>10000 次 / 日下载</strong></div>
        </div>
      </div>
    `;
  }

  const tierText = access.membershipActive ? '抠图会员' : '普通用户';
  const quotaText = access.canDownload
    ? `今日还可下载 ${access.downloadsRemaining} 次`
    : '今日下载额度已用完，仍可继续预览效果';

  return `
    <div class="rembg-access-card">
      <div class="rembg-access-head">
        <strong>${tierText}</strong>
        <span class="notice-badge">${access.dailyLimit} 次 / 日</span>
      </div>
      <div class="rembg-quota-grid">
        <div class="rembg-quota-item"><span>今日已下载</span><strong>${access.downloadsUsed}</strong></div>
        <div class="rembg-quota-item"><span>今日剩余</span><strong>${access.downloadsRemaining}</strong></div>
      </div>
      <p class="small">${quotaText}</p>
      <div class="rembg-member-cta">
        <div>
          <strong>抠图会员月卡</strong>
          <p class="small">￥${billing.price} / ${billing.durationDays} 天。新标签页进入店铺购买兑换码，回到这里兑换后提升到 10000 次 / 日下载额度。</p>
        </div>
        <div class="rembg-member-actions">
          <button class="footer-btn" type="button" data-rembg-action="buy-member" ${canBuy ? '' : 'disabled'}>${access.membershipActive ? '购买续费兑换码' : '购买抠图会员兑换码'}</button>
          <button class="copy-btn rembg-secondary-btn" type="button" data-rembg-action="refresh-access">刷新会员状态</button>
        </div>
      </div>
      <div class="rembg-redeem-row">
        <input id="rembg-redeem-code" type="text" autocomplete="off" placeholder="输入兑换码">
        <button class="footer-btn footer-btn-small" type="button" data-rembg-action="redeem-code" ${canBuy && !redeemingCode ? '' : 'disabled'}>${redeemingCode ? '正在兑换...' : '兑换月卡'}</button>
      </div>
    </div>
  `;
}

function previewCard(title, imageUrl, empty, emptyText) {
  return `
    <article class="rembg-panel rembg-preview-card">
      <div class="rembg-panel-head">
        <div><h3>${title}</h3></div>
      </div>
      <div class="rembg-preview-stage ${empty ? 'is-empty' : ''}">
        ${empty ? `<p>${emptyText}</p>` : `<div class="rembg-checkerboard"><img src="${imageUrl}" alt="${title}"></div>`}
      </div>
    </article>
  `;
}

function resultCard(imageUrl, hasResult, hasFile, downloadDisabled, buttonText) {
  return `
    <article class="rembg-panel rembg-preview-card rembg-result-card">
      <div class="rembg-panel-head">
        <div><h3>去背景结果</h3></div>
      </div>
      <div class="rembg-preview-stage ${hasResult ? '' : 'is-empty'}">
        ${hasResult ? `<div class="rembg-checkerboard"><img src="${imageUrl}" alt="去背景结果"></div>` : `<p>${hasFile ? '处理完成后这里会显示透明背景 PNG' : '先上传图片再开始处理'}</p>`}
      </div>
      <div class="rembg-result-actions">
        <button class="rembg-download-btn" type="button" data-rembg-action="download" ${downloadDisabled ? 'disabled' : ''}>${buttonText}</button>
      </div>
    </article>
  `;
}

function downloadButtonLabel(state, hasResult) {
  if (!hasResult) return '下载去背景结果 PNG';
  if (state.downloading) return '正在校验并下载...';
  if (state.loadingAccess) return '正在读取权限...';
  if (!state.access.isLoggedIn) return '登录后可下载结果';
  if (!state.access.canDownload) return '今日下载额度已用完';
  return '下载去背景结果 PNG';
}

function normalizeAccess(access, viewer) {
  if (access) return access;
  return {
    isLoggedIn: Boolean(viewer),
    membershipActive: false,
    membershipPlan: viewer ? 'free' : 'guest',
    membershipLabel: viewer ? 'free' : 'guest',
    dailyLimit: viewer ? 10 : 0,
    downloadsUsed: 0,
    downloadsRemaining: viewer ? 10 : 0,
    canDownload: Boolean(viewer),
    usageDate: '',
    resetAt: '',
    previewUnlimited: true,
    billing: {
      price: '6.00',
      durationDays: 30,
      shopUrl: 'https://pay.ldxp.cn/shop/lbtvjbtv'
    }
  };
}

async function defaultApi(url, options = {}) {
  const headers = new Headers(options.headers || {});
  if (!(options.body instanceof FormData) && !headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }

  const response = await fetch(url, { ...options, headers, credentials: 'include' });
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) {
    throw new Error(data.error || '请求失败');
  }
  return data;
}

function loadScript(src, globalNames) {
  const names = Array.isArray(globalNames) ? globalNames : [globalNames];
  const existingGlobal = names.find(name => window[name]);
  if (existingGlobal) {
    return Promise.resolve(window[existingGlobal]);
  }

  const existingScript = document.querySelector(`script[data-runtime="${src}"]`);
  if (existingScript) {
    return waitForGlobal(names);
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.dataset.runtime = src;
    script.onload = () => waitForGlobal(names).then(resolve).catch(reject);
    script.onerror = () => reject(new Error(`加载运行时失败：${src}`));
    document.head.appendChild(script);
  });
}

async function waitForGlobal(globalNames) {
  const names = Array.isArray(globalNames) ? globalNames : [globalNames];
  for (let index = 0; index < 100; index += 1) {
    const resolved = names.find(name => window[name]);
    if (resolved) return window[resolved];
    await wait(50);
  }
  throw new Error(`运行时未正确暴露：${names.join(', ')}`);
}

function getRembgRuntime() {
  return window.RembgWeb || window.rembgWeb;
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function formatProgress(info = {}) {
  if (info.message) return info.message;

  const labels = {
    downloading: '正在下载模型',
    processing: '正在执行处理',
    postprocessing: '正在整理边缘',
    complete: '处理完成'
  };

  return labels[info.step] || '正在处理';
}

function mapRemoveProgress(info = {}) {
  const progress = Number(info.progress) || 0;
  if (info.step === 'downloading') return clampProgress(15 + Math.round(progress * 0.3));
  if (info.step === 'processing') return clampProgress(45 + Math.round(progress * 0.35));
  if (info.step === 'postprocessing') return clampProgress(80 + Math.round(progress * 0.18));
  if (info.step === 'complete') return 100;
  return clampProgress(progress);
}

function clampProgress(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function readImageDimensions(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(`尺寸：${image.width} × ${image.height}`);
    image.onerror = () => reject(new Error('读取图片尺寸失败'));
    image.src = url;
  });
}

function formatFileSize(size) {
  if (!Number.isFinite(size)) return '文件：未知';
  if (size < 1024 * 1024) return `文件：${(size / 1024).toFixed(1)} KB`;
  return `文件：${(size / (1024 * 1024)).toFixed(2)} MB`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
