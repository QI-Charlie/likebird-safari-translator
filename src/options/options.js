import {
  DISPLAY_STYLES,
  PROVIDER_PRESETS,
  SHORTCUT,
  SOURCE_LANGUAGES,
  STYLE_OPTIONS,
  TARGET_LANGUAGES,
} from '../shared/constants.js';
import { isLikelyLocalUrl, linesToArray } from '../shared/utils.js';
import { DEFAULT_SETTINGS, mergeSettings } from '../shared/settings.js';
import { extensionApi, sendRuntimeMessage } from '../shared/storage.js';

const api = extensionApi();
const el = (id) => document.getElementById(id);

let currentSettings = mergeSettings(DEFAULT_SETTINGS);
let loading = true;
let saveTimer = 0;
let toastTimer = 0;
let testInFlight = false;

function send(message) {
  return sendRuntimeMessage(message, 60000);
}

function showToast(message, type = 'info') {
  const toast = el('toast');
  toast.textContent = message;
  toast.className = `toast${type === 'error' ? ' is-error' : ''}`;
  requestAnimationFrame(() => toast.classList.add('is-visible'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3400);
}

function setSaveState(text, variant = '') {
  const state = el('saveState');
  state.textContent = text;
  state.className = `save-state${variant ? ` is-${variant}` : ''}`;
}

function populateStaticSelects() {
  const preset = el('preset');
  for (const [key, value] of Object.entries(PROVIDER_PRESETS)) {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = value.label;
    preset.appendChild(option);
  }

  const target = el('targetLang');
  for (const language of TARGET_LANGUAGES) {
    const option = document.createElement('option');
    option.value = language.code;
    option.textContent = language.label;
    target.appendChild(option);
  }

  const source = el('sourceLang');
  for (const language of SOURCE_LANGUAGES) {
    const option = document.createElement('option');
    option.value = language.code;
    option.textContent = language.label;
    source.appendChild(option);
  }

  const style = el('style');
  for (const option of STYLE_OPTIONS) {
    const node = document.createElement('option');
    node.value = option.value;
    node.textContent = option.label;
    style.appendChild(node);
  }

  const display = el('displayStyle');
  display.innerHTML = '';
  for (const option of DISPLAY_STYLES) {
    const node = document.createElement('option');
    node.value = option.value;
    node.textContent = option.label;
    display.appendChild(node);
  }

  el('sideVersion').textContent = api.runtime.getManifest().version;
  el('aboutVersion').textContent = api.runtime.getManifest().version;
  el('aboutShortcut').textContent = SHORTCUT.mac;
}

function fillForm(settings) {
  loading = true;
  const provider = settings.provider;
  el('preset').value = provider.preset || 'custom';
  el('providerType').value = provider.type || 'openai';
  el('baseUrl').value = provider.baseUrl || '';
  el('apiKey').value = provider.apiKey || '';
  el('model').value = provider.model || '';
  el('temperature').value = String(provider.temperature ?? 0.2);
  el('tempValue').textContent = Number(provider.temperature ?? 0.2).toFixed(1);
  el('maxTokens').value = String(provider.maxTokens ?? 4096);
  el('jsonMode').checked = Boolean(provider.jsonMode);
  el('extraHeaders').value = provider.extraHeaders || '';

  el('targetLang').value = settings.targetLang;
  el('sourceLang').value = settings.sourceLang;
  el('style').value = settings.style;
  el('displayStyle').value = settings.ui.displayStyle;
  el('fontSize').value = String(settings.ui.fontSize);
  el('fontSizeValue').textContent = `${settings.ui.fontSize}px`;
  el('color').value = settings.ui.color;
  el('colorText').value = settings.ui.color;

  const mode = document.querySelector(`input[name="mode"][value="${settings.mode}"]`);
  if (mode) mode.checked = true;
  for (const card of document.querySelectorAll('.mode-card')) {
    card.classList.toggle('is-selected', card.querySelector('input')?.checked || false);
  }

  el('autoSites').value = settings.autoTranslateSites.join('\n');
  el('excludeSites').value = settings.excludeSites.join('\n');
  el('skipTargetLanguage').checked = settings.skipTargetLanguagePages;
  el('selectionEnabled').checked = settings.selection.enabled;
  el('selectionAuto').checked = settings.selection.auto;
  el('glossary').value = settings.glossary;
  el('customPrompt').value = settings.customPrompt;

  el('cacheEnabled').checked = settings.cache.enabled;
  el('cacheMax').value = String(settings.cache.maxEntries);
  el('batchItems').value = String(settings.batch.maxItems);
  el('concurrency').value = String(settings.batch.concurrency);
  el('timeout').value = String(Math.round(settings.advanced.timeoutMs / 1000));

  updatePresetHint();
  updateBaseUrlHelp();
  updatePreview();
  updateConfigBadge();
  loading = false;
}

function updatePresetHint() {
  const preset = PROVIDER_PRESETS[el('preset').value];
  el('presetHint').textContent = preset?.hint || '自定义兼容接口';
}

function updateBaseUrlHelp() {
  const value = el('baseUrl').value.trim();
  if (!value) {
    el('baseUrlHelp').textContent = '以 /v1 结尾的地址会自动补全请求路径。';
    el('baseUrlHelp').classList.remove('is-warning');
    return;
  }
  try {
    const url = new URL(value);
    if (url.protocol === 'http:' && !isLikelyLocalUrl(value)) {
      el('baseUrlHelp').textContent = '⚠ 非 HTTPS 的远程地址可能被 Safari 阻止，建议使用 HTTPS。';
      el('baseUrlHelp').classList.add('is-warning');
      return;
    }
  } catch {
    // Keep the neutral hint while the user is typing.
  }
  el('baseUrlHelp').textContent = '以 /v1 结尾的地址会自动补全请求路径。';
  el('baseUrlHelp').classList.remove('is-warning');
}

function updateConfigBadge() {
  const provider = currentSettings.provider;
  const configured = Boolean(
    provider.baseUrl &&
      provider.model &&
      (provider.apiKey || isLikelyLocalUrl(provider.baseUrl) || PROVIDER_PRESETS[provider.preset]?.keyless),
  );
  const badge = el('configBadge');
  badge.textContent = configured ? '已配置' : '未配置';
  badge.classList.toggle('is-ready', configured);
}

function updatePreview() {
  const size = Number(el('fontSize').value) || 15;
  const color = /^#[0-9a-f]{6}$/i.test(el('colorText').value) ? el('colorText').value : '#4a4842';
  const display = el('displayStyle').value;
  const mode = document.querySelector('input[name="mode"]:checked')?.value || 'bilingual';
  const card = el('preview');
  card.dataset.display = display;
  card.dataset.mode = mode;
  const translation = el('previewTranslation');
  translation.style.fontSize = `${size}px`;
  translation.style.color = color;
  el('fontSizeValue').textContent = `${size}px`;
  document.querySelector('.preview-tag').textContent =
    mode === 'replace' ? '仅看译文 · 自然流畅' : '双语 · 自然流畅';
}

function collectForm() {
  const provider = {
    preset: el('preset').value,
    type: el('providerType').value,
    baseUrl: el('baseUrl').value.trim(),
    apiKey: el('apiKey').value.trim(),
    model: el('model').value.trim(),
    temperature: Number(el('temperature').value),
    maxTokens: Number(el('maxTokens').value),
    jsonMode: el('jsonMode').checked,
    extraHeaders: el('extraHeaders').value,
  };
  const mode = document.querySelector('input[name="mode"]:checked')?.value || 'bilingual';
  const color = /^#[0-9a-f]{6}$/i.test(el('colorText').value)
    ? el('colorText').value
    : DEFAULT_SETTINGS.ui.color;
  return mergeSettings({
    ...currentSettings,
    provider,
    targetLang: el('targetLang').value,
    sourceLang: el('sourceLang').value,
    style: el('style').value,
    mode,
    autoTranslateSites: linesToArray(el('autoSites').value),
    excludeSites: linesToArray(el('excludeSites').value),
    skipTargetLanguagePages: el('skipTargetLanguage').checked,
    glossary: el('glossary').value,
    customPrompt: el('customPrompt').value,
    selection: {
      enabled: el('selectionEnabled').checked,
      auto: el('selectionAuto').checked,
    },
    cache: {
      enabled: el('cacheEnabled').checked,
      maxEntries: Number(el('cacheMax').value),
    },
    batch: {
      maxItems: Number(el('batchItems').value),
      concurrency: Number(el('concurrency').value),
    },
    ui: {
      fontSize: Number(el('fontSize').value),
      color,
      displayStyle: el('displayStyle').value,
    },
    advanced: {
      ...currentSettings.advanced,
      timeoutMs: Number(el('timeout').value) * 1000,
    },
  });
}

async function persist() {
  if (loading) return;
  const next = collectForm();
  currentSettings = next;
  setSaveState('保存中…', 'saving');
  try {
    const response = await send({ type: 'settings.update', patch: next });
    if (!response?.ok) throw new Error(response?.error?.message || response?.error || '保存失败');
    setSaveState('已保存');
    updateConfigBadge();
  } catch (error) {
    setSaveState('保存失败', 'error');
    showToast(error.message || '保存设置失败', 'error');
  }
}

function scheduleSave() {
  if (loading) return;
  clearTimeout(saveTimer);
  setSaveState('有未保存的更改…', 'saving');
  saveTimer = setTimeout(() => persist(), 450);
}

function applyPreset() {
  const preset = PROVIDER_PRESETS[el('preset').value];
  if (!preset || el('preset').value === 'custom') {
    updatePresetHint();
    return;
  }
  el('providerType').value = preset.type;
  el('baseUrl').value = preset.baseUrl;
  el('model').value = preset.model;
  el('jsonMode').checked = Boolean(preset.jsonMode);
  updatePresetHint();
  updateBaseUrlHelp();
  updateConfigBadge();
  scheduleSave();
}

async function testConnection() {
  if (testInFlight) return;
  testInFlight = true;
  const spinner = el('testSpinner');
  const result = el('testResult');
  spinner.hidden = false;
  el('testLabel').textContent = '测试中…';
  el('testConnection').disabled = true;
  result.className = 'test-result';
  result.textContent = '正在向接口发送一条最小翻译请求…';
  const provider = collectForm().provider;
  try {
    const response = await send({
      type: 'api.test',
      provider,
      targetLang: el('targetLang').value,
    });
    if (!response?.ok) throw new Error(response?.error?.message || response?.error || '连接失败');
    const sample = response.result?.sample ? `，返回「${response.result.sample}」` : '';
    result.textContent = `连接成功 · ${response.result.latencyMs} ms${sample}`;
    result.className = 'test-result is-ok';
    showToast('API 连接正常');
  } catch (error) {
    result.textContent = error.message || '连接失败，请检查地址、Key 和模型名';
    result.className = 'test-result is-error';
  } finally {
    testInFlight = false;
    spinner.hidden = true;
    el('testLabel').textContent = '测试连接';
    el('testConnection').disabled = false;
  }
}

async function clearCache() {
  if (!window.confirm('清除本机保存的全部翻译缓存？')) return;
  try {
    const response = await send({ type: 'cache.clear' });
    if (!response?.ok) throw new Error(response?.error?.message || '清除失败');
    showToast('翻译缓存已清除');
  } catch (error) {
    showToast(error.message || '清除缓存失败', 'error');
  }
}

function exportSettings() {
  const copy = JSON.parse(JSON.stringify(currentSettings));
  delete copy.provider.apiKey;
  const payload = {
    app: 'yiliu',
    exportedAt: new Date().toISOString(),
    settings: copy,
  };
  const blob = new Blob([`${JSON.stringify(payload, null, 2)}\n`], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `yiliu-settings-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast('设置已导出（不含 API Key）');
}

async function importSettings(file) {
  if (!file) return;
  try {
    const text = await file.text();
    const raw = JSON.parse(text);
    const imported = raw.settings || raw;
    const merged = mergeSettings({
      ...currentSettings,
      ...imported,
      provider: {
        ...currentSettings.provider,
        ...(imported.provider || {}),
        apiKey: imported.provider?.apiKey || currentSettings.provider.apiKey,
      },
    });
    currentSettings = merged;
    fillForm(currentSettings);
    await persist();
    showToast('设置已导入');
  } catch (error) {
    showToast(error.message || '导入失败：不是有效的设置文件', 'error');
  } finally {
    el('importFile').value = '';
  }
}

async function resetSettings() {
  if (!window.confirm('恢复所有默认设置？API Key 和站点规则也会清空。')) return;
  currentSettings = mergeSettings(DEFAULT_SETTINGS);
  currentSettings.provider.apiKey = '';
  fillForm(currentSettings);
  await persist();
  showToast('已恢复默认设置');
}

function bindEvents() {
  const autoSaveFields = [
    'preset',
    'providerType',
    'baseUrl',
    'apiKey',
    'model',
    'temperature',
    'maxTokens',
    'jsonMode',
    'extraHeaders',
    'targetLang',
    'sourceLang',
    'style',
    'displayStyle',
    'fontSize',
    'color',
    'colorText',
    'autoSites',
    'excludeSites',
    'skipTargetLanguage',
    'selectionEnabled',
    'selectionAuto',
    'glossary',
    'customPrompt',
    'cacheEnabled',
    'cacheMax',
    'batchItems',
    'concurrency',
    'timeout',
  ];
  for (const id of autoSaveFields) {
    const node = el(id);
    if (!node) continue;
    node.addEventListener('input', () => {
      updatePreview();
      updateBaseUrlHelp();
      scheduleSave();
    });
    node.addEventListener('change', () => {
      if (id === 'preset') applyPreset();
      else scheduleSave();
    });
  }

  for (const radio of document.querySelectorAll('input[name="mode"]')) {
    radio.addEventListener('change', () => {
      for (const card of document.querySelectorAll('.mode-card')) {
        card.classList.toggle('is-selected', card.querySelector('input')?.checked || false);
      }
      updatePreview();
      scheduleSave();
    });
  }

  el('temperature').addEventListener('input', () => {
    el('tempValue').textContent = Number(el('temperature').value).toFixed(1);
  });
  el('fontSize').addEventListener('input', () => {
    el('fontSizeValue').textContent = `${el('fontSize').value}px`;
  });
  el('color').addEventListener('input', () => {
    el('colorText').value = el('color').value;
  });
  el('colorText').addEventListener('input', () => {
    if (/^#[0-9a-f]{6}$/i.test(el('colorText').value)) el('color').value = el('colorText').value;
  });
  el('resetColor').addEventListener('click', () => {
    el('color').value = DEFAULT_SETTINGS.ui.color;
    el('colorText').value = DEFAULT_SETTINGS.ui.color;
    updatePreview();
    scheduleSave();
  });

  el('toggleKey').addEventListener('click', () => {
    const input = el('apiKey');
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    el('toggleKey').textContent = show ? '隐藏' : '显示';
  });
  el('testConnection').addEventListener('click', testConnection);
  el('testTop').addEventListener('click', testConnection);
  el('clearCache').addEventListener('click', clearCache);
  el('exportSettings').addEventListener('click', exportSettings);
  el('importSettings').addEventListener('click', () => el('importFile').click());
  el('importFile').addEventListener('change', (event) =>
    importSettings(event.target.files?.[0] || null),
  );
  el('resetSettings').addEventListener('click', resetSettings);

  document.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

function observeSections() {
  if (!('IntersectionObserver' in window)) return;
  const links = new Map(
    [...document.querySelectorAll('.nav-link')].map((link) => [link.dataset.nav, link]),
  );
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        for (const link of links.values()) link.classList.remove('is-active');
        links.get(entry.target.id)?.classList.add('is-active');
      }
    },
    { rootMargin: '-15% 0px -65% 0px', threshold: 0 },
  );
  document.querySelectorAll('.section').forEach((section) => observer.observe(section));
}

async function init() {
  populateStaticSelects();
  bindEvents();
  try {
    const response = await send({ type: 'settings.full' });
    if (response?.ok && response.settings) {
      currentSettings = mergeSettings(response.settings);
    }
  } catch (error) {
    showToast(error.message || '无法读取设置，已使用默认值', 'error');
  }
  fillForm(currentSettings);
  observeSections();
  setSaveState('所有更改已保存');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
