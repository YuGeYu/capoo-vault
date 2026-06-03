const STORAGE_KEY = 'mmc_ai_chat_state_v1';

const TEXT_MODELS = [
  { id: 'zhipu/glm-4-flash', seedMs: 930 },
  { id: 'qwen/qwen3-8b', seedMs: 980 },
  { id: 'qwen/qwen2.5-7b', seedMs: 1320 },
  { id: 'google/gemma-3-27b', seedMs: 1740 }
].map((model, index) => ({
  ...model,
  success: 1,
  fail: 0,
  latency: model.seedMs,
  lastError: '',
  rank: index + 1
}));

const VISION_MODELS = [
  { id: 'zhipu/glm-4v-flash', seedMs: 760 },
  { id: 'zhipu/glm-4.1v-thinking-flash', seedMs: 920 },
  { id: 'zhipu/glm-4.6v-flash', seedMs: 1640 }
].map(model => ({
  ...model,
  success: 1,
  fail: 0,
  latency: model.seedMs,
  lastError: ''
}));

const SYSTEM_PROMPT = `你是猫猫虫咖波表情包仓库的站内 AI 助手。

网站情况：
- 本站名为“猫猫虫咖波表情包仓库”，主要用于整理、浏览、预览和下载猫猫虫咖波相关表情包、图片和视频资源。
- 公开页面支持按分类查看资源，分类详情页可以预览图片和视频，登录用户可以下载资源。
- 网站有后台工作台，用户可以投稿文件夹，管理员和站长可以审核、管理文件夹、维护公告和站点说明。
- 站内工具包括 AI 抠图、AI 聊天、SBTI 人格测试、CSTI 人格测试和 YSTI 原神人格测试。
- AI 抠图工具在浏览器本地处理图片，不上传原图；普通登录用户每天可下载 10 次抠图结果，抠图会员每天可下载 10000 次。
- 抠图会员月卡价格为 6 元 30 天，用户需要去店铺购买兑换码，回到站内输入兑换码开通。

你的工作方式：
- 优先用简洁、直接、中文的方式回答。
- 如果用户询问本站使用方法，按本站实际功能说明，不要编造不存在的入口。
- 如果用户询问投稿、审核、会员、兑换码、下载额度、AI 抠图等问题，先给操作步骤，再补充注意事项。
- 如果用户上传图片，你可以描述图片内容、帮用户判断适合做什么表情包、给出命名和分类建议。
- 不要声称自己能直接替用户操作后台、发放兑换码或修改数据库；只能说明流程和建议。
- 对不确定的站务数据，要提示以页面实际显示或站长公告为准。`;

export function mountAiChatTool({ root, api, toast }) {
  if (!root) return () => {};

  const request = typeof api === 'function' ? api : defaultApi;
  const state = {
    chatHistory: [],
    pendingImage: '',
    pendingImageName: '',
    isSending: false
  };

  loadState();
  render();

  root.addEventListener('click', onClick);
  root.addEventListener('change', onChange);
  root.addEventListener('keydown', onKeydown);

  return () => saveState();

  function onClick(event) {
    const action = event.target.closest('[data-ai-chat-action]')?.dataset.aiChatAction;
    if (!action) return;
    if (action === 'send') return void sendMessage().catch(handleError);
    if (action === 'clear') return clearChat();
    if (action === 'remove-image') return clearPendingImage();
  }

  function onChange(event) {
    if (!event.target.matches('#ai-chat-image-input')) return;
    handleImageChange(event.target.files?.[0] || null).catch(handleError);
  }

  function onKeydown(event) {
    if (!event.target.matches('#ai-chat-input')) return;
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage().catch(handleError);
    }
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const stored = JSON.parse(raw);
      if (Array.isArray(stored.chatHistory)) state.chatHistory = stored.chatHistory.slice(-30);
      if (typeof stored.pendingImage === 'string') state.pendingImage = stored.pendingImage;
      if (typeof stored.pendingImageName === 'string') state.pendingImageName = stored.pendingImageName;
      restoreModels(stored.textModels, TEXT_MODELS);
      restoreModels(stored.visionModels, VISION_MODELS);
      sortTextModels();
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  function saveState() {
    const payload = {
      chatHistory: state.chatHistory.slice(-30),
      pendingImage: state.pendingImage,
      pendingImageName: state.pendingImageName,
      textModels: TEXT_MODELS.map(({ id, success, fail, latency, lastError, rank }) => ({ id, success, fail, latency, lastError, rank })),
      visionModels: VISION_MODELS.map(({ id, success, fail, latency, lastError }) => ({ id, success, fail, latency, lastError }))
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }

  function render() {
    root.innerHTML = `
      <section class="ai-chat-shell">
        <article class="ai-chat-panel">
          <div class="ai-chat-toolbar">
            <div>
              <span class="notice-badge">AI 聊天</span>
              <h3>猫猫虫站内助手</h3>
              <p class="small">${state.isSending ? 'AI 正在思考...' : '可以问站内功能，也可以上传图片让 AI 帮你看看。'}</p>
            </div>
            <button class="copy-btn" type="button" data-ai-chat-action="clear">发起新对话</button>
          </div>
          <div class="ai-chat-messages" id="ai-chat-messages">
            ${state.chatHistory.length ? state.chatHistory.map(messageBubble).join('') : emptyChat()}
          </div>
          ${state.pendingImage ? pendingImageCard() : ''}
          <div class="ai-chat-composer">
            <label class="copy-btn ai-chat-upload" for="ai-chat-image-input">添加图片</label>
            <input id="ai-chat-image-input" type="file" accept="image/*" hidden>
            <textarea id="ai-chat-input" rows="3" placeholder="输入问题。按 Enter 发送，Shift + Enter 换行。" ${state.isSending ? 'disabled' : ''}></textarea>
            <button class="footer-btn ai-chat-send" type="button" data-ai-chat-action="send" ${state.isSending ? 'disabled' : ''}>${state.isSending ? '发送中...' : '发送'}</button>
          </div>
        </article>
        <aside class="ai-chat-side">
          <div class="admin-item-card">
            <span class="notice-badge">能聊什么</span>
            <h4>站内问题和图片都可以问</h4>
            <p class="small">你可以问怎么投稿、怎么下载、抠图会员怎么兑换，也可以发图片让 AI 帮你描述内容、起名字或想分类。</p>
          </div>
          <div class="admin-item-card">
            <span class="notice-badge">使用提示</span>
            <h4>问题越具体，回答越有用</h4>
            <p class="small">比如直接问“怎么兑换抠图会员”“这张图适合放哪个分类”“投稿后多久公开”，AI 会按本站当前规则给你整理步骤。</p>
          </div>
        </aside>
      </section>
    `;

    requestAnimationFrame(() => {
      const messages = root.querySelector('#ai-chat-messages');
      if (messages) messages.scrollTop = messages.scrollHeight;
      const input = root.querySelector('#ai-chat-input');
      if (input && !state.isSending) input.focus();
    });
  }

  function emptyChat() {
    return `
      <div class="ai-chat-empty">
        <strong>你好，我是猫猫虫仓库的站内 AI 助手。</strong>
        <p>可以问我本站怎么投稿、怎么使用 AI 抠图、会员兑换码怎么用，也可以上传图片让我帮你描述、命名或做表情包分类建议。</p>
      </div>
    `;
  }

  function messageBubble(message) {
    const isUser = message.role === 'user';
    return `
      <article class="ai-chat-message ${isUser ? 'is-user' : 'is-assistant'}">
        <div class="ai-chat-avatar">${isUser ? '你' : 'AI'}</div>
        <div class="ai-chat-bubble">
          <span class="chat-role-tag ${isUser ? 'is-user' : 'is-assistant'}">${isUser ? '你' : 'AI'}</span>
          <p>${escapeHtml(message.content)}</p>
          ${message.imageDataUrl ? `<img class="ai-chat-inline-image" src="${message.imageDataUrl}" alt="用户上传图片">` : ''}
        </div>
      </article>
    `;
  }

  function pendingImageCard() {
    return `
      <div class="ai-chat-pending-image">
        <img src="${state.pendingImage}" alt="待发送图片">
        <div><strong>${escapeHtml(state.pendingImageName || '已选择图片')}</strong><p class="small">发送下一条消息时会一起提交。</p></div>
        <button class="copy-btn" type="button" data-ai-chat-action="remove-image">移除</button>
      </div>
    `;
  }

  async function handleImageChange(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) throw new Error('请上传图片文件。');
    if (file.size > 4 * 1024 * 1024) throw new Error('图片太大，请选择 4MB 以内的图片。');
    state.pendingImage = await fileToDataUrl(file);
    state.pendingImageName = file.name;
    saveState();
    render();
    toast('图片已添加，发送下一条消息时会一起提交。');
  }

  async function sendMessage() {
    const input = root.querySelector('#ai-chat-input');
    const content = String(input?.value || '').trim();
    if (!content || state.isSending) return;

    state.isSending = true;
    if (input) input.value = '';

    appendHistory({
      role: 'user',
      content,
      imageDataUrl: state.pendingImage
    });

    try {
      const useVision = Boolean(state.pendingImage);
      const messages = buildMessagesForApi(useVision);
      const result = useVision ? await routeVisionRequest(messages) : await routeTextRequest(messages);
      appendHistory({ role: 'assistant', content: result.content });
      if (!result.ok) toast('AI 暂时没能完成回答，请稍后再试。', 'error');
    } finally {
      clearPendingImage(false);
      state.isSending = false;
      saveState();
      render();
    }
  }

  function buildMessagesForApi(useVision) {
    const messages = [{ role: 'system', content: SYSTEM_PROMPT }];
    state.chatHistory.slice(-16).forEach(message => {
      if (message.role === 'user' && message.imageDataUrl) {
        if (useVision) {
          messages.push({
            role: 'user',
            content: [
              { type: 'text', text: message.content },
              { type: 'image_url', image_url: { url: message.imageDataUrl } }
            ]
          });
        } else {
          messages.push({ role: 'user', content: `[用户曾在这一轮上传图片] ${message.content}` });
        }
        return;
      }
      messages.push({ role: message.role, content: message.content });
    });
    return messages;
  }

  async function routeTextRequest(messages) {
    const candidates = textCandidates();
    const retries = 1;
    for (const model of candidates) {
      for (let attempt = 0; attempt <= retries; attempt += 1) {
        try {
          const result = await callModel(model.id, messages);
          if (result.ok) {
            recordSuccess(model, result.latency);
            return { ok: true, content: result.content };
          }
          recordFailure(model, result.error);
        } catch (error) {
          recordFailure(model, error?.message || '请求失败');
        }
      }
    }
    return { ok: false, content: '当前暂时无法完成回答，请稍后再试。' };
  }

  async function routeVisionRequest(messages) {
    const model = VISION_MODELS[0];
    try {
      const result = await callModel(model.id, messages);
      if (result.ok) {
        recordSuccess(model, result.latency);
        return { ok: true, content: result.content };
      }
      recordFailure(model, result.error);
    } catch (error) {
      recordFailure(model, error?.message || '请求失败');
    }
    return { ok: false, content: '当前暂时无法识别这张图片，请稍后再试。' };
  }

  async function callModel(modelId, messages) {
    const started = performance.now();
    const result = await request('/api/tools/ai-chat', {
      method: 'POST',
      body: JSON.stringify({
        model: modelId,
        messages,
        temperature: 0.7
      })
    });
    return {
      ok: true,
      latency: Math.round(performance.now() - started),
      content: String(result.content || ''),
      error: ''
    };
  }

  function appendHistory(message) {
    state.chatHistory.push(message);
    state.chatHistory = state.chatHistory.slice(-30);
    saveState();
    render();
  }

  function clearPendingImage(renderNext = true) {
    state.pendingImage = '';
    state.pendingImageName = '';
    const input = root.querySelector('#ai-chat-image-input');
    if (input) input.value = '';
    saveState();
    if (renderNext) render();
  }

  function clearChat() {
    state.chatHistory = [];
    clearPendingImage(false);
    state.isSending = false;
    saveState();
    render();
    toast('聊天记录已清空。');
  }

  function handleError(error) {
    state.isSending = false;
    saveState();
    render();
    toast(error?.message || 'AI 聊天暂时不可用。', 'error');
  }
}

function restoreModels(stored, models) {
  if (!Array.isArray(stored)) return;
  stored.forEach(saved => {
    const model = models.find(item => item.id === saved.id);
    if (model) Object.assign(model, saved);
  });
}

function modelHealth(model) {
  return model.success / Math.max(1, model.success + model.fail);
}

function modelScore(model) {
  return modelHealth(model) * 100000 - (model.latency || 99999);
}

function sortTextModels() {
  TEXT_MODELS.sort((left, right) => modelScore(right) - modelScore(left));
  TEXT_MODELS.forEach((model, index) => {
    model.rank = index + 1;
  });
}

function textCandidates() {
  sortTextModels();
  return [...TEXT_MODELS];
}

function recordSuccess(model, latency) {
  model.success += 1;
  model.latency = Math.round((model.latency * 0.65) + (latency * 0.35));
  model.lastError = '';
}

function recordFailure(model, errorMessage) {
  model.fail += 1;
  model.lastError = errorMessage;
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function defaultApi(url, options = {}) {
  const headers = new Headers(options.headers || {});
  if (!(options.body instanceof FormData) && !headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }
  const response = await fetch(url, { ...options, headers, credentials: 'include' });
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) throw new Error(data.error || '请求失败');
  return data;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}
