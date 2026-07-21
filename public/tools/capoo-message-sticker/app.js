import { GIFEncoder, applyPalette, quantize } from './vendor/gifenc.min.js';

const OLD_STORAGE_KEY = 'mmc_capoo_message_sticker_drafts_v1';
const STORAGE_KEY = 'mmc_capoo_message_sticker_drafts_v2';
const DEFAULT_FONT_ID = 'noto-sans-sc';
const MAX_CHARACTERS = 100;
const GIF_ALPHA_THRESHOLD = 8;

const elements = {
  workspace: document.querySelector('.workspace'),
  grid: document.querySelector('#template-grid'),
  templateCount: document.querySelector('#template-count'),
  selectedNumber: document.querySelector('#selected-number'),
  draftCount: document.querySelector('#draft-count'),
  canvas: document.querySelector('#preview-canvas'),
  canvasLoading: document.querySelector('#canvas-loading'),
  previewState: document.querySelector('#preview-state'),
  input: document.querySelector('#message-input'),
  characterCount: document.querySelector('#character-count'),
  fontOptions: document.querySelector('#font-options'),
  fontHint: document.querySelector('#font-hint'),
  layoutError: document.querySelector('#layout-error'),
  restore: document.querySelector('#restore-button'),
  clear: document.querySelector('#clear-button'),
  clearAll: document.querySelector('#clear-all-button'),
  download: document.querySelector('#download-button'),
  zip: document.querySelector('#zip-button'),
  zipLabel: document.querySelector('#zip-button span'),
  progress: document.querySelector('#export-progress'),
  saveState: document.querySelector('#save-state'),
  toast: document.querySelector('#toast')
};

const state = {
  templates: [],
  templateMap: new Map(),
  fonts: [],
  fontMap: new Map(),
  fontPromises: new Map(),
  fontStatus: new Map(),
  selectedId: '',
  drafts: loadDrafts(),
  images: new Map(),
  fontReady: false,
  renderFits: true,
  exportBusy: false,
  composing: false,
  renderFrame: 0,
  renderToken: 0,
  toastTimer: 0
};

function loadDrafts() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (value?.version === 2 && value.templates && typeof value.templates === 'object') return value.templates;
  } catch {
    // Fall through to the v1 migration path.
  }
  try {
    const legacy = JSON.parse(localStorage.getItem(OLD_STORAGE_KEY) || '{}');
    if (!legacy || typeof legacy !== 'object' || Array.isArray(legacy)) return {};
    return Object.fromEntries(Object.entries(legacy)
      .filter(([, text]) => typeof text === 'string')
      .map(([id, text]) => [id, { text, fontId: DEFAULT_FONT_ID }]));
  } catch {
    return {};
  }
}

function saveDrafts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 2, templates: state.drafts }));
  elements.saveState.textContent = '草稿已保存在当前浏览器';
}

function graphemes(value) {
  if (typeof Intl.Segmenter === 'function') {
    return [...new Intl.Segmenter('zh-CN', { granularity: 'grapheme' }).segment(value)].map(item => item.segment);
  }
  return Array.from(value);
}

function clampText(value) {
  return graphemes(value).slice(0, MAX_CHARACTERS).join('');
}

function selectedTemplate() {
  return state.templateMap.get(state.selectedId);
}

function templateText(template) {
  return state.drafts[template.id]?.text ?? template.defaultText;
}

function templateFontId(template) {
  const fontId = state.drafts[template.id]?.fontId || DEFAULT_FONT_ID;
  return state.fontMap.has(fontId) ? fontId : DEFAULT_FONT_ID;
}

function isTemplateEdited(template) {
  return templateText(template) !== template.defaultText || templateFontId(template) !== DEFAULT_FONT_ID;
}

function setTemplateDraft(template, { text = templateText(template), fontId = templateFontId(template) } = {}) {
  if (text === template.defaultText && fontId === DEFAULT_FONT_ID) delete state.drafts[template.id];
  else state.drafts[template.id] = { text, fontId };
}

function editedTemplates() {
  return state.templates.filter(isTemplateEdited);
}

function showToast(message) {
  clearTimeout(state.toastTimer);
  elements.toast.textContent = message;
  elements.toast.hidden = false;
  state.toastTimer = setTimeout(() => { elements.toast.hidden = true; }, 2600);
}

function loadImage(src) {
  if (!state.images.has(src)) {
    state.images.set(src, new Promise((resolve, reject) => {
      const image = new Image();
      image.decoding = 'async';
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`素材加载失败：${src}`));
      image.src = src;
    }));
  }
  return state.images.get(src);
}

function effectiveFontWeight(config, font) {
  return font.weight === 400 ? 400 : (config.weight || font.weight || 700);
}

function updateFontCards() {
  const selectedId = selectedTemplate() ? templateFontId(selectedTemplate()) : DEFAULT_FONT_ID;
  elements.fontOptions?.querySelectorAll('.font-option').forEach(option => {
    const fontId = option.dataset.fontId;
    const status = state.fontStatus.get(fontId) || 'idle';
    const input = option.querySelector('input');
    input.checked = fontId === selectedId;
    input.disabled = status === 'loading' || status === 'error' || state.exportBusy;
    option.dataset.status = status;
    option.dataset.selected = String(input.checked);
    option.setAttribute('aria-checked', String(input.checked));
    option.querySelector('.font-option-state').textContent = status === 'loading' ? '加载中' : status === 'error' ? '加载失败' : status === 'ready' ? '可用' : '等待加载';
  });
}

function renderFontOptions() {
  elements.fontOptions.innerHTML = state.fonts.map(font => `
    <label class="font-option" data-font-id="${font.id}" data-status="idle" data-selected="false" role="radio" aria-checked="false">
      <input type="radio" name="sticker-font" value="${font.id}" disabled>
      <span class="font-option-check" aria-hidden="true"><i data-lucide="check"></i></span>
      <span class="font-option-name">${font.label}</span>
      <span class="font-option-sample" style="font-family: &quot;${font.family}&quot;, &quot;MMC Noto Sans SC&quot;">${font.sample}</span>
      <span class="font-option-state">等待加载</span>
    </label>
  `).join('');
  window.lucide?.createIcons({ attrs: { 'stroke-width': 2 } });
  updateFontCards();
}

function loadFont(fontId) {
  const font = state.fontMap.get(fontId);
  if (!font) return Promise.reject(new Error(`未知字体：${fontId}`));
  if (state.fontPromises.has(fontId)) return state.fontPromises.get(fontId);
  state.fontStatus.set(fontId, 'loading');
  updateFontCards();
  const promise = (async () => {
    const face = new FontFace(font.family, `url("${font.src}")`, { style: 'normal', weight: String(font.weight) });
    await face.load();
    document.fonts.add(face);
    const descriptor = `${font.weight} 42px "${font.family}"`;
    await document.fonts.load(descriptor, `${font.sample} 简繁中文 ABC 123！？`);
    if (!document.fonts.check(descriptor, font.sample)) throw new Error(`${font.label}加载失败`);
    state.fontStatus.set(fontId, 'ready');
    updateFontCards();
    return font;
  })().catch(error => {
    state.fontStatus.set(fontId, 'error');
    updateFontCards();
    throw error;
  });
  state.fontPromises.set(fontId, promise);
  return promise;
}

function setCanvasFont(ctx, config, size, font) {
  ctx.font = `${effectiveFontWeight(config, font)} ${size}px "${font.family}", "${state.fontMap.get(DEFAULT_FONT_ID).family}"`;
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.miterLimit = 2;
  ctx.fillStyle = config.fill || '#333333';
  ctx.strokeStyle = config.stroke || 'transparent';
  ctx.lineWidth = config.strokeWidth || 0;
}

function lineWidth(ctx, line, spacing) {
  const chars = graphemes(line);
  return chars.reduce((width, char) => width + ctx.measureText(char).width, 0) + Math.max(0, chars.length - 1) * spacing;
}

function wrapHorizontal(ctx, text, config, size) {
  const spacing = config.letterSpacing || 0;
  const lines = [];
  for (const paragraph of text.split('\n')) {
    if (!paragraph) {
      lines.push('');
      continue;
    }
    let line = '';
    for (const char of graphemes(paragraph)) {
      const next = line + char;
      if (line && lineWidth(ctx, next, spacing) > config.box.width) {
        lines.push(line);
        line = char;
      } else {
        line = next;
      }
    }
    lines.push(line);
  }
  const height = lines.length * size * config.lineHeight;
  const fits = lines.length <= config.maxLines && height <= config.box.height && lines.every(line => lineWidth(ctx, line, spacing) <= config.box.width + .5);
  return { lines, height, fits, size };
}

function wrapVertical(text, config, size) {
  const step = size * config.lineHeight;
  const perColumn = Math.max(1, Math.floor(config.box.height / step));
  const columns = [];
  for (const paragraph of text.split('\n')) {
    const chars = graphemes(paragraph);
    if (!chars.length) {
      columns.push([]);
      continue;
    }
    for (let index = 0; index < chars.length; index += perColumn) columns.push(chars.slice(index, index + perColumn));
  }
  const width = columns.length * step;
  const fits = columns.length <= config.maxLines && width <= config.box.width && columns.every(column => column.length * step <= config.box.height + .5);
  return { columns, width, fits, size, step };
}

function fitText(ctx, text, config, font) {
  let lastLayout;
  const startSize = Math.max(config.minFontSize, Math.floor(config.fontSize * (font.sizeScale || 1)));
  for (let size = startSize; size >= config.minFontSize; size -= 1) {
    setCanvasFont(ctx, config, size, font);
    lastLayout = config.writingMode === 'vertical' ? wrapVertical(text, config, size) : wrapHorizontal(ctx, text, config, size);
    if (lastLayout.fits) return lastLayout;
  }
  return { ...lastLayout, fits: false };
}

function paintGlyph(ctx, char, x, y, config) {
  if (config.stroke && config.strokeWidth) ctx.strokeText(char, x, y);
  ctx.fillText(char, x, y);
}

function paintHorizontal(ctx, layout, config) {
  const { box } = config;
  const spacing = config.letterSpacing || 0;
  const lineStep = layout.size * config.lineHeight;
  const top = box.y + (box.height - layout.height) / 2 + lineStep / 2;
  layout.lines.forEach((line, lineIndex) => {
    const width = lineWidth(ctx, line, spacing);
    let x = box.x + (box.width - width) / 2;
    for (const char of graphemes(line)) {
      const charWidth = ctx.measureText(char).width;
      paintGlyph(ctx, char, x + charWidth / 2, top + lineIndex * lineStep, config);
      x += charWidth + spacing;
    }
  });
}

function paintVertical(ctx, layout, config) {
  const { box } = config;
  const totalWidth = layout.columns.length * layout.step;
  const right = box.x + (box.width + totalWidth) / 2 - layout.step / 2;
  layout.columns.forEach((column, columnIndex) => {
    const height = column.length * layout.step;
    const top = box.y + (box.height - height) / 2 + layout.step / 2;
    column.forEach((char, rowIndex) => paintGlyph(ctx, char, right - columnIndex * layout.step, top + rowIndex * layout.step, config));
  });
}

function paintText(ctx, text, config, font) {
  if (!text) return { fits: true, empty: true };
  const layout = fitText(ctx, text, config, font);
  setCanvasFont(ctx, config, layout.size, font);
  ctx.textAlign = 'center';
  ctx.save();
  const rotation = (config.rotation || 0) * Math.PI / 180;
  if (rotation) {
    const cx = config.box.x + config.box.width / 2;
    const cy = config.box.y + config.box.height / 2;
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    ctx.translate(-cx, -cy);
  }
  if (config.writingMode === 'vertical') paintVertical(ctx, layout, config);
  else paintHorizontal(ctx, layout, config);
  ctx.restore();
  return layout;
}

async function renderTemplate(template, text, fontId, canvas = document.createElement('canvas')) {
  const font = await loadFont(fontId);
  canvas.width = 420;
  canvas.height = 350;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const layers = [...template.layers].sort((a, b) => a.z - b.z);
  for (const layer of layers) ctx.drawImage(await loadImage(layer.src), 0, 0, canvas.width, canvas.height);
  const layout = paintText(ctx, text, template.text, font);
  return { canvas, layout, font };
}

async function renderSelected() {
  const token = ++state.renderToken;
  const template = selectedTemplate();
  if (!template || !state.fontReady) return;
  try {
    const fontId = templateFontId(template);
    const { layout, font } = await renderTemplate(template, templateText(template), fontId, elements.canvas);
    if (token !== state.renderToken) return;
    state.renderFits = layout.fits;
    elements.canvasLoading.hidden = true;
    updateLayoutStatus(layout, font);
  } catch (error) {
    if (token !== state.renderToken) return;
    if (templateFontId(template) !== DEFAULT_FONT_ID && state.fontStatus.get(templateFontId(template)) === 'error') {
      setTemplateDraft(template, { fontId: DEFAULT_FONT_ID });
      saveDrafts();
      elements.fontHint.textContent = '字体加载失败，已使用思源黑体。';
      showToast('字体加载失败，已使用思源黑体');
      updateTemplateStates();
      updateFontCards();
      await renderSelected();
      return;
    }
    state.renderFits = false;
    elements.canvasLoading.textContent = `模板 ${template.id} 加载失败`;
    elements.canvasLoading.hidden = false;
    elements.previewState.textContent = error.message;
    elements.layoutError.textContent = error.message;
    elements.layoutError.hidden = false;
  }
  updateControls();
}

function updateLayoutStatus(layout, font) {
  const text = templateText(selectedTemplate());
  if (!layout.fits) {
    elements.previewState.textContent = '文字太长，请删减后再下载';
    elements.layoutError.textContent = '文字太长，请删减。当前内容无法完整放入贴图文字区域。';
    elements.layoutError.hidden = false;
  } else if (!text) {
    elements.previewState.textContent = '当前没有文字，将导出纯素材';
    elements.layoutError.hidden = true;
  } else {
    elements.previewState.textContent = `本地合成 · ${font.label} · ${layout.size}px`;
    elements.layoutError.hidden = true;
  }
}

function scheduleRender() {
  cancelAnimationFrame(state.renderFrame);
  state.renderFrame = requestAnimationFrame(() => renderSelected());
}

function renderTemplateButtons() {
  elements.grid.innerHTML = state.templates.map(template => `
    <button class="template-button" type="button" role="option" data-template-id="${template.id}" data-edited="${isTemplateEdited(template)}" aria-label="选择第 ${template.order} 张贴图" aria-selected="${template.id === state.selectedId}" tabindex="${template.id === state.selectedId ? '0' : '-1'}">
      <span class="template-art" aria-hidden="true">
        <img src="${template.layers[0].src}" alt="" ${template.order > 9 ? 'loading="lazy"' : ''} decoding="async">
        <img src="${template.reference}" alt="" ${template.order > 9 ? 'loading="lazy"' : ''} decoding="async">
      </span>
      <span class="template-check" aria-hidden="true"><i data-lucide="check"></i></span>
      <span class="draft-dot" aria-hidden="true"></span>
    </button>
  `).join('');
  window.lucide?.createIcons({ attrs: { 'stroke-width': 2 } });
}

function updateTemplateStates() {
  elements.grid.querySelectorAll('.template-button').forEach(button => {
    const selected = button.dataset.templateId === state.selectedId;
    button.setAttribute('aria-selected', String(selected));
    button.tabIndex = selected ? 0 : -1;
    button.dataset.edited = String(isTemplateEdited(state.templateMap.get(button.dataset.templateId)));
  });
}

function updateControls() {
  const template = selectedTemplate();
  const fontReady = template && state.fontStatus.get(templateFontId(template)) === 'ready';
  const ready = Boolean(template && state.fontReady && fontReady && !state.exportBusy);
  const count = editedTemplates().length;
  elements.restore.disabled = !ready;
  elements.clear.disabled = !ready;
  elements.clearAll.disabled = !ready || count === 0;
  elements.download.disabled = !ready || !state.renderFits;
  elements.zip.disabled = !ready || count === 0 || !state.renderFits;
  elements.input.disabled = !ready;
  elements.zipLabel.textContent = `打包下载（${count}）`;
  elements.draftCount.textContent = `已编辑 ${count} 张`;
  updateFontCards();
}

function selectTemplate(id, focus = false) {
  const template = state.templateMap.get(id);
  if (!template) return;
  state.selectedId = id;
  elements.input.value = templateText(template);
  elements.selectedNumber.textContent = `第 ${template.order} 张`;
  updateCharacterCount();
  updateTemplateStates();
  updateFontCards();
  loadFont(templateFontId(template)).then(scheduleRender).catch(() => {
    setTemplateDraft(template, { fontId: DEFAULT_FONT_ID });
    saveDrafts();
    elements.fontHint.textContent = '字体加载失败，已使用思源黑体。';
    showToast('字体加载失败，已使用思源黑体');
    loadFont(DEFAULT_FONT_ID).then(scheduleRender);
  });
  if (focus) elements.grid.querySelector(`[data-template-id="${id}"]`)?.focus();
}

function updateCharacterCount() {
  elements.characterCount.textContent = `已用 ${graphemes(elements.input.value).length}/${MAX_CHARACTERS}`;
}

function handleInput() {
  if (state.composing) return;
  const template = selectedTemplate();
  if (!template) return;
  const value = clampText(elements.input.value);
  if (elements.input.value !== value) {
    elements.input.value = value;
    showToast('最多输入 100 个文字');
  }
  setTemplateDraft(template, { text: value });
  saveDrafts();
  updateCharacterCount();
  updateTemplateStates();
  updateControls();
  scheduleRender();
}

function encodeCanvasGif(canvas) {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const rgba = new Uint8Array(imageData.data);
  let transparentPixels = 0;
  for (let index = 0; index < rgba.length; index += 4) {
    if (rgba[index + 3] <= GIF_ALPHA_THRESHOLD) {
      rgba[index] = 0;
      rgba[index + 1] = 0;
      rgba[index + 2] = 0;
      rgba[index + 3] = 0;
      transparentPixels += 1;
    } else {
      rgba[index + 3] = 255;
    }
  }
  if (!transparentPixels) throw new Error('GIF 缺少透明像素');
  const palette = quantize(rgba, 256, {
    format: 'rgba4444',
    oneBitAlpha: GIF_ALPHA_THRESHOLD,
    clearAlpha: true,
    clearAlphaThreshold: GIF_ALPHA_THRESHOLD,
    clearAlphaColor: 0
  });
  const transparentIndex = palette.findIndex(color => color.length === 4 && color[3] === 0);
  if (transparentIndex < 0) throw new Error('GIF 透明色索引生成失败');
  const indexed = applyPalette(rgba, palette, 'rgba4444');
  for (let pixel = 0, offset = 0; offset < rgba.length; pixel += 1, offset += 4) {
    if (rgba[offset + 3] === 0) indexed[pixel] = transparentIndex;
  }
  const encoder = GIFEncoder();
  encoder.writeFrame(indexed, canvas.width, canvas.height, {
    palette,
    transparent: true,
    transparentIndex,
    repeat: -1,
    delay: 0,
    dispose: 1
  });
  encoder.finish();
  const bytes = encoder.bytes();
  if (new TextDecoder('ascii').decode(bytes.subarray(0, 6)) !== 'GIF89a') throw new Error('GIF89a 编码失败');
  return { bytes, paletteSize: palette.length, transparentIndex, transparentPixels };
}

function canvasToGifBlob(canvas) {
  const encoded = encodeCanvasGif(canvas);
  return { ...encoded, blob: new Blob([encoded.bytes], { type: 'image/gif' }) };
}

function filenameFor(template, text) {
  const shortText = graphemes(text || '无文字').slice(0, 12).join('').replace(/[<>:"/\\|?*\x00-\x1F]/g, '_').trim() || '无文字';
  return `咖波讯息贴图-${String(template.order).padStart(2, '0')}-${shortText}.gif`;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function downloadCurrent() {
  const template = selectedTemplate();
  if (!template || !state.renderFits || state.exportBusy) return;
  state.exportBusy = true;
  updateControls();
  elements.progress.textContent = '正在生成透明 GIF';
  try {
    const { canvas, layout } = await renderTemplate(template, templateText(template), templateFontId(template));
    if (!layout.fits) throw new Error('文字太长，请删减');
    downloadBlob(canvasToGifBlob(canvas).blob, filenameFor(template, templateText(template)));
    showToast('当前贴图已下载');
  } catch (error) {
    showToast(error.message);
  } finally {
    state.exportBusy = false;
    elements.progress.textContent = '';
    updateControls();
  }
}

async function downloadZip() {
  const templates = editedTemplates();
  if (!templates.length || state.exportBusy) return;
  state.exportBusy = true;
  updateControls();
  const files = {};
  const failed = [];
  for (const [index, template] of templates.entries()) {
    elements.progress.textContent = `正在生成 ${index + 1}/${templates.length}：第 ${template.order} 张`;
    try {
      const text = templateText(template);
      const { canvas, layout } = await renderTemplate(template, text, templateFontId(template));
      if (!layout.fits) throw new Error('文字太长');
      files[filenameFor(template, text)] = canvasToGifBlob(canvas).bytes;
      await new Promise(resolve => requestAnimationFrame(resolve));
    } catch {
      failed.push(template.id);
    }
  }
  try {
    if (failed.length) throw new Error(`模板 ${failed.join('、')} 生成失败，未创建 ZIP`);
    const zipped = window.fflate.zipSync(files, { level: 6 });
    downloadBlob(new Blob([zipped], { type: 'application/zip' }), `咖波讯息贴图-${templates.length}张.zip`);
    showToast(`已打包 ${templates.length} 张贴图`);
  } catch (error) {
    showToast(error.message);
  } finally {
    state.exportBusy = false;
    elements.progress.textContent = '';
    updateControls();
  }
}

function bindEvents() {
  elements.grid.addEventListener('click', event => {
    const button = event.target.closest('.template-button');
    if (button) selectTemplate(button.dataset.templateId);
  });
  elements.grid.addEventListener('keydown', event => {
    const button = event.target.closest('.template-button');
    if (!button || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    const index = state.templates.findIndex(template => template.id === button.dataset.templateId);
    const desktopColumns = window.innerWidth > 1120 ? 3 : window.innerWidth > 900 ? 2 : 1;
    const delta = event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : event.key === 'ArrowUp' ? -desktopColumns : desktopColumns;
    const next = state.templates[Math.max(0, Math.min(state.templates.length - 1, index + delta))];
    selectTemplate(next.id, true);
  });
  elements.input.addEventListener('compositionstart', () => { state.composing = true; });
  elements.input.addEventListener('compositionend', () => { state.composing = false; handleInput(); });
  elements.input.addEventListener('input', handleInput);
  elements.fontOptions.addEventListener('change', async event => {
    const input = event.target.closest('input[name="sticker-font"]');
    const template = selectedTemplate();
    if (!input || !template) return;
    const previousFontId = templateFontId(template);
    const fontId = input.value;
    setTemplateDraft(template, { fontId });
    saveDrafts();
    updateTemplateStates();
    updateControls();
    elements.canvasLoading.textContent = `正在加载${state.fontMap.get(fontId).label}`;
    elements.canvasLoading.hidden = false;
    try {
      await loadFont(fontId);
      elements.fontHint.textContent = '个别生僻字会回退为思源黑体。';
      await renderSelected();
    } catch {
      setTemplateDraft(template, { fontId: previousFontId === fontId ? DEFAULT_FONT_ID : previousFontId });
      saveDrafts();
      updateTemplateStates();
      updateFontCards();
      elements.fontHint.textContent = '字体加载失败，已使用思源黑体。';
      showToast('字体加载失败，已使用思源黑体');
      await renderSelected();
    }
  });
  elements.restore.addEventListener('click', () => {
    const template = selectedTemplate();
    if (!template) return;
    delete state.drafts[template.id];
    saveDrafts();
    selectTemplate(template.id);
    showToast('已恢复默认文字和思源黑体');
  });
  elements.clear.addEventListener('click', () => {
    if (!confirm('确定清空当前贴图的文字吗？')) return;
    const template = selectedTemplate();
    setTemplateDraft(template, { text: '' });
    saveDrafts();
    selectTemplate(template.id);
  });
  elements.clearAll.addEventListener('click', () => {
    if (!confirm('确定清空全部 24 张贴图草稿吗？此操作无法撤销。')) return;
    state.drafts = {};
    localStorage.removeItem(STORAGE_KEY);
    renderTemplateButtons();
    selectTemplate(state.selectedId);
    showToast('全部草稿已清空');
  });
  elements.download.addEventListener('click', downloadCurrent);
  elements.zip.addEventListener('click', downloadZip);
}

async function initialize() {
  window.lucide?.createIcons({ attrs: { 'stroke-width': 2 } });
  bindEvents();
  try {
    const [templateResponse, fontResponse] = await Promise.all([
      fetch('templates.json'),
      fetch('assets/fonts/fonts.json')
    ]);
    if (!templateResponse.ok) throw new Error(`模板配置加载失败：HTTP ${templateResponse.status}`);
    if (!fontResponse.ok) throw new Error(`字体配置加载失败：HTTP ${fontResponse.status}`);
    const [templateData, fontData] = await Promise.all([templateResponse.json(), fontResponse.json()]);
    state.templates = templateData.templates;
    state.templateMap = new Map(state.templates.map(template => [template.id, template]));
    state.fonts = fontData.fonts;
    state.fontMap = new Map(state.fonts.map(font => [font.id, font]));
    if (!state.fontMap.has(DEFAULT_FONT_ID) || fontData.defaultId !== DEFAULT_FONT_ID) throw new Error('默认字体配置无效');
    state.drafts = Object.fromEntries(Object.entries(state.drafts)
      .filter(([id, draft]) => state.templateMap.has(id) && draft && typeof draft.text === 'string')
      .map(([id, draft]) => [id, {
        text: clampText(draft.text),
        fontId: state.fontMap.has(draft.fontId) ? draft.fontId : DEFAULT_FONT_ID
      }]));
    saveDrafts();
    state.selectedId = state.templates[0].id;
    elements.templateCount.textContent = `${state.templates.length} 张`;
    renderTemplateButtons();
    renderFontOptions();
    elements.input.value = templateText(state.templates[0]);
    updateCharacterCount();
    await loadFont(DEFAULT_FONT_ID);
    state.fontReady = true;
    elements.workspace.setAttribute('aria-busy', 'false');
    elements.canvasLoading.textContent = '正在加载首张素材';
    updateControls();
    await renderSelected();
    const preload = () => {
      state.templates.slice(1, 9).forEach(template => loadImage(template.layers[0].src).catch(() => {}));
      state.fonts.filter(font => font.id !== DEFAULT_FONT_ID).forEach(font => loadFont(font.id).catch(() => {}));
    };
    if (window.requestIdleCallback) window.requestIdleCallback(preload);
    else setTimeout(preload, 0);
  } catch (error) {
    elements.canvasLoading.textContent = error.message;
    elements.previewState.textContent = '工具初始化失败，请刷新后重试';
    showToast(error.message);
  }
}

initialize();
