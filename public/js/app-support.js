export const state = {
  bootstrap: null,
  folderDetail: null,
  dashboard: null,
  reviews: null,
  users: null,
  existingFolders: null,
  announcements: null,
  siteSettings: null,
  redeemCodes: null,
  aiApiUsers: null,
  dashboardLoading: false,
  dashboardLoadErrors: {},
  profile: null,
  profileActiveTab: 'works',
  theme: localStorage.getItem('theme') || 'light',
  betaChannel: 'recommend',
  searchQuery: '',
  searchDraft: '',
  sortBy: 'published-desc',
  categorySortBy: 'name-desc',
  adminFolderSearch: '',
  adminEditingFolderId: null,
  announcementDraft: null,
  previewScrollY: 0,
  previewIndex: -1,
  commentsExpanded: false,
  recentCommentId: null,
  homeIntroDismissed: false,
  homeNoticeDismissed: false,
  homeToolsDismissed: false,
  homeRecommendDismissed: false,
  homeRestoreHintDismissed: false,
  collapsedPanels: {
    upload: true,
    mine: true,
    reviews: false,
    existingFolders: true,
    announcements: true,
    settings: true,
    redeemCodes: true,
    aiApi: true,
    users: true
  }
};

export const app = document.getElementById('app');
const confirmDialogRoot = document.getElementById('confirm-dialog-root');
const toastContainer = document.getElementById('toast-container');
export const collator = new Intl.Collator('zh-CN', { numeric: true, sensitivity: 'base' });
let homeIntroTimer = null;
let homeRestoreHintTimer = null;
let pendingConfirm = null;

export async function api(url, options = {}) {
  const method = String(options.method || 'GET').toUpperCase();
  const startedAt = performance.now();
  let status = 0;
  const headers = new Headers(options.headers || {});
  if (!(options.body instanceof FormData) && !headers.has('content-type')) headers.set('content-type', 'application/json');
  try {
    const response = await fetch(url, { ...options, headers, credentials: 'include' });
    status = response.status;
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    if (!response.ok) throw new Error(data.error || '请求失败');
    return data;
  } finally {
    const duration = Math.round(performance.now() - startedAt);
    if (location.pathname === '/dashboard' || url.includes('/api/admin/') || url.includes('/api/dashboard/')) {
      console.info('[api]', { method, url, status, durationMs: duration, dashboard: location.pathname === '/dashboard' });
    }
  }
}

export function toast(message, type = 'info') {
  const node = document.createElement('div');
  node.className = `toast ${type === 'error' ? 'error' : 'info'} show`;
  node.textContent = message;
  toastContainer.appendChild(node);
  setTimeout(() => {
    node.classList.remove('show');
    setTimeout(() => node.remove(), 240);
  }, 3200);
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const input = document.createElement('textarea');
    input.value = text;
    input.style.position = 'fixed';
    input.style.opacity = '0';
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    input.remove();
  }
}

export const shareCurrentPage = async function () {
  const url = new URL(location.href);
  if (state.folderDetail && !state.previewOpen) url.hash = '';
  const shareUrl = url.toString();
  const shareTitle = state.folderDetail?.folder?.name || document.title;
  if (navigator.share) {
    try {
      await navigator.share({ title: shareTitle, url: shareUrl });
      return;
    } catch {}
  }
  await copyText(shareUrl);
  toast('\u94fe\u63a5\u5df2\u590d\u5236');
};

export function normalize(value) { return String(value || '').trim().replace(/\s+/g, ' ').toLowerCase(); }

export function findAdminFolderById(id) { return (state.existingFolders?.folders || []).find(folder => folder.id === id) || null; }

export function roleLabel(role) { return role === 'owner' ? '\u7ad9\u957f' : role === 'admin' ? '\u7ba1\u7406\u5458' : '\u666e\u901a\u7528\u6237'; }

export function statusLabel(status) { return ({ pending_review: '\u5f85\u5ba1\u6838', pending: '\u5f85\u5904\u7406', published: '\u5df2\u516c\u5f00', rejected: '\u5df2\u9a73\u56de', offline: '\u5df2\u4e0b\u67b6', draft: '\u8349\u7a3f' })[status] || status; }

export function formatDate(value, short = false) { const d = new Date(value || Date.now()); return short ? `${d.getMonth() + 1}\u6708${d.getDate()}\u65e5\u66f4\u65b0` : d.toLocaleString('zh-CN'); }

export function escape(value) { return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;'); }

export function attr(value) { return escape(value); }

export function isAdmin() { return ['admin', 'owner'].includes(state.bootstrap?.viewer?.role); }

export function isOwner() { return state.bootstrap?.viewer?.role === 'owner'; }

export function confirmDangerAction(options = {}) {
  if (!confirmDialogRoot) return Promise.resolve(window.confirm(options.message || '确认继续吗？'));
  closeConfirmDialog(false, { silent: true });
  renderConfirmDialog({
    title: options.title || '请再确认一次',
    message: options.message || '这个操作执行后将立即生效。',
    confirmText: options.confirmText || '确认继续'
  });
  return new Promise(resolve => {
    pendingConfirm = resolve;
  });
}

export function renderConfirmDialog(options) {
  if (!confirmDialogRoot) return;
  confirmDialogRoot.innerHTML = `
    <div class="confirm-dialog-overlay" id="confirm-dialog-overlay">
      <div class="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
        <button class="modal-close confirm-dialog-close" type="button" data-confirm-close aria-label="关闭">&times;</button>
        <div class="confirm-dialog-body">
          <span class="confirm-dialog-kicker">危险操作确认</span>
          <h3 id="confirm-dialog-title">${escape(options.title)}</h3>
          <p>${escape(options.message)}</p>
          <div class="confirm-dialog-actions">
            <button class="copy-btn" type="button" data-confirm-cancel>取消</button>
            <button class="danger-btn" type="button" data-confirm-submit>${escape(options.confirmText)}</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function closeConfirmDialog(confirmed, { silent = false } = {}) {
  if (confirmDialogRoot) confirmDialogRoot.innerHTML = '';
  if (!pendingConfirm) return;
  const resolve = pendingConfirm;
  pendingConfirm = null;
  if (!silent) resolve(Boolean(confirmed));
}

export function getDeleteConfirmationOptions(url) {
  if (url.includes('/api/admin/users/')) {
    return {
      title: '确认删除这个账号？',
      message: '删除账号后，该用户将无法再登录后台。请确认这就是你要删除的账号。',
      confirmText: '确认删除账号'
    };
  }
  if (url.includes('/api/admin/folders/')) {
    return {
      title: '确认删除这个文件夹？',
      message: '删除文件夹后，文件夹和里面的全部资源都会一起删除，前台访问也会立即失效。',
      confirmText: '确认删除文件夹'
    };
  }
  if (url.includes('/api/admin/announcements/')) {
    return {
      title: '确认删除这条公告？',
      message: '删除后这条公告会立刻从后台记录中移除，无法直接恢复。',
      confirmText: '确认删除公告'
    };
  }
  return {
    title: '确认执行这个操作？',
    message: '这个操作会立即生效，请确认要继续。',
    confirmText: '确认继续'
  };
}

export function getReviewConfirmationOptions(action) {
  if (action === 'offline') {
    return {
      title: '确认下架这个文件夹？',
      message: '下架后会删除这个文件夹现有资源，前台也无法继续访问，请确认再继续。',
      confirmText: '确认下架'
    };
  }
  if (action === 'reject') {
    return {
      title: '确认驳回这次投稿？',
      message: '驳回后该文件夹会退回给投稿用户修改，审核状态会立即更新。',
      confirmText: '确认驳回'
    };
  }
  return null;
}

export function getAdminFolderSaveConfirmationOptions(currentFolder, nextValues) {
  if (!currentFolder) return null;
  if (currentFolder.slug !== nextValues.slug) {
    return {
      title: '确认修改公开路径？',
      message: '修改公开路径后，原来的文件夹地址会失效，外部已分享的链接也需要一起更新。',
      confirmText: '确认修改路径'
    };
  }
  if (currentFolder.status !== nextValues.status && ['offline', 'rejected', 'draft'].includes(nextValues.status)) {
    return {
      title: '确认调整文件夹状态？',
      message: '这个状态变更会影响文件夹和资源的公开可见性，请确认后再保存。',
      confirmText: '确认保存状态'
    };
  }
  return null;
}

export function applyTheme() {
  document.body.classList.toggle('dark-mode', state.theme === 'dark');
  const icon = document.querySelector('#theme-toggle i');
  if (icon) icon.className = `fas ${state.theme === 'dark' ? 'fa-sun' : 'fa-moon'}`;
}
