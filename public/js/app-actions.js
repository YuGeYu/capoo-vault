import { state, api, toast, copyText, shareCurrentPage, applyTheme, normalize, findAdminFolderById, confirmDangerAction, closeConfirmDialog, getDeleteConfirmationOptions, getReviewConfirmationOptions, getAdminFolderSaveConfirmationOptions, isAdmin, isOwner } from './app-support.js';

import { renderHomePage, renderSiteInfoPage, renderRemoveBgPage, renderAiChatPage, renderAiApiPage, renderMusicPage, renderInspirationPage, renderLinkMatchPage, renderToolsListPage, renderDashboardPage, renderAuthPage, renderMessagePage, renderFolderPage, renderProfileEntryPage, renderProfilePage, openPreview, closeModal, restoreHomePanels, dismissHomeNotice, dismissHomeTools, showHomeNotice, showHomeTools, dismissHomeRecommendation, dismissHomeRecommendationsForToday, applyHomeSearch } from './app-renderers.js';

export async function boot() {
  bindEvents();
  await refreshBootstrap();
  await route();
  applyTheme();
}

export function bindEvents() {
  window.addEventListener('popstate', () => {
    if (state.previewOpen) {
      closeModal(true);
      return;
    }
    route().catch(console.error);
  });
  document.addEventListener('click', onClick);
  document.addEventListener('submit', onSubmit);
  document.addEventListener('input', onInput);
  document.addEventListener('change', onChange);
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    closeConfirmDialog(false);
    closeModal();
  });
}

export async function route() {
  const path = decodeURIComponent(location.pathname);
  closeModal();
  if (path === '/site-info') return renderSiteInfoPage();
  if (path === '/dashboard') return renderDashboardPage();
  if (path === '/profile') return renderProfileEntryPage();
  const profileMatch = path.match(/^\/profile\/(\d+)$/);
  if (profileMatch) {
    state.profile = await api(`/api/profile/${profileMatch[1]}`);
    return renderProfilePage();
  }
  if (path === '/tools/remove-bg') return renderRemoveBgPage();
  if (path === '/tools/ai-chat') return renderAiChatPage();
  if (path === '/tools/ai-api') return renderAiApiPage();
  if (path === '/tools/music') return renderMusicPage();
  if (path === '/tools/inspiration') return renderInspirationPage();
  if (path === '/tools/link-match') return renderLinkMatchPage();
  if (path === '/tools/list') return renderToolsListPage();
  if (path !== '/' && !path.startsWith('/media/')) {
    try {
      state.folderDetail = await api(`/api/public/folders/${encodeURIComponent(path.slice(1))}`);
      return renderFolderPage();
    } catch (error) {
      return renderMessagePage('这个分类暂时打不开', error.message);
    }
  }
  renderHomePage();
}

export async function refreshBootstrap() {
  state.bootstrap = await api('/api/bootstrap');
}

export async function loadDashboardData() {
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

export function onClick(event) {
  const homeLink = event.target.closest('[data-home-link]');
  if (homeLink) {
    event.preventDefault();
    closeModal(true);
    history.pushState({}, '', '/');
    route().catch(console.error);
    return;
  }
  const searchSubmit = event.target.closest('[data-home-search-submit]');
  if (searchSubmit) {
    event.preventDefault();
    const form = searchSubmit.closest('form') || document.getElementById('search-form');
    if (form) return onSearchSubmit(form);
  }
  const link = event.target.closest('[data-link]');
  if (link) {
    event.preventDefault();
    history.pushState({}, '', link.getAttribute('href'));
    route().catch(console.error);
    return;
  }
  if (event.target.closest('#theme-toggle')) {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', state.theme);
    applyTheme();
    return;
  }
  if (event.target.closest('[data-clear-search]')) return clearSearch();
  if (event.target.closest('[data-profile-tab]')) return onProfileTab(event.target.closest('[data-profile-tab]').dataset.profileTab);
  if (event.target.closest('[data-export-profile]')) return onExportProfile();
  if (event.target.closest('[data-favorite-folder]')) {
    event.preventDefault();
    event.stopPropagation();
    return onToggleFavorite(event.target.closest('[data-favorite-folder]'));
  }
  if (event.target.closest('[data-like-folder]')) {
    event.preventDefault();
    event.stopPropagation();
    return onToggleFolderLike(event.target.closest('[data-like-folder]'));
  }
  if (event.target.closest('[data-follow-user]')) {
    event.preventDefault();
    event.stopPropagation();
    return onToggleFollowUser(event.target.closest('[data-follow-user]'));
  }
  if (event.target.closest('[data-scroll-comments]')) {
    event.preventDefault();
    document.getElementById('folder-comments')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }
  if (event.target.closest('[data-delete-comment]')) {
    event.preventDefault();
    return onDeleteComment(event.target.closest('[data-delete-comment]').dataset.deleteComment);
  }
  if (event.target.closest('#logout-btn')) return onLogout();
  if (event.target.closest('#modal-close')) return closeModal();
  if (event.target.id === 'image-modal') return closeModal();
  if (event.target.closest('[data-confirm-close]')) return closeConfirmDialog(false);
  if (event.target.closest('[data-confirm-cancel]')) return closeConfirmDialog(false);
  if (event.target.closest('[data-confirm-submit]')) return closeConfirmDialog(true);
  if (event.target.id === 'confirm-dialog-overlay') return closeConfirmDialog(false);
  const preview = event.target.closest('[data-preview]');
  if (preview) return openPreview(Number(preview.dataset.preview || 0));
  const toggleShareButton = event.target.closest('[data-toggle-page-share]');
  if (toggleShareButton) {
    const panel = document.getElementById('page-share-panel');
    if (panel) panel.classList.toggle('hidden');
    return;
  }
  const sharePageButton = event.target.closest('[data-share-page]');
  if (sharePageButton) return shareCurrentPage();
  if (event.target.closest('[data-home-restore]')) {
    event.preventDefault();
    return restoreHomePanels();
  }
  if (event.target.closest('[data-close-home-notice]')) {
    event.preventDefault();
    return dismissHomeNotice();
  }
  if (event.target.closest('[data-close-home-tools]')) {
    event.preventDefault();
    return dismissHomeTools();
  }
  if (event.target.closest('[data-home-show-notice]')) {
    event.preventDefault();
    return showHomeNotice();
  }
  if (event.target.closest('[data-home-show-tools]')) {
    event.preventDefault();
    return showHomeTools();
  }
  if (event.target.closest('[data-close-home-recommend]')) {
    event.preventDefault();
    return dismissHomeRecommendation();
  }
  const copy = event.target.closest('[data-copy-url]');
  if (copy) return copyText(copy.dataset.copyUrl || '').then(() => toast('链接已复制'));
  const review = event.target.closest('[data-review-action]');
  if (review) return onReview(review);
  const roleUser = event.target.closest('[data-role-user]');
  if (roleUser) return onRole(roleUser.dataset.roleUser, 'user');
  const roleAdmin = event.target.closest('[data-role-admin]');
  if (roleAdmin) return onRole(roleAdmin.dataset.roleAdmin, 'admin');
  const delUser = event.target.closest('[data-delete-user]');
  if (delUser) return onDelete(`/api/admin/users/${delUser.dataset.deleteUser}`, '账号已删除', true);
  const delFolder = event.target.closest('[data-delete-folder]');
  if (delFolder) return onDelete(`/api/admin/folders/${delFolder.dataset.deleteFolder}`, '鏂囦欢澶瑰凡鍒犻櫎', true);
  const delAsset = event.target.closest('[data-delete-asset]');
  if (delAsset) return onDeleteAsset(delAsset.dataset.folderId, delAsset.dataset.deleteAsset, delAsset.dataset.manageMode || 'owner');
  const editFolder = event.target.closest('[data-edit-folder]');
  if (editFolder) return toggleAdminFolderEditor(editFolder.dataset.editFolder);
  const cancelEditFolder = event.target.closest('[data-cancel-admin-folder-edit]');
  if (cancelEditFolder) return toggleAdminFolderEditor();
  const resubmitFolder = event.target.closest('[data-resubmit-folder]');
  if (resubmitFolder) return onResubmitFolder(resubmitFolder.dataset.resubmitFolder);
  const togglePanelButton = event.target.closest('[data-toggle-panel]');
  if (togglePanelButton) return togglePanel(togglePanelButton.dataset.togglePanel);
  const editNotice = event.target.closest('[data-edit-announcement]');
  if (editNotice) return startEditAnnouncement(editNotice.dataset.editAnnouncement);
  const resetNoticeEditor = event.target.closest('[data-reset-announcement-editor]');
  if (resetNoticeEditor) return resetAnnouncementEditor();
  const moveNotice = event.target.closest('[data-move-announcement]');
  if (moveNotice) return moveAnnouncement(moveNotice.dataset.moveAnnouncement, moveNotice.dataset.direction);
  const delNotice = event.target.closest('[data-delete-announcement]');
  if (delNotice) return onDelete(`/api/admin/announcements/${delNotice.dataset.deleteAnnouncement}`, '公告已删除');
}

export function onSubmit(event) {
  const form = event.target;
  event.preventDefault();
  if (form.matches('#search-form')) return onSearchSubmit(form);
  if (form.matches('#login-form')) return onLogin(form);
  if (form.matches('#register-form')) return onRegister(form);
  if (form.matches('#profile-name-form')) return onSaveProfileName(form);
  if (form.matches('#folder-comment-form')) return onSubmitFolderComment(form);
  if (form.matches('#folder-form')) return onUpload(form);
  if (form.matches('[data-folder-edit-form]')) return onAppendAssets(form);
  if (form.matches('[data-admin-folder-meta-form]')) return onSaveAdminFolder(form);
  if (form.matches('[data-admin-folder-assets-form]')) return onAdminAppendAssets(form);
  if (form.matches('#announcement-form')) return onSaveAnnouncement(form);
  if (form.matches('#settings-form')) return onSaveSettings(form);
  if (form.matches('#redeem-codes-form')) return onAddRedeemCodes(form);
  if (form.matches('[data-ai-api-recharge-form]')) return onRechargeAiApiUser(form);
  if (form.matches('[data-ai-api-member-form]')) return onGrantAiApiMember(form);
}

export function onChange(event) {
  if (event.target.matches('#search-input')) {
    if (event.isComposing) return;
    const form = event.target.closest('form') || document.getElementById('search-form');
    if (form) return onSearchSubmit(form);
  }
  if (event.target.matches('#sort-select')) {
    state.sortBy = event.target.value;
    return renderHomePage();
  }
  if (event.target.matches('#category-sort-select')) {
    state.categorySortBy = event.target.value;
    return renderFolderPage();
  }
  if (event.target.matches('[data-home-recommend-snooze]') && event.target.checked) {
    return dismissHomeRecommendationsForToday();
  }
  if (event.target.matches('#admin-folder-search')) {
    state.adminFolderSearch = normalize(event.target.value);
    return renderDashboardPage();
  }
  if (event.target.matches('[data-folder-picker]')) {
    return syncFolderUploadFields(event.target);
  }
}

export function onInput(event) {
  if (event.target.matches('#search-input')) {
    if (event.isComposing) return;
    applyHomeSearch(event.target.value);
    return;
  }
  if (event.target.matches('#sort-select')) {
    state.sortBy = event.target.value;
    return renderHomePage();
  }
}

export function onSearchSubmit(form) {
  const input = form.querySelector('#search-input');
  applyHomeSearch(input?.value || state.searchDraft || '', { rerender: true, scroll: true });
}

export function clearSearch() {
  applyHomeSearch('', { rerender: true });
}

export function togglePanel(key) {
  state.collapsedPanels[key] = !state.collapsedPanels[key];
  renderDashboardPage().catch(console.error);
}

export function syncFolderUploadFields(input) {
  const file = input.files?.[0];
  const relativePath = file?.webkitRelativePath || '';
  if (!relativePath) return;
  const folderName = relativePath.split('/')[0]?.trim();
  if (!folderName) return;
  const form = input.closest('form');
  const nameInput = form?.querySelector('input[name="name"]');
  if (nameInput && !nameInput.value.trim()) nameInput.value = folderName;
}

export async function onLogin(form) {
  const fd = new FormData(form);
  try {
    await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ username: fd.get('username'), password: fd.get('password') }) });
    await refreshBootstrap();
    if (location.pathname === '/profile') {
      const publicId = state.bootstrap?.viewer?.publicId;
      history.pushState({}, '', publicId ? `/profile/${publicId}` : '/profile');
      state.profile = await api('/api/profile/me');
      await renderProfilePage();
    } else {
      history.pushState({}, '', '/dashboard');
      await renderDashboardPage();
    }
    toast('登录成功');
  } catch (error) {
    toast(error.message, 'error');
  }
}

export async function onRegister(form) {
  const fd = new FormData(form);
  try {
    await api('/api/auth/register', { method: 'POST', body: JSON.stringify({ displayName: fd.get('displayName'), username: fd.get('username'), password: fd.get('password') }) });
    form.reset();
    toast('注册成功，现在可以登录');
  } catch (error) {
    toast(error.message, 'error');
  }
}

export async function onSaveProfileName(form) {
  const fd = new FormData(form);
  try {
    state.profile = await api('/api/profile/me', {
      method: 'PUT',
      body: JSON.stringify({ displayName: fd.get('displayName') })
    });
    await refreshBootstrap();
    renderProfilePage();
    toast('显示名称已保存');
  } catch (error) {
    toast(error.message, 'error');
  }
}

export async function onExportProfile() {
  const password = await requestProfilePassword();
  if (!password) return;
  try {
    const result = await api('/api/profile/export', {
      method: 'POST',
      body: JSON.stringify({ password })
    });
    const account = result.account || {};
    const content = [
      '猫猫虫咖波表情包仓库账号信息',
      `数字ID：${account.publicId || ''}`,
      `显示名称：${account.displayName || ''}`,
      `用户名：${account.username || ''}`,
      `密码：${password}`,
      `个人中心：${location.origin}/profile/${account.publicId || ''}`,
      '',
      '请妥善保管这个文件，不要发送给别人。'
    ].join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mmc-account-${account.publicId || 'me'}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast('账号信息已生成下载');
  } catch (error) {
    toast(error.message, 'error');
  }
}

export function onProfileTab(tab) {
  if (tab === 'works' || tab === 'favorites' || tab === 'info') {
    state.profileActiveTab = tab;
    return renderProfilePage();
  }
  toast('这个功能暂未开放');
}

export async function onToggleFavorite(button) {
  const folderId = button.dataset.favoriteFolder;
  const active = button.dataset.favorited === 'true';
  const inProfilePage = location.pathname.startsWith('/profile/');
  if (!state.bootstrap?.viewer) {
    history.pushState({}, '', '/profile');
    return renderProfileEntryPage();
  }
  try {
    const result = await api(`/api/favorites/${encodeURIComponent(folderId)}`, { method: active ? 'DELETE' : 'POST' });
    if (!inProfilePage && state.folderDetail?.folder?.id === folderId) {
      state.folderDetail.folder.isFavorited = Boolean(result.favorited);
      renderFolderPage();
    } else if (state.profile?.isOwner) {
      state.profile = await api('/api/profile/me');
      renderProfilePage();
    }
    toast(result.favorited ? '已加入收藏' : '已取消收藏');
  } catch (error) {
    toast(error.message, 'error');
  }
}

export async function onToggleFolderLike(button) {
  if (!state.bootstrap?.viewer) {
    history.pushState({}, '', '/profile');
    return renderProfileEntryPage();
  }
  const folderId = button.dataset.likeFolder;
  const active = button.dataset.liked === 'true';
  try {
    const result = await api(`/api/public/folders/${encodeURIComponent(folderId)}/like`, { method: active ? 'DELETE' : 'POST' });
    if (state.folderDetail?.folder?.id === folderId) {
      state.folderDetail.folder.isLiked = Boolean(result.isLiked);
      state.folderDetail.folder.likeCount = Number(result.likeCount || 0);
      state.folderDetail.folder.commentCount = Number(result.commentCount || state.folderDetail.folder.commentCount || 0);
      renderFolderPage();
    }
    toast(result.isLiked ? '已点赞' : '已取消点赞');
  } catch (error) {
    toast(error.message, 'error');
  }
}

export async function onToggleFollowUser(button) {
  if (!state.bootstrap?.viewer) {
    history.pushState({}, '', '/profile');
    return renderProfileEntryPage();
  }
  const publicId = button.dataset.followUser;
  const active = button.dataset.following === 'true';
  try {
    const result = await api(`/api/profile/${encodeURIComponent(publicId)}/follow`, { method: active ? 'DELETE' : 'POST' });
    if (state.folderDetail?.folder?.ownerPublicId === Number(publicId)) {
      state.folderDetail.folder.isFollowingOwner = Boolean(result.isFollowingOwner);
      state.folderDetail.folder.followerCount = Number(result.followerCount || 0);
      renderFolderPage();
    }
    toast(result.isFollowingOwner ? '已关注发布者' : '已取消关注');
  } catch (error) {
    toast(error.message, 'error');
  }
}

export async function onSubmitFolderComment(form) {
  if (!state.bootstrap?.viewer) {
    history.pushState({}, '', '/profile');
    return renderProfileEntryPage();
  }
  const folderId = state.folderDetail?.folder?.id;
  if (!folderId) return;
  const content = String(new FormData(form).get('content') || '').trim();
  if (!content || content.length > 100) {
    toast('评论内容需要 1 到 100 个字。', 'error');
    return;
  }
  try {
    const result = await api(`/api/public/folders/${encodeURIComponent(folderId)}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content })
    });
    state.folderDetail.comments = result.comments || [];
    state.folderDetail.folder.commentCount = Number(result.commentCount || state.folderDetail.comments.length);
    renderFolderPage();
    document.getElementById('folder-comments')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    toast('评论已发布');
  } catch (error) {
    toast(error.message, 'error');
  }
}

export async function onDeleteComment(commentId) {
  const confirmed = await confirmDangerAction({
    title: '确认删除这条评论？',
    message: '删除后这条评论会从当前分类页隐藏。',
    confirmText: '删除评论'
  });
  if (!confirmed) return;
  try {
    const result = await api(`/api/comments/${encodeURIComponent(commentId)}`, { method: 'DELETE' });
    if (state.folderDetail?.folder?.id === result.folderId) {
      state.folderDetail.comments = result.comments || [];
      state.folderDetail.folder.commentCount = Number(result.commentCount || state.folderDetail.comments.length);
      renderFolderPage();
    }
    toast('评论已删除');
  } catch (error) {
    toast(error.message, 'error');
  }
}

export function requestProfilePassword() {
  return new Promise(resolve => {
    const root = document.getElementById('confirm-dialog-root');
    if (!root) {
      resolve('');
      return;
    }
    root.innerHTML = `
      <div class="confirm-dialog-overlay" id="profile-password-overlay">
        <div class="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="profile-password-title">
          <button class="modal-close confirm-dialog-close" type="button" data-profile-password-cancel aria-label="关闭">&times;</button>
          <div class="confirm-dialog-body">
            <span class="confirm-dialog-kicker">账号信息保存</span>
            <h3 id="profile-password-title">请输入当前密码</h3>
            <p>密码只用于本次验证和写入下载的 txt 文件，网站不会保存明文密码。</p>
            <label class="field"><span>当前密码</span><input id="profile-export-password" type="password" autocomplete="current-password"></label>
            <div class="confirm-dialog-actions">
              <button class="copy-btn" type="button" data-profile-password-cancel>取消</button>
              <button class="footer-btn" type="button" data-profile-password-submit>生成下载</button>
            </div>
          </div>
        </div>
      </div>
    `;
    const cleanup = value => {
      root.innerHTML = '';
      resolve(value);
    };
    root.querySelector('#profile-export-password')?.focus();
    root.querySelectorAll('[data-profile-password-cancel]').forEach(node => node.addEventListener('click', () => cleanup(''), { once: true }));
    root.querySelector('[data-profile-password-submit]')?.addEventListener('click', () => cleanup(root.querySelector('#profile-export-password')?.value || ''), { once: true });
    root.querySelector('#profile-export-password')?.addEventListener('keydown', event => {
      if (event.key === 'Enter') cleanup(event.target.value || '');
      if (event.key === 'Escape') cleanup('');
    });
    root.querySelector('#profile-password-overlay')?.addEventListener('click', event => {
      if (event.target.id === 'profile-password-overlay') cleanup('');
    }, { once: true });
  });
}

export async function onLogout() {
  try {
    await api('/api/auth/logout', { method: 'POST' });
    await refreshBootstrap();
    history.pushState({}, '', '/site-info');
    renderSiteInfoPage();
    toast('已退出登录');
  } catch (error) {
    toast(error.message, 'error');
  }
}

export async function onUpload(form) {
  try {
    const result = await api('/api/dashboard/folders', { method: 'POST', body: new FormData(form) });
    form.reset();
    await refreshBootstrap();
    await renderDashboardPage();
    toast(result.message || '\u6587\u4ef6\u5939\u5df2\u4fdd\u5b58');
  } catch (error) {
    toast(error.message, 'error');
  }
}

export async function onSaveAnnouncement(form) {
  const fd = new FormData(form);
  const submitButton = form.querySelector('button[type="submit"]');
  const editing = Boolean(String(fd.get('id') || '').trim());
  try {
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = editing ? '淇濆瓨涓?..' : '鍙戝竷涓?..';
    }
    await api('/api/admin/announcements', {
      method: 'POST',
      body: JSON.stringify({
        id: String(fd.get('id') || '').trim() || undefined,
        title: fd.get('title'),
        content: fd.get('content'),
        sortOrder: Number(fd.get('sortOrder') || 0)
      })
    });
    state.announcementDraft = null;
    await refreshBootstrap();
    await renderDashboardPage();
    form.reset();
    toast(editing ? '公告已更新' : '公告已保存');
  } catch (error) {
    toast(error.message, 'error');
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = editing ? '淇濆瓨淇敼' : '淇濆瓨鍏憡';
    }
  }
}

export async function onSaveSettings(form) {
  const fd = new FormData(form);
  const submitButton = form.querySelector('button[type="submit"]');
  try {
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = '淇濆瓨涓?..';
    }
    await api('/api/admin/site-settings', { method: 'PUT', body: JSON.stringify({ siteNotice: { title: fd.get('noticeTitle'), content: fd.get('noticeContent') } }) });
    await refreshBootstrap();
    await renderDashboardPage();
    toast('置顶说明已保存');
  } catch (error) {
    toast(error.message, 'error');
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = '淇濆瓨缃《璇存槑';
    }
  }
}

export async function onAddRedeemCodes(form) {
  const fd = new FormData(form);
  const submitButton = form.querySelector('button[type="submit"]');
  try {
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = '娣诲姞涓?..';
    }
    const result = await api('/api/admin/remove-bg/redeem-codes', {
      method: 'POST',
      body: JSON.stringify({ codes: fd.get('codes'), productCode: fd.get('productCode') })
    });
    state.redeemCodes = { codes: result.codes || [] };
    form.reset();
    await renderDashboardPage();
    toast(result.message || '鍏戞崲鐮佸凡娣诲姞');
  } catch (error) {
    toast(error.message, 'error');
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = '添加兑换码';
    }
  }
}

export async function onRechargeAiApiUser(form) {
  const userId = form.getAttribute('data-ai-api-recharge-form');
  const fd = new FormData(form);
  try {
    const result = await api(`/api/admin/ai-api/users/${userId}/recharge`, {
      method: 'POST',
      body: JSON.stringify({ amount: fd.get('amount'), note: fd.get('note') })
    });
    state.aiApiUsers = { users: result.users || [] };
    form.reset();
    await renderDashboardPage();
    toast(result.message || '鍏呭€煎凡瀹屾垚');
  } catch (error) {
    toast(error.message, 'error');
  }
}

export async function onGrantAiApiMember(form) {
  const userId = form.getAttribute('data-ai-api-member-form');
  const fd = new FormData(form);
  try {
    const result = await api(`/api/admin/ai-api/users/${userId}/membership`, {
      method: 'POST',
      body: JSON.stringify({ days: fd.get('days') })
    });
    state.aiApiUsers = { users: result.users || [] };
    form.reset();
    await renderDashboardPage();
    toast(result.message || 'API 调用会员已开通');
  } catch (error) {
    toast(error.message, 'error');
  }
}

export async function onReview(button) {
  const folderId = button.dataset.folderId;
  const action = button.dataset.reviewAction;
  const note = document.querySelector(`[data-review-note="${folderId}"]`)?.value || '';
  try {
    const confirmOptions = getReviewConfirmationOptions(action);
    if (confirmOptions) {
      const confirmed = await confirmDangerAction(confirmOptions);
      if (!confirmed) return;
    }
    await api(`/api/admin/reviews/${folderId}`, { method: 'POST', body: JSON.stringify({ action, note }) });
    await refreshBootstrap();
    await renderDashboardPage();
    toast('审核结果已保存');
  } catch (error) {
    toast(error.message, 'error');
  }
}

export async function onRole(userId, role) {
  try {
    await api(`/api/admin/users/${userId}/role`, { method: 'POST', body: JSON.stringify({ role }) });
    await renderDashboardPage();
    toast('\u8d26\u53f7\u6743\u9650\u5df2\u66f4\u65b0');
  } catch (error) {
    toast(error.message, 'error');
  }
}

export function findAnnouncementById(id) {
  return (state.announcements?.announcements || []).find(item => item.id === id) || null;
}

export function resetAnnouncementEditor() {
  state.announcementDraft = null;
  renderDashboardPage().catch(console.error);
}

export function startEditAnnouncement(id) {
  const item = findAnnouncementById(id);
  if (!item) return;
  state.announcementDraft = { ...item };
  state.collapsedPanels.announcements = false;
  renderDashboardPage().then(() => {
    const titleInput = document.querySelector('#announcement-form input[name="title"]');
    if (titleInput) titleInput.focus();
  }).catch(console.error);
}

export async function moveAnnouncement(id, direction) {
  const list = [...(state.announcements?.announcements || [])];
  const index = list.findIndex(item => item.id === id);
  if (index < 0) return;
  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= list.length) return;
  const [moved] = list.splice(index, 1);
  list.splice(targetIndex, 0, moved);
  try {
    await Promise.all(list.map((item, order) => api('/api/admin/announcements', {
      method: 'POST',
      body: JSON.stringify({
        id: item.id,
        title: item.title,
        content: item.content,
        sortOrder: order
      })
    })));
    await refreshBootstrap();
    state.collapsedPanels.announcements = false;
    if (state.announcementDraft?.id) {
      state.announcementDraft = findAnnouncementById(state.announcementDraft.id) || state.announcementDraft;
    }
    await renderDashboardPage();
    toast('公告排序已更新');
  } catch (error) {
    toast(error.message, 'error');
  }
}

export async function onDelete(url, success, refreshBootstrapFirst = false) {
  try {
    const confirmed = await confirmDangerAction(getDeleteConfirmationOptions(url));
    if (!confirmed) return;
    await api(url, { method: 'DELETE' });
    if (url.includes('/api/admin/folders/')) state.adminEditingFolderId = null;
    if (refreshBootstrapFirst) await refreshBootstrap();
    await renderDashboardPage();
    toast(success);
  } catch (error) {
    toast(error.message, 'error');
  }
}

export async function onAppendAssets(form) {
  const folderId = form.getAttribute('data-folder-edit-form');
  if (!folderId) return;
  try {
    const result = await api(`/api/dashboard/folders/${folderId}/assets`, { method: 'POST', body: new FormData(form) });
    form.reset();
    await refreshBootstrap();
    await renderDashboardPage();
    toast(result.message || '内容已追加');
  } catch (error) {
    toast(error.message, 'error');
  }
}

export async function onDeleteAsset(folderId, assetId, manageMode = 'owner') {
  try {
    const confirmed = await confirmDangerAction({
      title: '确认删除这个内容？',
      message: '删除后这个图片或视频会从当前文件夹中移除，无法直接恢复。',
      confirmText: '确认删除内容'
    });
    if (!confirmed) return;
    const url = manageMode === 'admin'
      ? `/api/admin/folders/${folderId}/assets/${assetId}`
      : `/api/dashboard/folders/${folderId}/assets/${assetId}`;
    const result = await api(url, { method: 'DELETE' });
    await refreshBootstrap();
    await renderDashboardPage();
    toast(result.message || '内容已删除');
  } catch (error) {
    toast(error.message, 'error');
  }
}

export async function onResubmitFolder(folderId) {
  try {
    const result = await api(`/api/dashboard/folders/${folderId}/resubmit`, { method: 'POST' });
    await refreshBootstrap();
    await renderDashboardPage();
    toast(result.message || '已重新提交审核');
  } catch (error) {
    toast(error.message, 'error');
  }
}

export function toggleAdminFolderEditor(folderId = null) {
  state.adminEditingFolderId = state.adminEditingFolderId === folderId ? null : folderId;
  renderDashboardPage().catch(console.error);
}

export async function onSaveAdminFolder(form) {
  const folderId = form.getAttribute('data-admin-folder-meta-form');
  if (!folderId) return;
  const fd = new FormData(form);
  try {
    const currentFolder = findAdminFolderById(folderId);
    const nextSlug = String(fd.get('slug') || '').trim();
    const nextStatus = String(fd.get('status') || '').trim();
    const confirmOptions = getAdminFolderSaveConfirmationOptions(currentFolder, {
      slug: nextSlug,
      status: nextStatus
    });
    if (confirmOptions) {
      const confirmed = await confirmDangerAction(confirmOptions);
      if (!confirmed) return;
    }
    const result = await api(`/api/admin/folders/${folderId}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: fd.get('name'),
        slug: fd.get('slug'),
        description: fd.get('description'),
        status: fd.get('status')
      })
    });
    state.adminEditingFolderId = folderId;
    await refreshBootstrap();
    await renderDashboardPage();
    toast(result.message || '鏂囦欢澶逛俊鎭凡鏇存柊');
  } catch (error) {
    toast(error.message, 'error');
  }
}

export async function onAdminAppendAssets(form) {
  const folderId = form.getAttribute('data-admin-folder-assets-form');
  if (!folderId) return;
  try {
    const result = await api(`/api/admin/folders/${folderId}/assets`, { method: 'POST', body: new FormData(form) });
    state.adminEditingFolderId = folderId;
    form.reset();
    await refreshBootstrap();
    await renderDashboardPage();
    toast(result.message || '资源已追加');
  } catch (error) {
    toast(error.message, 'error');
  }
}


