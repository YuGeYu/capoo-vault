const SEARCH_API = 'https://api.baka.plus/meting/?server=netease&type=search&id=0&yrc=true&keyword=';
const LYRIC_API = 'https://api.baka.plus/meting/?server=netease&type=lyric&id=';
const FALLBACK_COVER = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"%3E%3Crect width="160" height="160" rx="28" fill="%23fff1f5"/%3E%3Ccircle cx="80" cy="80" r="42" fill="%23ff6b8b" opacity=".22"/%3E%3Ctext x="80" y="88" font-family="Arial" font-size="42" text-anchor="middle" fill="%23ff6b8b"%3E%E2%99%AA%3C/text%3E%3C/svg%3E';
const STORAGE_FAVORITES = 'mmc_music_favorites_v1';
const STORAGE_HISTORY = 'mmc_music_history_v1';
const STORAGE_SEARCH = 'mmc_music_search_history_v1';
const PLAYER_KEY = '__mmc_music_player_v1';

const CATEGORIES = [
  { id: 'hot', name: '热门歌曲', keyword: '热门', icon: 'fa-fire' },
  { id: 'douyin', name: '抖音热歌', keyword: '抖音', icon: 'fa-music' },
  { id: 'pop', name: '流行', keyword: '流行', icon: 'fa-star' },
  { id: 'folk', name: '民谣', keyword: '民谣', icon: 'fa-guitar' },
  { id: 'classic', name: '经典老歌', keyword: '经典', icon: 'fa-clock-rotate-left' },
  { id: 'anime', name: '动漫原声', keyword: '动漫', icon: 'fa-gamepad' },
  { id: 'relax', name: '放松音乐', keyword: '放松', icon: 'fa-mug-hot' },
  { id: 'rap', name: '说唱', keyword: '说唱', icon: 'fa-microphone-lines' }
];

export function mountMusicTool({ root, toast }) {
  if (!root) return () => {};

  const player = getSharedPlayer();
  const audio = player.audio;
  const sessionId = Symbol('music-tool-session');
  player.activeSessionId = sessionId;

  const state = {
    view: 'search',
    keyword: '',
    loading: false,
    songs: [],
    currentList: Array.isArray(player.currentList) ? player.currentList : [],
    currentListType: player.currentListType || 'search',
    currentIndex: Number.isInteger(player.currentIndex) ? player.currentIndex : -1,
    currentSong: player.currentSong || null,
    isPlaying: !audio.paused,
    lyrics: Array.isArray(player.lyrics) ? player.lyrics : [],
    activeLyricIndex: Number.isInteger(player.activeLyricIndex) ? player.activeLyricIndex : -1,
    favorites: readList(STORAGE_FAVORITES),
    history: readList(STORAGE_HISTORY),
    searches: readList(STORAGE_SEARCH),
    error: ''
  };

  render();
  bindEvents();
  return () => {
    if (player.activeSessionId === sessionId) {
      player.activeSessionId = null;
    }
  };

  function isActiveSession() {
    return player.activeSessionId === sessionId && document.contains(root);
  }

  function bindEvents() {
    root.addEventListener('submit', event => {
      if (!isActiveSession()) return;
      if (!event.target.matches('[data-music-search-form]')) return;
      event.preventDefault();
      const keyword = String(new FormData(event.target).get('keyword') || '').trim();
      search(keyword).catch(handleError);
    });

    root.addEventListener('click', event => {
      if (!isActiveSession()) return;
      const action = event.target.closest('[data-music-action]')?.dataset.musicAction;
      if (!action) return;
      if (action === 'view') return switchView(event.target.closest('[data-music-action]').dataset.view || 'search');
      if (action === 'category') return search(event.target.closest('[data-music-action]').dataset.keyword || '').catch(handleError);
      if (action === 'history-keyword') return search(event.target.closest('[data-music-action]').dataset.keyword || '').catch(handleError);
      if (action === 'clear-searches') return clearSearches();
      if (action === 'play-song') return playFromList(Number(event.target.closest('[data-music-action]').dataset.index || 0), event.target.closest('[data-music-action]').dataset.list || 'search').catch(handleError);
      if (action === 'toggle-play') return togglePlay().catch(handleError);
      if (action === 'prev') return playOffset(-1).catch(handleError);
      if (action === 'next') return playOffset(1).catch(handleError);
      if (action === 'toggle-like') return toggleFavorite();
      if (action === 'play-all') return playFromList(0, event.target.closest('[data-music-action]').dataset.list || state.view).catch(handleError);
      if (action === 'clear-history') return clearHistory();
    });

    root.addEventListener('input', event => {
      if (!isActiveSession()) return;
      if (event.target.matches('[data-music-volume]')) {
        audio.volume = Number(event.target.value || 100) / 100;
      }
      if (event.target.matches('[data-music-progress]') && audio.duration) {
        audio.currentTime = Number(event.target.value || 0) * audio.duration / 1000;
      }
    });

    audio.addEventListener('play', () => {
      if (!isActiveSession()) return;
      state.isPlaying = true;
      updatePlaybackUi();
    });
    audio.addEventListener('pause', () => {
      if (!isActiveSession()) return;
      state.isPlaying = false;
      updatePlaybackUi();
    });
    audio.addEventListener('ended', () => {
      if (!isActiveSession()) return;
      playOffset(1).catch(handleError);
    });
    audio.addEventListener('timeupdate', () => {
      if (isActiveSession()) updatePlaybackUi();
    });
    audio.addEventListener('loadedmetadata', () => {
      if (isActiveSession()) updatePlaybackUi();
    });
    audio.addEventListener('error', () => {
      if (!isActiveSession()) return;
      state.isPlaying = false;
      notify('音频加载失败，请换一首试试。', 'error');
      updatePlaybackUi();
    });
  }

  async function search(keyword) {
    keyword = String(keyword || '').trim();
    if (!keyword) return;
    state.view = 'search';
    state.keyword = keyword;
    state.loading = true;
    state.error = '';
    render();

    const response = await fetch(SEARCH_API + encodeURIComponent(keyword));
    if (!response.ok) throw new Error(`搜索失败：${response.status}`);
    const data = await response.json();
    state.songs = Array.isArray(data) ? data.slice(0, 36).map(normalizeSong).filter(song => song.url) : [];
    state.currentList = state.songs;
    state.currentListType = 'search';
    state.loading = false;
    addSearchKeyword(keyword);
    render();
    if (!state.songs.length) notify('没有找到相关歌曲。', 'error');
  }

  async function playFromList(index, listType) {
    const list = getList(listType);
    if (!list.length) return;
    const safeIndex = Math.max(0, Math.min(index, list.length - 1));
    const song = normalizeSong(list[safeIndex]);
    state.currentList = list;
    state.currentListType = listType;
    state.currentIndex = safeIndex;
    state.currentSong = song;
    state.lyrics = [];
    state.activeLyricIndex = -1;
    player.currentList = list;
    player.currentListType = listType;
    player.currentIndex = safeIndex;
    player.currentSong = song;
    player.lyrics = [];
    player.activeLyricIndex = -1;
    audio.pause();
    audio.src = song.url;
    audio.load();
    addPlayHistory(song);
    render();
    await loadLyrics(song);
    try {
      await audio.play();
      notify('开始播放。');
    } catch {
      notify('浏览器阻止了自动播放，请再点一次播放按钮。', 'error');
    }
  }

  async function togglePlay() {
    if (!state.currentSong) {
      const list = getList(state.view);
      if (list.length) return playFromList(0, state.view);
      notify('请先选择一首歌曲。', 'error');
      return;
    }
    if (audio.paused) await audio.play();
    else audio.pause();
  }

  async function playOffset(offset) {
    if (!state.currentList.length) return;
    const nextIndex = (state.currentIndex + offset + state.currentList.length) % state.currentList.length;
    await playFromList(nextIndex, state.currentListType);
  }

  async function loadLyrics(song) {
    const id = extractSongId(song);
    const lyricUrl = song.lrc || (id ? `${LYRIC_API}${id}` : '');
    if (!lyricUrl) return;
    try {
      const response = await fetch(lyricUrl);
      if (!response.ok) return;
      const text = await response.text();
      const parsed = parseLyrics(readLyricText(text));
      state.lyrics = parsed;
      player.lyrics = parsed;
      renderLyrics();
    } catch {
      state.lyrics = [];
      player.lyrics = [];
    }
  }

  function switchView(view) {
    state.view = view;
    if (view === 'favorites') state.currentList = state.favorites;
    if (view === 'history') state.currentList = state.history;
    if (view === 'search') state.currentList = state.songs;
    state.currentListType = view;
    player.currentList = state.currentList;
    player.currentListType = view;
    render();
  }

  function toggleFavorite() {
    if (!state.currentSong) return;
    const id = songKey(state.currentSong);
    const index = state.favorites.findIndex(song => songKey(song) === id);
    if (index >= 0) {
      state.favorites.splice(index, 1);
      notify('已取消收藏。');
    } else {
      state.favorites.unshift(state.currentSong);
      state.favorites = state.favorites.slice(0, 80);
      notify('已加入收藏。');
    }
    writeList(STORAGE_FAVORITES, state.favorites);
    render();
  }

  function addPlayHistory(song) {
    const id = songKey(song);
    state.history = [song, ...state.history.filter(item => songKey(item) !== id)].slice(0, 60);
    writeList(STORAGE_HISTORY, state.history);
  }

  function addSearchKeyword(keyword) {
    state.searches = [keyword, ...state.searches.filter(item => item !== keyword)].slice(0, 10);
    writeList(STORAGE_SEARCH, state.searches);
  }

  function clearSearches() {
    state.searches = [];
    writeList(STORAGE_SEARCH, state.searches);
    render();
  }

  function clearHistory() {
    state.history = [];
    writeList(STORAGE_HISTORY, state.history);
    if (state.view === 'history') state.currentList = [];
    render();
  }

  function getList(listType) {
    if (listType === 'favorites') return state.favorites;
    if (listType === 'history') return state.history;
    return state.songs;
  }

  function render() {
    root.innerHTML = `
      <section class="music-shell">
        <article class="music-panel">
          <div class="music-topbar">
            <form class="music-search" data-music-search-form>
              <i class="fas fa-search"></i>
              <input name="keyword" value="${escapeHtml(state.keyword)}" placeholder="搜索音乐、歌手或专辑" autocomplete="off">
              <button class="footer-btn footer-btn-small" type="submit" ${state.loading ? 'disabled' : ''}>${state.loading ? '搜索中' : '搜索'}</button>
            </form>
            <div class="music-tabs">
              ${tabButton('search', '搜索', 'fa-search')}
              ${tabButton('recommend', '推荐', 'fa-fire')}
              ${tabButton('favorites', `收藏 ${state.favorites.length}`, 'fa-heart')}
              ${tabButton('history', `历史 ${state.history.length}`, 'fa-clock-rotate-left')}
            </div>
          </div>
          <div class="music-main">
            <div class="music-content">${renderContent()}</div>
            <aside class="music-lyrics">
              <div class="music-section-head">
                <span class="notice-badge">歌词</span>
                <strong>${escapeHtml(state.currentSong?.name || '还没有播放歌曲')}</strong>
              </div>
              <div class="music-lyrics-list" data-music-lyrics>${lyricsHtml()}</div>
            </aside>
          </div>
        </article>
        <article class="music-player">
          <img class="music-cover" src="${attr(state.currentSong?.pic || FALLBACK_COVER)}" alt="歌曲封面">
          <div class="music-now">
            <strong data-music-now-title>${escapeHtml(state.currentSong?.name || '慢慢听歌')}</strong>
            <span data-music-now-artist>${escapeHtml(state.currentSong?.artist || '搜索一首歌开始播放')}</span>
          </div>
          <div class="music-controls">
            <button class="music-icon-btn" type="button" data-music-action="prev" title="上一首"><i class="fas fa-step-backward"></i></button>
            <button class="music-play-btn" type="button" data-music-action="toggle-play" title="播放/暂停"><i class="fas ${state.isPlaying ? 'fa-pause' : 'fa-play'}" data-music-play-icon></i></button>
            <button class="music-icon-btn" type="button" data-music-action="next" title="下一首"><i class="fas fa-step-forward"></i></button>
            <button class="music-icon-btn ${isCurrentLiked() ? 'is-liked' : ''}" type="button" data-music-action="toggle-like" title="收藏"><i class="${isCurrentLiked() ? 'fas' : 'far'} fa-heart" data-music-like-icon></i></button>
          </div>
          <div class="music-progress">
            <span data-music-current-time>0:00</span>
            <input type="range" min="0" max="1000" value="0" data-music-progress>
            <span data-music-duration>0:00</span>
          </div>
          <label class="music-volume"><i class="fas fa-volume-up"></i><input type="range" min="0" max="100" value="${Math.round(audio.volume * 100)}" data-music-volume></label>
        </article>
      </section>
    `;
    updatePlaybackUi();
  }

  function renderContent() {
    if (state.view === 'recommend') return renderRecommend();
    if (state.view === 'favorites') return renderSongSection('favorites', state.favorites, '收藏夹空空如也', '点播放器里的爱心可以收藏当前歌曲。');
    if (state.view === 'history') return renderSongSection('history', state.history, '暂无播放历史', '播放过的歌曲会自动放在这里。', true);
    return renderSearch();
  }

  function renderSearch() {
    if (state.loading) return `<div class="music-empty"><i class="fas fa-spinner fa-spin"></i><strong>正在搜索</strong><p>正在从音乐接口获取结果。</p></div>`;
    if (!state.songs.length) {
      return `
        <div class="music-history-row">
          ${state.searches.length ? state.searches.map(keyword => `<button class="music-chip" type="button" data-music-action="history-keyword" data-keyword="${attr(keyword)}">${escapeHtml(keyword)}</button>`).join('') : ''}
          ${state.searches.length ? '<button class="music-chip is-muted" type="button" data-music-action="clear-searches">清空搜索历史</button>' : ''}
        </div>
        <div class="music-empty"><i class="fas fa-headphones"></i><strong>输入关键词搜索音乐</strong><p>可以搜索歌曲名、歌手或专辑，也可以去推荐里点一个分类。</p></div>
      `;
    }
    return renderSongSection('search', state.songs, '', '');
  }

  function renderRecommend() {
    return `
      <div class="music-category-grid">
        ${CATEGORIES.map(category => `
          <button class="music-category" type="button" data-music-action="category" data-keyword="${attr(category.keyword)}">
            <span><i class="fas ${category.icon}"></i></span>
            <strong>${escapeHtml(category.name)}</strong>
            <small>搜索「${escapeHtml(category.keyword)}」</small>
          </button>
        `).join('')}
      </div>
    `;
  }

  function renderSongSection(listType, songs, emptyTitle, emptyText, canClear = false) {
    if (!songs.length) {
      return `<div class="music-empty"><i class="fas fa-music"></i><strong>${escapeHtml(emptyTitle)}</strong><p>${escapeHtml(emptyText)}</p></div>`;
    }
    return `
      <div class="music-list-head">
        <span>${listLabel(listType)} · ${songs.length} 首</span>
        <div class="review-button-row">
          ${canClear ? '<button class="copy-btn" type="button" data-music-action="clear-history">清空历史</button>' : ''}
          <button class="copy-btn" type="button" data-music-action="play-all" data-list="${attr(listType)}">播放全部</button>
        </div>
      </div>
      <div class="music-song-list">
        ${songs.map((song, index) => songRow(normalizeSong(song), index, listType)).join('')}
      </div>
    `;
  }

  function songRow(song, index, listType) {
    const active = state.currentSong && songKey(song) === songKey(state.currentSong);
    const liked = state.favorites.some(item => songKey(item) === songKey(song));
    return `
      <button class="music-song ${active ? 'is-active' : ''}" type="button" data-music-action="play-song" data-index="${index}" data-list="${attr(listType)}">
        <span class="music-song-index">${index + 1}</span>
        <img src="${attr(song.pic || FALLBACK_COVER)}" alt="">
        <span class="music-song-text"><strong>${escapeHtml(song.name)}</strong><small>${escapeHtml(song.artist)} · ${escapeHtml(song.album || '未知专辑')}</small></span>
        <span class="music-song-like"><i class="${liked ? 'fas' : 'far'} fa-heart"></i></span>
      </button>
    `;
  }

  function tabButton(view, label, icon) {
    return `<button class="${state.view === view ? 'is-active' : ''}" type="button" data-music-action="view" data-view="${view}"><i class="fas ${icon}"></i><span>${escapeHtml(label)}</span></button>`;
  }

  function lyricsHtml() {
    if (!state.currentSong) return '<div class="music-empty compact"><p>播放歌曲后会在这里显示歌词。</p></div>';
    if (!state.lyrics.length) return '<div class="music-empty compact"><p>当前歌曲暂无可用歌词。</p></div>';
    return state.lyrics.map((line, index) => `<p class="${index === state.activeLyricIndex ? 'is-active' : ''}" data-lyric-index="${index}">${escapeHtml(line.text)}</p>`).join('');
  }

  function renderLyrics() {
    const target = root.querySelector('[data-music-lyrics]');
    if (target) target.innerHTML = lyricsHtml();
  }

  function updatePlaybackUi() {
    const current = audio.currentTime || 0;
    const duration = audio.duration || 0;
    const progress = duration ? Math.round(current / duration * 1000) : 0;
    setText('[data-music-current-time]', formatTime(current));
    setText('[data-music-duration]', formatTime(duration));
    const progressInput = root.querySelector('[data-music-progress]');
    if (progressInput && document.activeElement !== progressInput) progressInput.value = String(progress);
    const playIcon = root.querySelector('[data-music-play-icon]');
    if (playIcon) playIcon.className = `fas ${audio.paused ? 'fa-play' : 'fa-pause'}`;
    updateActiveLyric(current);
  }

  function updateActiveLyric(currentTime) {
    if (!state.lyrics.length) return;
    let index = -1;
    for (let i = state.lyrics.length - 1; i >= 0; i -= 1) {
      if (currentTime >= state.lyrics[i].time) {
        index = i;
        break;
      }
    }
    if (index === state.activeLyricIndex) return;
    state.activeLyricIndex = index;
    player.activeLyricIndex = index;
    root.querySelectorAll('[data-lyric-index]').forEach(line => line.classList.toggle('is-active', Number(line.dataset.lyricIndex) === index));
    root.querySelector('[data-lyric-index].is-active')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  function setText(selector, value) {
    const node = root.querySelector(selector);
    if (node) node.textContent = value;
  }

  function isCurrentLiked() {
    return Boolean(state.currentSong && state.favorites.some(item => songKey(item) === songKey(state.currentSong)));
  }

  function handleError(error) {
    state.loading = false;
    state.error = error?.message || '操作失败';
    render();
    notify(state.error, 'error');
  }

  function notify(message, type = 'info') {
    if (typeof toast === 'function') toast(message, type);
  }
}

function getSharedPlayer() {
  const store = globalThis[PLAYER_KEY] || {};
  if (!store.audio) {
    store.audio = new Audio();
    store.audio.preload = 'metadata';
    store.audio.crossOrigin = 'anonymous';
  }
  store.currentList ||= [];
  store.currentListType ||= 'search';
  store.currentIndex = Number.isInteger(store.currentIndex) ? store.currentIndex : -1;
  store.lyrics ||= [];
  store.activeLyricIndex = Number.isInteger(store.activeLyricIndex) ? store.activeLyricIndex : -1;
  globalThis[PLAYER_KEY] = store;
  return store;
}

function normalizeSong(song) {
  const safe = {
    id: song?.id || '',
    name: song?.name || '未知歌曲',
    artist: song?.artist || '未知艺术家',
    album: song?.album || '未知专辑',
    url: song?.url || '',
    pic: song?.pic || FALLBACK_COVER,
    lrc: song?.lrc || song?.lyric || ''
  };
  if (!safe.id) safe.id = extractSongId(safe) || songKey(safe);
  if (!safe.lrc) {
    const id = extractSongId(safe);
    if (id) safe.lrc = `${LYRIC_API}${id}`;
  }
  return safe;
}

function extractSongId(songOrUrl) {
  const url = typeof songOrUrl === 'string' ? songOrUrl : `${songOrUrl?.url || ''} ${songOrUrl?.lrc || ''} ${songOrUrl?.id || ''}`;
  const match = url.match(/[?&]id=(\d+)/) || url.match(/\/(\d+)\.mp3/) || url.match(/\b(\d{5,})\b/);
  return match?.[1] || '';
}

function readLyricText(text) {
  const raw = String(text || '');
  try {
    const data = JSON.parse(raw);
    return data?.lrc?.lyric || data?.lyric || data?.lrc || raw;
  } catch {
    return raw;
  }
}

function parseLyrics(text) {
  return String(text || '').split('\n').map(line => {
    const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\]/);
    if (!match) return null;
    const time = Number(match[1]) * 60 + Number(match[2]) + Number(match[3].padEnd(3, '0')) / 1000;
    const lyricText = line.replace(/\[[^\]]+\]/g, '').trim();
    return lyricText ? { time, text: lyricText } : null;
  }).filter(Boolean).sort((a, b) => a.time - b.time);
}

function songKey(song) {
  return `${song?.id || ''}|${song?.name || ''}|${song?.artist || ''}|${song?.album || ''}`.toLowerCase();
}

function listLabel(type) {
  return type === 'favorites' ? '我的收藏' : type === 'history' ? '播放历史' : '搜索结果';
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

function readList(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function writeList(key, list) {
  localStorage.setItem(key, JSON.stringify(list));
}

function escapeHtml(value) {
  return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

function attr(value) {
  return escapeHtml(value);
}
