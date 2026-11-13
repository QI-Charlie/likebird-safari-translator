import {
  BRAND,
  PROVIDER_PRESETS,
  SOURCE_LANGUAGES,
  STYLE_OPTIONS,
  TARGET_LANGUAGES,
} from '../shared/constants.js';
import { DEFAULT_SETTINGS, isProviderConfigured, mergeSettings, providerRequiresKey } from '../shared/settings.js';
import { sendRuntimeMessage } from '../shared/storage.js';
import { linesToArray } from '../shared/utils.js';
import { initSite } from './site.js';

const el = (id) => document.getElementById(id);
const providerFields = {
  preset: 'preset', type: 'providerType', baseUrl: 'baseUrl', apiKey: 'apiKey',
  model: 'model', temperature: 'temperature', maxTokens: 'maxTokens',
  jsonMode: 'jsonMode', extraHeaders: 'extraHeaders',
};
const preferenceFields = {
  targetLang: 'targetLang', sourceLang: 'sourceLang', style: 'style',
  selectionEnabled: 'selection.enabled', selectionAuto: 'selection.auto',
  autoSites: 'autoTranslateSites', excludeSites: 'excludeSites',
  skipTargetLanguage: 'skipTargetLanguagePages', sendPageContext: 'advanced.sendPageContext',
  glossary: 'glossary', customPrompt: 'customPrompt', cacheEnabled: 'cache.enabled',
};

let saved = mergeSettings({});
let writes = Promise.resolve();
let pendingPreferences = 0;
let connecting = false;

async function send(message, timeout = 60000) {
  const response = await sendRuntimeMessage(message, timeout);
  if (!response?.ok) throw new Error(response?.error?.message || response?.error || '请求失败，请重试');
  return response;
}

function feedback(id, message, error = false) {
  const node = el(id);
  node.textContent = message;
  node.toggleAttribute('data-error', error);
}

function fillSelect(id, choices) {
  for (const [value, label] of choices) {
    el(id).add(new Option(label, value));
  }
}

function setField(id, value) {
  const field = el(id);
  if (field.type === 'checkbox') field.checked = Boolean(value);
  else field.value = Array.isArray(value) ? value.join('\n') : value;
}

function readField(id) {
  const field = el(id);
  if (field.type === 'checkbox') return field.checked;
  if (field.type === 'number') return field.valueAsNumber;
  if (id === 'autoSites' || id === 'excludeSites') return linesToArray(field.value);
  return field.value;
}

function readProvider() {
  const provider = Object.fromEntries(
    Object.entries(providerFields).map(([key, id]) => [key, readField(id)]),
  );
  return mergeSettings({ provider }).provider;
}

function updateConnectionView() {
  const draft = readProvider();
  const requiresKey = providerRequiresKey(draft);
  el('keyField').hidden = !requiresKey && !draft.apiKey && draft.preset !== 'custom';
  el('providerHint').textContent = draft.preset === 'custom'
    ? '请在高级连接参数中填写接口协议、API 地址和模型名称。'
    : requiresKey
      ? ['API Key 保存在本机，请求直接发给所选服务。',
          ['qwen', 'zhipu', 'moonshot'].includes(draft.preset) && PROVIDER_PRESETS[draft.preset].hint].filter(Boolean).join(' ')
      : '请先启动本地模型服务，再连接。';
  el('providerHelp').hidden = !requiresKey;
  const status = el('providerStatus');
  const same = Object.keys(providerFields).every((key) => draft[key] === saved.provider[key]);
  const ready = same && isProviderConfigured(saved);
  status.textContent = ready ? '已配置' : '';
  status.toggleAttribute('data-ready', ready);
  if (!connecting) el('connectLabel').textContent = ready ? '重新连接' : '连接服务';
}

function fillProvider(provider) {
  for (const [key, id] of Object.entries(providerFields)) setField(id, provider[key]);
  el('apiKey').type = 'password';
  el('toggleKey').textContent = '显示';
  updateConnectionView();
}

function fillPreferences() {
  for (const [id, path] of Object.entries(preferenceFields)) {
    const [key, subkey] = path.split('.');
    setField(id, subkey ? saved[key][subkey] : saved[key]);
  }
  el('selectionAuto').disabled = !saved.selection.enabled;
}

function selectProvider() {
  const preset = el('preset').value;
  const { type, baseUrl, model, jsonMode } = PROVIDER_PRESETS[preset];
  // A key and custom headers are scoped to the service where they were entered.
  const provider = preset === saved.provider.preset
    ? saved.provider
    : { ...DEFAULT_SETTINGS.provider, preset, type, baseUrl, model, jsonMode };
  fillProvider(provider);
  el('apiDetails').open = preset === 'custom';
  feedback('connectionResult', '');
}

function writeSettings(patch) {
  const request = writes.then(async () => {
    await send({ type: 'settings.update', patch });
    const next = { ...saved, ...patch };
    for (const key of ['provider', 'selection', 'ui', 'advanced']) {
      if (patch[key]) next[key] = { ...saved[key], ...patch[key] };
    }
    saved = mergeSettings(next);
  });
  writes = request.catch(() => {});
  return request;
}

async function connect(event) {
  event.preventDefault();
  if (connecting) return;
  const provider = readProvider();
  if (providerRequiresKey(provider) && !provider.apiKey) {
    feedback('connectionResult', '请填写 API Key。', true);
    el('apiKey').focus();
    return;
  }
  if (!provider.baseUrl || !provider.model) {
    el('apiDetails').open = true;
    feedback('connectionResult', '请填写 API 地址和模型名称。', true);
    el(provider.baseUrl ? 'model' : 'baseUrl').focus();
    return;
  }
  connecting = true;
  el('connectionFields').disabled = true;
  el('connectLabel').textContent = '正在连接…';
  feedback('connectionResult', '');
  try {
    await send({ type: 'api.test', provider, targetLang: el('targetLang').value }, 100000);
    await writeSettings({ provider });
    feedback('connectionResult', '连接成功，已保存。');
  } catch (error) {
    feedback('connectionResult', error.message, true);
  } finally {
    connecting = false;
    el('connectionFields').disabled = false;
    updateConnectionView();
  }
}

async function savePreference(id, path) {
  const [key, subkey] = path.split('.');
  const value = readField(id);
  if (id === 'selectionEnabled') el('selectionAuto').disabled = !value;
  const patch = subkey ? { [key]: { [subkey]: value } } : { [key]: value };
  pendingPreferences += 1;
  feedback('saveState', '正在保存…');
  try {
    await writeSettings(patch);
    if (pendingPreferences === 1) feedback('saveState', '已保存');
  } catch (error) {
    feedback('saveState', error.message, true);
  } finally {
    pendingPreferences -= 1;
  }
}

function exportSettings() {
  const { apiKey, extraHeaders, ...provider } = saved.provider;
  const payload = { app: BRAND.english, settings: { ...saved, provider } };
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'LikeBird-settings.json';
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  feedback('saveState', '已导出设置。');
}

async function importSettings(file) {
  if (!file) return;
  const raw = JSON.parse(await file.text());
  const imported = raw?.settings || raw;
  if (!imported || typeof imported !== 'object' || Array.isArray(imported)) throw new Error('请选择有效的设置文件。');
  const provider = imported.provider;
  const sameService = provider?.preset === saved.provider.preset && provider?.baseUrl === saved.provider.baseUrl
    && provider?.type === saved.provider.type;
  const next = mergeSettings({
    ...saved,
    ...imported,
    provider: provider
      ? { ...provider, apiKey: sameService ? saved.provider.apiKey : '', extraHeaders: sameService ? saved.provider.extraHeaders : '' }
      : saved.provider,
  });
  await writeSettings(next);
  fillProvider(saved.provider);
  fillPreferences();
  feedback('connectionResult', '');
  feedback('saveState', '已导入设置。');
}

async function runUtility(action) {
  try {
    await action();
  } catch (error) {
    feedback('saveState', error.message, true);
  }
}

async function loadForm() {
  el('retrySettings').hidden = true;
  feedback('settingsLoadStatus', '正在读取设置…');
  try {
    saved = mergeSettings((await send({ type: 'settings.full' }, 5000)).settings);
    fillProvider(saved.provider);
    fillPreferences();
    el('connectionFields').disabled = false;
    el('readingFields').disabled = false;
    el('settingsLoad').hidden = true;
  } catch {
    feedback('settingsLoadStatus', '无法读取 飞译设置。请重试，或在 Safari 的扩展设置中重新启用飞译。', true);
    el('retrySettings').hidden = false;
  }
}

function init() {
  fillSelect('preset', Object.entries(PROVIDER_PRESETS).map(([key, value]) => [key, value.label]));
  fillSelect('targetLang', TARGET_LANGUAGES.map(({ code, label }) => [code, label]));
  fillSelect('sourceLang', SOURCE_LANGUAGES.map(({ code, label }) => [code, label]));
  fillSelect('style', STYLE_OPTIONS.map(({ value, label }) => [value, label]));
  el('version').textContent = BRAND.version;

  el('retrySettings').addEventListener('click', loadForm);
  loadForm();

  el('connection').addEventListener('submit', connect);
  el('preset').addEventListener('change', selectProvider);
  for (const id of Object.values(providerFields).filter((id) => id !== 'preset')) {
    el(id).addEventListener('input', () => {
      feedback('connectionResult', '');
      updateConnectionView();
    });
  }
  el('toggleKey').addEventListener('click', () => {
    const show = el('apiKey').type === 'password';
    el('apiKey').type = show ? 'text' : 'password';
    el('toggleKey').textContent = show ? '隐藏' : '显示';
  });
  for (const [id, path] of Object.entries(preferenceFields)) {
    el(id).addEventListener('change', () => savePreference(id, path));
  }
  el('clearCache').addEventListener('click', () => runUtility(async () => {
    if (!window.confirm('清除本机翻译缓存？')) return;
    await send({ type: 'cache.clear' });
    feedback('saveState', '已清除翻译缓存。');
  }));
  el('exportSettings').addEventListener('click', exportSettings);
  el('importSettings').addEventListener('click', () => el('importFile').click());
  el('importFile').addEventListener('change', (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    runUtility(() => importSettings(file));
  });
  el('resetSettings').addEventListener('click', () => runUtility(async () => {
    if (!window.confirm('恢复默认设置并移除已保存的 API Key？')) return;
    await writeSettings(mergeSettings({}));
    fillProvider(saved.provider);
    fillPreferences();
    feedback('connectionResult', '');
    feedback('saveState', '已恢复默认设置。');
  }));
}

initSite();
init();
