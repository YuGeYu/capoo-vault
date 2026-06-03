export function mountAiApiTool({ root, api, toast }) {
  if (!root) return () => {};

  const state = {
    loading: true,
    creating: false,
    redeeming: false,
    busyKeyId: '',
    data: null,
    revealedKeys: {}
  };

  load().catch(handleError);
  root.addEventListener('click', onClick);
  root.addEventListener('submit', onSubmit);

  return () => {};

  async function load() {
    state.loading = true;
    render();
    state.data = await api('/api/dashboard/ai-api');
    state.loading = false;
    render();
  }

  function onClick(event) {
    const action = event.target.closest('[data-ai-api-action]')?.dataset.aiApiAction;
    if (!action) return;
    const keyId = event.target.closest('[data-key-id]')?.dataset.keyId || '';
    if (action === 'create') return void createKey().catch(handleError);
    if (action === 'reset') return void resetKey(keyId).catch(handleError);
    if (action === 'enable') return void updateKey(keyId, { status: 'active' }).catch(handleError);
    if (action === 'disable') return void updateKey(keyId, { status: 'disabled' }).catch(handleError);
    if (action === 'copy-key') return void copyKey(keyId).catch(handleError);
    if (action === 'copy-example') return void copyExample().catch(handleError);
    if (action === 'copy-response') return void copyResponseExample().catch(handleError);
    if (action === 'buy-code') return buyCode();
    if (action === 'redeem-code') return void redeemCode().catch(handleError);
  }

  function onSubmit(event) {
    const form = event.target.closest('[data-ai-api-note-form]');
    if (!form) return;
    event.preventDefault();
    const keyId = form.getAttribute('data-ai-api-note-form');
    const note = new FormData(form).get('note');
    updateKey(keyId, { note }).catch(handleError);
  }

  async function createKey() {
    if (state.creating) return;
    const limits = state.data?.limits || {};
    if ((limits.keyCount || 0) >= (limits.keyLimit || 0)) {
      toast(`当前身份最多可申请 ${limits.keyLimit || 0} 个 API Key`, 'error');
      return;
    }

    state.creating = true;
    render();
    const result = await api('/api/dashboard/ai-api/key', {
      method: 'POST',
      body: JSON.stringify({ note: defaultKeyNote() })
    });
    if (result.keyId && result.apiKey) state.revealedKeys[result.keyId] = result.apiKey;
    state.data = result.dashboard || state.data;
    state.creating = false;
    render();
    toast(result.message || 'API Key 已生成');
  }

  async function resetKey(keyId) {
    if (!keyId || state.busyKeyId) return;
    if (!window.confirm('重置后旧 API Key 会立即失效，确认继续吗？')) return;
    state.busyKeyId = keyId;
    render();
    const result = await api(`/api/dashboard/ai-api/key/${encodeURIComponent(keyId)}/reset`, {
      method: 'POST',
      body: JSON.stringify({})
    });
    if (result.keyId && result.apiKey) state.revealedKeys[result.keyId] = result.apiKey;
    state.data = result.dashboard || state.data;
    state.busyKeyId = '';
    render();
    toast(result.message || 'API Key 已重置');
  }

  async function updateKey(keyId, patch) {
    if (!keyId || state.busyKeyId) return;
    state.busyKeyId = keyId;
    render();
    const result = await api(`/api/dashboard/ai-api/key/${encodeURIComponent(keyId)}`, {
      method: 'PATCH',
      body: JSON.stringify(patch)
    });
    state.data = result.dashboard || state.data;
    state.busyKeyId = '';
    render();
    toast(result.message || 'API Key 已更新');
  }

  async function copyKey(keyId) {
    const value = state.revealedKeys[keyId];
    if (!value) return;
    await navigator.clipboard.writeText(value);
    toast('API Key 已复制');
  }

  async function copyExample() {
    await navigator.clipboard.writeText(exampleCode());
    toast('Python 调用示例已复制');
  }

  async function copyResponseExample() {
    await navigator.clipboard.writeText(responseExample());
    toast('返回示例已复制');
  }

  function buyCode() {
    const shopUrl = state.data?.redeem?.shopUrl || 'https://pay.ldxp.cn/shop/lbtvjbtv';
    window.open(shopUrl, '_blank', 'noopener,noreferrer');
    toast('店铺已在新标签页打开，购买后回到这里填写兑换码。', 'info');
  }

  async function redeemCode() {
    if (state.redeeming) return;
    const input = root.querySelector('#ai-api-redeem-code');
    const code = String(input?.value || '').trim();
    if (!code) {
      toast('请输入兑换码。', 'error');
      return;
    }

    state.redeeming = true;
    render();
    const result = await api('/api/dashboard/ai-api/redeem', {
      method: 'POST',
      body: JSON.stringify({ code })
    });
    state.data = result.dashboard || state.data;
    state.redeeming = false;
    render();
    toast(result.message || '兑换成功');
  }

  function render() {
    if (state.loading) {
      root.innerHTML = '<section class="admin-panel"><p class="small">正在读取 AI 对话 API 信息...</p></section>';
      return;
    }

    const data = state.data || {};
    const billing = data.billing || {};
    const keys = Array.isArray(data.keys) ? data.keys : data.key ? [data.key] : [];
    const pricing = data.pricing || {};
    const redeem = data.redeem || {};
    const limits = data.limits || { keyCount: keys.length, keyLimit: billing.membershipActive ? 100 : 10 };
    root.innerHTML = `
      <section class="ai-api-layout">
        <article class="admin-panel ai-api-apply-panel">
          <div class="admin-panel-head">
            <div>
              <h3>我的 API Key</h3>
              <p class="small admin-panel-intro">普通用户最多可申请 10 个 Key，API 会员最多可申请 100 个 Key。完整 Key 只会在生成或重置时显示一次。</p>
            </div>
            <button class="footer-btn footer-btn-small" type="button" data-ai-api-action="create" ${state.creating || limits.keyCount >= limits.keyLimit ? 'disabled' : ''}>${state.creating ? '生成中...' : '新增 Key'}</button>
          </div>
          <div class="admin-panel-body">
            <div class="rembg-quota-grid">
              <div class="rembg-quota-item"><span>当前身份</span><strong>${billing.membershipActive ? 'API 调用会员' : '普通用户'}</strong></div>
              <div class="rembg-quota-item"><span>Key 数量</span><strong>${limits.keyCount || keys.length} / ${limits.keyLimit || 0}</strong></div>
              <div class="rembg-quota-item"><span>账户余额</span><strong>￥${escapeHtml(billing.balance || '0.000')}</strong></div>
              <div class="rembg-quota-item"><span>今日免费剩余</span><strong>${billing.usage?.freeRemaining || 0}</strong></div>
            </div>
            <div class="ai-api-key-list">
              ${keys.length ? keys.map(keyCard).join('') : emptyKeyCard()}
            </div>
          </div>
        </article>

        <article class="admin-panel">
          <div class="admin-panel-head"><div><h3>价格和规则</h3></div></div>
          <div class="admin-panel-body">
            <div class="admin-card-list">
              <article class="admin-item-card">
                <span class="notice-badge">普通用户</span>
                <h4>每天前 ${pricing.free?.dailyFreeCalls || 50} 次成功调用免费</h4>
                <p>超过后按 ￥${pricing.free?.overagePrice || '0.003'} / 次扣余额，需要提前充值。</p>
              </article>
              <article class="admin-item-card">
                <span class="notice-badge">API 调用会员</span>
                <h4>每天前 ${pricing.member?.dailyFreeCalls || 500} 次成功调用免费</h4>
                <p>超过后按 ￥${pricing.member?.overagePrice || '0.001'} / 次扣余额，会员月卡为 ￥${pricing.member?.suggestedPrice || '6.00'} / ${pricing.member?.durationDays || 30} 天。</p>
              </article>
              <article class="admin-item-card">
                <span class="notice-badge">注意</span>
                <h4>失败不计费，太长上下文可能失败</h4>
                <p>调用失败、余额不足、参数错误、上下文过长导致失败，都不会算成功次数，也不会扣余额。请只提交必要的历史消息。</p>
              </article>
            </div>
          </div>
        </article>

        <article class="admin-panel">
          <div class="admin-panel-head">
            <div>
              <h3>兑换码</h3>
              <p class="small admin-panel-intro">购买兑换码后回到这里填写。API会员月卡为 ￥6.00 / 30 天，也可以兑换 1 元或 10 元 API 余额。</p>
            </div>
            <button class="footer-btn footer-btn-small" type="button" data-ai-api-action="buy-code">购买兑换码</button>
          </div>
          <div class="admin-panel-body">
            <div class="admin-card-list">
              ${(redeem.products || defaultRedeemProducts()).map(productCard).join('')}
            </div>
            <div class="rembg-redeem-row">
              <input id="ai-api-redeem-code" type="text" autocomplete="off" placeholder="输入 API 兑换码">
              <button class="footer-btn footer-btn-small" type="button" data-ai-api-action="redeem-code" ${state.redeeming ? 'disabled' : ''}>${state.redeeming ? '正在兑换...' : '兑换'}</button>
            </div>
          </div>
        </article>

        <article class="admin-panel ai-api-doc-panel">
          <div class="admin-panel-head">
            <div>
              <h3>调用方式</h3>
              <p class="small admin-panel-intro">只需要传入消息内容即可。本站会自动处理后面的 AI 服务，不需要填写模型参数。</p>
            </div>
            <button class="copy-btn" type="button" data-ai-api-action="copy-example">复制 Python 示例</button>
          </div>
          <div class="admin-panel-body">
            <pre class="ai-api-code"><code>${escapeHtml(exampleCode())}</code></pre>
          </div>
        </article>

        <article class="admin-panel ai-api-doc-panel">
          <div class="admin-panel-head">
            <div>
              <h3>返回示例</h3>
              <p class="small admin-panel-intro">下面是一次真实调用后的返回格式。实际回复内容会根据你的问题变化。</p>
            </div>
            <button class="copy-btn" type="button" data-ai-api-action="copy-response">复制返回示例</button>
          </div>
          <div class="admin-panel-body">
            <pre class="ai-api-code"><code>${escapeHtml(responseExample())}</code></pre>
          </div>
        </article>
      </section>
    `;
  }

  function productCard(product) {
    return `
      <article class="admin-item-card">
        <span class="notice-badge">${escapeHtml(product.label)}</span>
        <h4>￥${escapeHtml(product.price || product.amount || '0.00')}</h4>
        <p>${product.durationDays ? `${Number(product.durationDays)} 天 API 会员月卡。` : `兑换后增加 ￥${escapeHtml(product.amount || '0.000')} API 余额。`}</p>
      </article>
    `;
  }

  function keyCard(key) {
    const revealed = state.revealedKeys[key.id] || '';
    const busy = state.busyKeyId === key.id;
    return `
      <article class="admin-item-card ai-api-key-card" data-key-id="${escapeAttr(key.id)}">
        <div class="folder-status">
          <span class="notice-badge">${key.status === 'active' ? '可用' : '已禁用'}</span>
          <span class="small">${escapeHtml(key.keyPrefix)}...</span>
        </div>
        ${revealed ? keyRevealCard(key.id, revealed) : ''}
        <form class="admin-form compact-form" data-ai-api-note-form="${escapeAttr(key.id)}">
          <label class="field">
            <span>备注</span>
            <input name="note" maxlength="80" value="${escapeAttr(key.note || '')}" placeholder="例如：网站后端、机器人、测试脚本">
          </label>
          <div class="review-button-row">
            <button class="footer-btn footer-btn-small" type="submit" ${busy ? 'disabled' : ''}>保存备注</button>
            <button class="copy-btn" type="button" data-ai-api-action="${key.status === 'active' ? 'disable' : 'enable'}" ${busy ? 'disabled' : ''}>${key.status === 'active' ? '禁用' : '启用'}</button>
            <button class="copy-btn" type="button" data-ai-api-action="reset" ${busy ? 'disabled' : ''}>重置</button>
          </div>
        </form>
        <p class="small">创建：${formatDate(key.createdAt)}${key.lastUsedAt ? ` · 最近调用：${formatDate(key.lastUsedAt)}` : ''}</p>
      </article>
    `;
  }

  function keyRevealCard(keyId, value) {
    return `
      <div class="ai-api-key-reveal">
        <strong>请立即保存这个 API Key</strong>
        <code>${escapeHtml(value)}</code>
        <button class="footer-btn footer-btn-small" type="button" data-ai-api-action="copy-key" data-key-id="${escapeAttr(keyId)}">复制 Key</button>
      </div>
    `;
  }

  function emptyKeyCard() {
    return `
      <article class="admin-item-card">
        <span class="notice-badge">未申请</span>
        <h4>还没有 API Key</h4>
        <p>点击上方“新增 Key”后，会显示一次完整 Key。请立即保存到你的程序配置里。</p>
      </article>
    `;
  }

  function exampleCode() {
    return `import requests

url = "https://maomaochongmiao.600318.xyz/api/open/ai-chat"
api_key = "你的_API_Key"

response = requests.post(
    url,
    headers={
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    },
    json={
        "messages": [
            {"role": "user", "content": "请用一句话介绍猫猫虫咖波表情包仓库的 AI API。"}
        ],
        "temperature": 0.7,
    },
    timeout=60,
)

response.raise_for_status()
data = response.json()
print(data["reply"])`;
  }

  function responseExample() {
    return `{
  "ok": true,
  "reply": "猫猫虫咖波表情包仓库的 AI API 可以让你的程序通过简单的 HTTP 请求调用本站提供的 AI 对话能力。",
  "usage": {
    "charged": false,
    "cost": "0.000",
    "todaySuccessCount": 1,
    "todayFreeLimit": 50,
    "balance": "0.000",
    "membershipActive": false,
    "pricePerCall": "0.003"
  }
}`;
  }

  function defaultKeyNote() {
    const count = state.data?.limits?.keyCount || state.data?.keys?.length || 0;
    return `Key ${count + 1}`;
  }

  function defaultRedeemProducts() {
    return [
      { label: 'API会员月卡', price: '6.00', durationDays: 30 },
      { label: 'API余额1元兑换码', price: '1.00', amount: '1.000' },
      { label: 'API余额10元兑换码', price: '10.00', amount: '10.000' }
    ];
  }

  function handleError(error) {
    state.loading = false;
    state.creating = false;
    state.redeeming = false;
    state.busyKeyId = '';
    render();
    toast(error?.message || 'AI 对话 API 信息读取失败', 'error');
  }
}

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('zh-CN', { hour12: false });
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

function escapeAttr(value) {
  return escapeHtml(value);
}
