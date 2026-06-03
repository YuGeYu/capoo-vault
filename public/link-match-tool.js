const BEST_SCORE_KEY = 'mmc_link_match_best_score_v1';
const BEST_TIME_KEY = 'mmc_link_match_best_time_v1';
const AUDIO_KEY = '__mmc_link_match_audio_v1';
const MUSIC_SEARCH_API = 'https://api.baka.plus/meting/?server=netease&type=search&id=0&yrc=true&keyword=';

const DIFFICULTIES = {
  easy: { label: '轻松', rows: 4, cols: 6, seconds: 120, hints: 5, shuffles: 3 },
  normal: { label: '普通', rows: 6, cols: 6, seconds: 150, hints: 3, shuffles: 2 },
  hard: { label: '挑战', rows: 6, cols: 8, seconds: 180, hints: 2, shuffles: 1 }
};

const MUSIC_KEYWORDS = ['可爱 BGM', '轻松 BGM', '游戏 BGM', 'happy cute bgm'];

export function mountLinkMatchTool({ root, bootstrap, api, toast }) {
  if (!root) return () => {};

  const notify = typeof toast === 'function' ? toast : () => {};
  const request = typeof api === 'function' ? api : defaultApi;
  const audio = getSharedAudio();
  let timer = null;
  let sessionId = Symbol('link-match-session');

  const state = {
    difficulty: 'easy',
    assets: [],
    loadingAssets: false,
    board: [],
    selected: null,
    locked: false,
    status: 'ready',
    message: '',
    score: 0,
    combo: 0,
    bestCombo: 0,
    matches: 0,
    remaining: 0,
    secondsLeft: DIFFICULTIES.easy.seconds,
    startedAt: 0,
    hintsLeft: DIFFICULTIES.easy.hints,
    shufflesLeft: DIFFICULTIES.easy.shuffles,
    hintPair: null,
    linePath: [],
    musicOn: false,
    musicLoading: false,
    bgmTitle: '',
    announcedScores: new Set(),
    announcedTimes: new Set(),
    announcedCombos: new Set(),
    bestScore: readNumber(BEST_SCORE_KEY),
    bestTime: readNumber(BEST_TIME_KEY)
  };

  init();

  return () => {
    stopTimer();
    sessionId = null;
  };

  async function init() {
    root.addEventListener('click', handleClick);
    root.addEventListener('change', handleChange);
    await loadAssets();
    startGame();
  }

  async function loadAssets() {
    state.loadingAssets = true;
    render();
    const summaries = usableSummaries(bootstrap?.folders || []);
    const wanted = maxPairsNeeded();
    const pickedFolders = shuffle(summaries);
    const detailed = [];

    for (const folder of pickedFolders) {
      if (detailed.length >= wanted) break;
      try {
        const data = await request(`/api/public/folders/${encodeURIComponent(folder.slug)}`);
        for (const asset of data.assets || []) {
          if (asset?.url && asset.media_kind !== 'video' && isPublicMediaUrl(asset.url)) {
            detailed.push({
              id: asset.id || `${folder.slug}-${detailed.length}`,
              name: asset.original_name || folder.name,
              url: asset.url,
              folderName: folder.name
            });
          }
          if (detailed.length >= wanted) break;
        }
      } catch {}
    }

    const covers = summaries
      .filter(folder => folder.coverUrl && folder.coverMediaKind !== 'video' && isPublicMediaUrl(folder.coverUrl))
      .map(folder => ({
        id: folder.id,
        name: folder.name,
        url: folder.coverUrl,
        folderName: folder.name
      }));

    state.assets = uniqueAssets([...detailed, ...covers]);
    state.loadingAssets = false;
  }

  function startGame() {
    const config = DIFFICULTIES[state.difficulty];
    const pairCount = Math.floor(config.rows * config.cols / 2);
    const assets = pickAssets(pairCount);

    stopTimer();
    state.board = makeBoard(config, assets);
    resetRoundState(config, assets.length);
    ensureSolvableBoard({ silent: true });
    render();
    if (assets.length) startTimer();
  }

  function handleClick(event) {
    if (!document.contains(root)) return;
    const actionButton = event.target.closest('[data-link-action]');
    if (actionButton) {
      const action = actionButton.dataset.linkAction;
      if (action === 'restart') return startGame();
      if (action === 'hint') return useHint();
      if (action === 'shuffle') return shuffleBoard();
      if (action === 'music') return toggleMusic();
    }

    const tileButton = event.target.closest('[data-tile]');
    if (!tileButton || state.locked || state.status !== 'playing') return;
    const [row, col] = tileButton.dataset.tile.split('-').map(Number);
    selectTile(row, col);
  }

  function handleChange(event) {
    if (!document.contains(root)) return;
    if (!event.target.matches('[data-link-difficulty]')) return;
    state.difficulty = event.target.value;
    const config = DIFFICULTIES[state.difficulty] || DIFFICULTIES.easy;
    state.hintsLeft = config.hints;
    state.shufflesLeft = config.shuffles;
    state.secondsLeft = config.seconds;
    startGame();
  }

  function resetRoundState(config, remaining) {
    state.selected = null;
    state.locked = false;
    state.status = remaining ? 'playing' : 'empty';
    state.message = remaining ? '先点一张表情包，再找它的同伴。' : '当前公开图片不足，暂时无法生成牌面。';
    state.score = 0;
    state.combo = 0;
    state.bestCombo = 0;
    state.matches = 0;
    state.remaining = remaining;
    state.secondsLeft = config.seconds;
    state.startedAt = Date.now();
    state.hintsLeft = config.hints;
    state.shufflesLeft = config.shuffles;
    state.hintPair = null;
    state.linePath = [];
    state.announcedScores = new Set();
    state.announcedTimes = new Set();
    state.announcedCombos = new Set();
  }

  function selectTile(row, col) {
    const tile = getTile(row, col);
    if (!tile || tile.removed) return;

    if (!state.selected) {
      state.selected = { row, col };
      state.message = '再点一张相同的表情包。';
      render();
      return;
    }

    if (state.selected.row === row && state.selected.col === col) {
      state.selected = null;
      state.message = '已取消选择。';
      render();
      return;
    }

    const first = getTile(state.selected.row, state.selected.col);
    const second = tile;
    const path = first?.pairId === second?.pairId ? findPath(state.selected, { row, col }) : null;
    state.hintPair = null;

    if (path) {
      completeMatch(state.selected, { row, col }, path);
      return;
    }

    state.combo = 0;
    state.score = Math.max(0, state.score - 20);
    state.selected = { row, col };
    state.message = first?.pairId === second?.pairId ? '这两张暂时连不过去，换一对试试。' : '不是同一对，继续找。';
    render();
  }

  function completeMatch(firstPos, secondPos, path) {
    state.locked = true;
    state.linePath = path;
    state.combo += 1;
    state.bestCombo = Math.max(state.bestCombo, state.combo);
    state.score += 100 + state.combo * 10;
    announceScoreMilestone();
    announceComboMilestone();
    state.matches += 1;
    state.remaining -= 1;
    state.selected = null;
    state.message = state.combo >= 3 ? `连击 ${state.combo}！` : '连线成功。';
    render();

    setTimeout(() => {
      const first = getTile(firstPos.row, firstPos.col);
      const second = getTile(secondPos.row, secondPos.col);
      if (first) first.removed = true;
      if (second) second.removed = true;
      state.linePath = [];
      state.locked = false;
      if (state.remaining <= 0) finishGame();
      else {
        ensureSolvableBoard();
        render();
      }
    }, 280);
  }

  function finishGame() {
    stopTimer();
    const elapsed = elapsedSeconds();
    state.status = 'won';
    state.score += state.secondsLeft * 5;
    state.message = `通关成功，用时 ${formatTime(elapsed)}。`;
    state.bestScore = Math.max(state.bestScore, state.score);
    if (!state.bestTime || elapsed < state.bestTime) state.bestTime = elapsed;
    localStorage.setItem(BEST_SCORE_KEY, String(state.bestScore));
    localStorage.setItem(BEST_TIME_KEY, String(state.bestTime));
    notify(`通关成功，用时 ${formatTime(elapsed)}，得分 ${state.score}。`);
    render();
  }

  function failGame() {
    stopTimer();
    state.status = 'lost';
    state.selected = null;
    state.linePath = [];
    state.message = '倒计时结束，本局失败。';
    notify('时间到，本局结束。', 'error');
    render();
  }

  function useHint() {
    if (state.status !== 'playing' || state.locked) return;
    if (state.hintsLeft <= 0) {
      notify('提示次数用完了。', 'error');
      return;
    }
    const pair = findAvailablePair();
    if (!pair) {
      ensureSolvableBoard();
      const retryPair = findAvailablePair();
      if (!retryPair) {
        state.message = '暂时没有可提示的对子，请重新开始一局。';
        render();
        return;
      }
      state.hintsLeft -= 1;
      state.score = Math.max(0, state.score - 50);
      state.hintPair = retryPair;
      state.message = '牌面已自动重排，并标出一组可以连的表情包。';
      render();
      return;
    }
    state.hintsLeft -= 1;
    state.score = Math.max(0, state.score - 50);
    state.hintPair = pair;
    state.message = '已标出一组可以连的表情包。';
    render();
  }

  function shuffleBoard() {
    if (state.status !== 'playing' || state.locked) return;
    if (state.shufflesLeft <= 0) {
      notify('洗牌次数用完了。', 'error');
      return;
    }
    const liveTiles = state.board.flat().filter(tile => tile && !tile.removed);
    const payloads = shuffle(liveTiles.map(tile => ({
      pairId: tile.pairId,
      asset: tile.asset
    })));
    let index = 0;
    for (const tile of state.board.flat()) {
      if (!tile || tile.removed) continue;
      const next = payloads[index++];
      tile.pairId = next.pairId;
      tile.asset = next.asset;
    }
    state.selected = null;
    state.hintPair = null;
    state.linePath = [];
    state.combo = 0;
    state.score = Math.max(0, state.score - 100);
    state.shufflesLeft -= 1;
    state.message = '牌面已重新打乱。';
    ensureSolvableBoard({ silent: true });
    render();
  }

  async function toggleMusic() {
    state.musicOn = !state.musicOn;
    if (!state.musicOn) {
      audio.pause();
      render();
      return;
    }
    state.musicLoading = true;
    state.bgmTitle = '正在找音乐';
    render();
    try {
      const track = await findBgmTrack();
      state.bgmTitle = `${track.name} - ${track.artist}`;
      audio.pause();
      audio.src = track.url;
      audio.loop = true;
      audio.volume = 0.35;
      await audio.play();
    } catch {
      state.musicOn = false;
      state.bgmTitle = '';
      notify('音乐加载失败，请稍后再试。', 'error');
    } finally {
      state.musicLoading = false;
      render();
    }
  }

  function startTimer() {
    stopTimer();
    timer = setInterval(() => {
      if (!sessionId || !document.contains(root)) {
        stopTimer();
        return;
      }
      if (state.status !== 'playing') return;
      state.secondsLeft -= 1;
      announceTimeMilestone();
      updateTimerUi();
      if (state.secondsLeft <= 0) failGame();
    }, 1000);
  }

  function stopTimer() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  function render() {
    const config = DIFFICULTIES[state.difficulty];
    root.innerHTML = `
      <div class="link-match-shell">
        <section class="link-match-panel link-match-scoreboard">
          <div class="link-match-stat"><span>分数</span><strong>${state.score}</strong></div>
          <div class="link-match-stat"><span>倒计时</span><strong data-link-timer>${formatTime(state.secondsLeft)}</strong></div>
          <div class="link-match-stat"><span>剩余</span><strong>${state.remaining}</strong></div>
          <div class="link-match-stat"><span>连击</span><strong>${state.combo}</strong></div>
        </section>
        <section class="link-match-panel link-match-toolbar">
          <label class="link-match-select">
            <span>难度</span>
            <select data-link-difficulty>
              ${Object.entries(DIFFICULTIES).map(([key, item]) => `<option value="${key}" ${key === state.difficulty ? 'selected' : ''}>${item.label}</option>`).join('')}
            </select>
          </label>
          <button class="copy-btn" type="button" data-link-action="restart"><i class="fas fa-rotate-right"></i> 重开</button>
          <button class="copy-btn" type="button" data-link-action="hint" ${state.status !== 'playing' ? 'disabled' : ''}><i class="fas fa-lightbulb"></i> 提示 ${state.hintsLeft}</button>
          <button class="copy-btn" type="button" data-link-action="shuffle" ${state.status !== 'playing' ? 'disabled' : ''}><i class="fas fa-shuffle"></i> 洗牌 ${state.shufflesLeft}</button>
          <button class="copy-btn ${state.musicOn ? 'is-active' : ''}" type="button" data-link-action="music" ${state.musicLoading ? 'disabled' : ''}><i class="fas ${state.musicLoading ? 'fa-spinner fa-spin' : state.musicOn ? 'fa-volume-high' : 'fa-volume-xmark'}"></i> 音乐</button>
        </section>
        <section class="link-match-panel link-match-board-wrap">
          ${state.loadingAssets ? loadingView() : boardView(config)}
        </section>
        <section class="link-match-panel link-match-footer">
          <p>${escapeHtml(state.message || '')}</p>
          <div class="link-match-records">
            <span>最高分：${state.bestScore || 0}</span>
            <span>最快：${state.bestTime ? formatTime(state.bestTime) : '--:--'}</span>
            ${state.musicOn ? `<span>音乐：${escapeHtml(state.bgmTitle)}</span>` : ''}
          </div>
        </section>
      </div>
    `;
    drawLine();
  }

  function loadingView() {
    return `<div class="link-match-empty"><i class="fas fa-spinner fa-spin"></i><p>正在整理表情包牌面...</p></div>`;
  }

  function boardView(config) {
    if (state.status === 'empty') {
      return `<div class="link-match-empty"><i class="fas fa-face-frown"></i><p>公开图片不足，暂时无法开始游戏。</p></div>`;
    }
    return `
      <div class="link-match-board" style="--link-rows:${config.rows};--link-cols:${config.cols};">
        <svg class="link-match-lines" data-link-lines aria-hidden="true"></svg>
        ${state.board.map((row, rowIndex) => row.map((tile, colIndex) => tileHtml(tile, rowIndex, colIndex)).join('')).join('')}
      </div>
      ${state.status === 'won' || state.status === 'lost' ? endOverlay() : ''}
    `;
  }

  function tileHtml(tile, row, col) {
    if (!tile || tile.removed) return `<span class="link-match-tile is-empty" data-board-cell="${row}-${col}"></span>`;
    const selected = state.selected?.row === row && state.selected?.col === col;
    const hinted = isHinted(row, col);
    return `
      <button class="link-match-tile ${selected ? 'is-selected' : ''} ${hinted ? 'is-hinted' : ''}" type="button" data-tile="${row}-${col}" data-board-cell="${row}-${col}" title="${escapeHtml(tile.asset.name)}">
        <img src="${attr(tile.asset.url)}" alt="${escapeHtml(tile.asset.name)}" loading="lazy">
      </button>
    `;
  }

  function endOverlay() {
    const title = state.status === 'won' ? '通关成功' : '时间到';
    const icon = state.status === 'won' ? 'fa-trophy' : 'fa-hourglass-end';
    return `
      <div class="link-match-end">
        <div class="link-match-end-card">
          <i class="fas ${icon}"></i>
          <h3>${title}</h3>
          <p>本局分数 ${state.score}，最高连击 ${state.bestCombo}。</p>
          <button class="footer-btn" type="button" data-link-action="restart">再来一局</button>
        </div>
      </div>
    `;
  }

  function drawLine() {
    if (!state.linePath.length) return;
    const svg = root.querySelector('[data-link-lines]');
    const board = root.querySelector('.link-match-board');
    if (!svg || !board) return;
    const boardRect = board.getBoundingClientRect();
    const points = state.linePath.map(point => {
      const cell = root.querySelector(`[data-board-cell="${point.row}-${point.col}"]`);
      if (!cell) return null;
      const rect = cell.getBoundingClientRect();
      return {
        x: rect.left - boardRect.left + rect.width / 2,
        y: rect.top - boardRect.top + rect.height / 2
      };
    }).filter(Boolean);
    if (points.length < 2) return;
    svg.setAttribute('viewBox', `0 0 ${boardRect.width} ${boardRect.height}`);
    svg.innerHTML = `<polyline points="${points.map(point => `${point.x},${point.y}`).join(' ')}"></polyline>`;
  }

  function updateTimerUi() {
    const node = root.querySelector('[data-link-timer]');
    if (node) node.textContent = formatTime(Math.max(0, state.secondsLeft));
  }

  function findAvailablePair() {
    const live = [];
    for (let row = 0; row < state.board.length; row += 1) {
      for (let col = 0; col < state.board[row].length; col += 1) {
        const tile = state.board[row][col];
        if (tile && !tile.removed) live.push({ row, col, pairId: tile.pairId });
      }
    }
    for (let i = 0; i < live.length; i += 1) {
      for (let j = i + 1; j < live.length; j += 1) {
        if (live[i].pairId !== live[j].pairId) continue;
        const path = findPath(live[i], live[j]);
        if (path) return { first: live[i], second: live[j] };
      }
    }
    return null;
  }

  function ensureSolvableBoard({ silent = false } = {}) {
    if (state.remaining <= 1 || findAvailablePair()) return false;
    const solved = reshuffleUntilSolvable();
    state.selected = null;
    state.hintPair = null;
    state.linePath = [];
    if (solved) {
      state.message = '当前牌面没有可连对子，已自动重排。';
      if (!silent) notify('当前牌面没有可连对子，已自动重排。');
    }
    return solved;
  }

  function reshuffleUntilSolvable(maxAttempts = 80) {
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      reshuffleLiveTiles();
      if (findAvailablePair()) return true;
    }
    return false;
  }

  function reshuffleLiveTiles() {
    const liveTiles = state.board.flat().filter(tile => tile && !tile.removed);
    const payloads = shuffle(liveTiles.map(tile => ({
      pairId: tile.pairId,
      asset: tile.asset
    })));
    let index = 0;
    for (const tile of state.board.flat()) {
      if (!tile || tile.removed) continue;
      const next = payloads[index++];
      tile.pairId = next.pairId;
      tile.asset = next.asset;
    }
  }

  function announceScoreMilestone() {
    const milestones = [500, 1000, 2000, 3000, 5000];
    const hit = milestones.find(value => state.score >= value && !state.announcedScores.has(value));
    if (!hit) return;
    state.announcedScores.add(hit);
    notify(`分数达到 ${hit}！`);
  }

  function announceComboMilestone() {
    const milestones = [3, 5, 8, 10, 15];
    if (!milestones.includes(state.combo) || state.announcedCombos.has(state.combo)) return;
    state.announcedCombos.add(state.combo);
    notify(`连击 ${state.combo}！`);
  }

  function announceTimeMilestone() {
    const milestones = [60, 30, 10];
    if (!milestones.includes(state.secondsLeft) || state.announcedTimes.has(state.secondsLeft)) return;
    state.announcedTimes.add(state.secondsLeft);
    notify(`倒计时还剩 ${state.secondsLeft} 秒。`, state.secondsLeft <= 10 ? 'error' : 'info');
  }

  function findPath(start, end) {
    const rows = state.board.length;
    const cols = state.board[0]?.length || 0;
    const expandedRows = rows + 2;
    const expandedCols = cols + 2;
    const dirs = [
      { row: -1, col: 0 },
      { row: 0, col: 1 },
      { row: 1, col: 0 },
      { row: 0, col: -1 }
    ];
    const startNode = { row: start.row + 1, col: start.col + 1 };
    const endNode = { row: end.row + 1, col: end.col + 1 };
    const queue = [{ ...startNode, dir: -1, turns: 0, path: [startNode] }];
    const seen = new Map();

    while (queue.length) {
      const current = queue.shift();
      const key = `${current.row}:${current.col}:${current.dir}`;
      if (seen.has(key) && seen.get(key) <= current.turns) continue;
      seen.set(key, current.turns);

      if (current.row === endNode.row && current.col === endNode.col) {
        return compressPath(current.path).map(point => ({ row: point.row - 1, col: point.col - 1 }));
      }

      for (let dirIndex = 0; dirIndex < dirs.length; dirIndex += 1) {
        const nextTurns = current.dir === -1 || current.dir === dirIndex ? current.turns : current.turns + 1;
        if (nextTurns > 2) continue;
        const next = {
          row: current.row + dirs[dirIndex].row,
          col: current.col + dirs[dirIndex].col
        };
        if (next.row < 0 || next.col < 0 || next.row >= expandedRows || next.col >= expandedCols) continue;
        if (!isPassableExpanded(next, endNode)) continue;
        queue.push({
          ...next,
          dir: dirIndex,
          turns: nextTurns,
          path: [...current.path, next]
        });
      }
    }
    return null;
  }

  function isPassableExpanded(point, endNode) {
    if (point.row === endNode.row && point.col === endNode.col) return true;
    const boardRow = point.row - 1;
    const boardCol = point.col - 1;
    if (boardRow < 0 || boardCol < 0 || boardRow >= state.board.length || boardCol >= state.board[0].length) return true;
    const tile = state.board[boardRow][boardCol];
    return !tile || tile.removed;
  }

  function getTile(row, col) {
    return state.board[row]?.[col] || null;
  }

  function isHinted(row, col) {
    const pair = state.hintPair;
    if (!pair) return false;
    return (pair.first.row === row && pair.first.col === col) || (pair.second.row === row && pair.second.col === col);
  }

  function pickAssets(count) {
    return shuffle(state.assets).slice(0, count);
  }

  function maxPairsNeeded() {
    return Math.max(...Object.values(DIFFICULTIES).map(item => Math.floor(item.rows * item.cols / 2)));
  }

  function elapsedSeconds() {
    return Math.max(0, Math.round((Date.now() - state.startedAt) / 1000));
  }
}

function usableSummaries(folders) {
  return folders.filter(folder => folder?.slug && folder?.coverUrl && folder.coverMediaKind !== 'video');
}

function makeBoard(config, assets) {
  const pairPayloads = assets.flatMap((asset, index) => ([
    { pairId: `pair-${index}`, asset },
    { pairId: `pair-${index}`, asset }
  ]));
  const shuffled = shuffle(pairPayloads);
  const board = [];
  let index = 0;
  for (let row = 0; row < config.rows; row += 1) {
    board[row] = [];
    for (let col = 0; col < config.cols; col += 1) {
      const payload = shuffled[index++];
      board[row][col] = payload ? { ...payload, removed: false } : null;
    }
  }
  return board;
}

function uniqueAssets(assets) {
  const seen = new Set();
  return assets.filter(asset => {
    const key = asset.url || asset.id;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function isPublicMediaUrl(url) {
  return String(url || '').startsWith('/media/');
}

function shuffle(list) {
  const copy = [...list];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function compressPath(path) {
  if (path.length <= 2) return path;
  const result = [path[0]];
  for (let index = 1; index < path.length - 1; index += 1) {
    const prev = path[index - 1];
    const current = path[index];
    const next = path[index + 1];
    const sameRow = prev.row === current.row && current.row === next.row;
    const sameCol = prev.col === current.col && current.col === next.col;
    if (!sameRow && !sameCol) result.push(current);
  }
  result.push(path[path.length - 1]);
  return result;
}

function getSharedAudio() {
  const store = globalThis[AUDIO_KEY] || {};
  if (!store.audio) {
    store.audio = new Audio();
    store.audio.preload = 'metadata';
    store.audio.crossOrigin = 'anonymous';
  }
  globalThis[AUDIO_KEY] = store;
  return store.audio;
}

async function findBgmTrack() {
  const keyword = MUSIC_KEYWORDS[Math.floor(Math.random() * MUSIC_KEYWORDS.length)];
  const response = await fetch(`${MUSIC_SEARCH_API}${encodeURIComponent(keyword)}`);
  if (!response.ok) throw new Error('music search failed');
  const list = await response.json();
  const candidates = (Array.isArray(list) ? list : [])
    .map(song => ({
      name: String(song.name || '背景音乐'),
      artist: String(song.artist || '未知'),
      url: String(song.url || '')
    }))
    .filter(song => song.url);
  if (!candidates.length) throw new Error('no music candidates');
  return candidates[Math.floor(Math.random() * Math.min(candidates.length, 10))];
}

function readNumber(key) {
  const value = Number(localStorage.getItem(key) || 0);
  return Number.isFinite(value) ? value : 0;
}

function formatTime(totalSeconds) {
  const safe = Math.max(0, Number(totalSeconds) || 0);
  const minutes = Math.floor(safe / 60);
  const seconds = Math.floor(safe % 60);
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

async function defaultApi(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || '请求失败');
  return data;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function attr(value) {
  return escapeHtml(value);
}
