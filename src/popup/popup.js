import { TARGET_LANGUAGES } from '../shared/constants.js';
import { callApi, extensionApi, sendRuntimeMessage } from '../shared/storage.js';
import { autoTranslatesHost, hostMatchesAny, hostFromUrl } from '../shared/utils.js';

const api = extensionApi();
const el = (id) => document.getElementById(id);
const modeInputs = document.querySelectorAll('[name=displayMode]');

let tab;
let settings;
let status;
let restricted = false;
let busy = false;
let pendingCommand = '';
let statusError = '';
let pollTimer;
let statusRequest = 0;
let popupClosed = false;

async function send(message, timeout = 60000) {
  const response = await sendRuntimeMessage(message, timeout);
  if (!response?.ok) {
    throw new Error(response?.error?.message || response?.error || '请重试');
  }
  return response;
}

function notice(message = '', error = false) {
  const node = el('notice');
  node.textContent = message;
  node.hidden = !message;
  node.toggleAttribute('data-error', error);
}

function render() {
  const host = hostFromUrl(tab?.url || '');
  const excluded = hostMatchesAny(host, settings?.excludeSites || []);
  const available = !restricted && !excluded;
  const configured = Boolean(settings?.configured);
  const localConversion = settings?.targetLang === 'zh-TW';
  const active = Boolean(status?.active);
  const following = Boolean(status?.following);
  const translated = Boolean(status?.hasTranslation);
  const stopped = Boolean(status?.stopped);
  const errors = status?.errors || 0;
  const failure = status?.error;
  const label = el('pageStatus');
  label.textContent = active ? '翻译中' : stopped ? '已停止'
    : translated ? (failure || errors ? '部分完成' : '已翻译可见内容') : '';
  label.toggleAttribute('data-translated', translated && !active && !stopped && !failure);
  el('pageControls').hidden = !available || !settings;
  el('siteAutoRow').hidden = !host || !/^https?:/i.test(tab?.url || '');
  el('siteAuto').checked = autoTranslatesHost(host, settings);
  el('siteAuto').disabled = busy;
  el('openSettings').hidden = !available || configured || !settings;
  el('selectionNote').hidden = !available || (!configured && !localConversion) || !settings?.selection.enabled;
  el('restoreBtn').hidden = !translated && (!following || active);
  el('retranslateBtn').hidden = !translated || active || stopped || Boolean(errors || failure);
  el('translateLabel').textContent = active ? '停止翻译' : (stopped || failure) && translated ? '重新翻译'
    : errors && translated ? '重试未完成段落' : '翻译此页';
  el('translateIcon').classList.toggle('icon-stop', active);
  el('translateIcon').classList.toggle('icon-refresh', !active && translated && Boolean(stopped || failure || errors));
  el('translateBtn').hidden = !active && ((!configured && !localConversion)
    || ((translated || following) && !errors && !stopped && !failure));
  el('restoreBtn').classList.toggle('primary', !errors && !stopped && !failure);
  el('restoreBtn').classList.toggle('secondary', Boolean(errors || failure) || stopped);
  el('translateShortcut').hidden = !active && (translated || Boolean(errors));
  el('targetLang').disabled = active || busy;
  for (const input of modeInputs) {
    input.checked = input.value === (settings?.displayMode || 'translation');
    input.disabled = busy;
  }
  for (const id of ['translateBtn', 'restoreBtn', 'retranslateBtn']) el(id).disabled = busy;

  if (restricted) notice('此页面无法使用扩展。请打开普通网页，并在 Safari 中允许飞译 访问。');
  else if (excluded) notice('此站点已排除，可在更多阅读设置中更改。');
  else if (pendingCommand === 'translate' || pendingCommand === 'retry') notice('正在启动翻译…');
  else if (statusError || failure) notice(statusError || failure, true);
  else if (active) notice('正在翻译当前可见内容…');
  else if (stopped && translated) notice('已保留完成的段落。');
  else if (errors) notice(`${errors} 段未完成。`);
  else if (!configured) notice(localConversion ? '简体可直接转为繁體。翻译其他语言需连接服务。' : '连接服务后即可翻译。');
  else if (following) notice('滚动时继续翻译。');
  else notice();
}

async function refreshStatus() {
  clearTimeout(pollTimer);
  if (restricted || !tab?.id) return;
  const request = ++statusRequest;
  try {
    const response = await send({ type: 'page.status', tabId: tab.id });
    if (request !== statusRequest || popupClosed) return;
    status = response.status;
    statusError = response.connectionWarning || '';
  } catch (error) {
    if (request !== statusRequest || popupClosed) return;
    statusError = error.message;
  }
  render();
  if (statusError || status?.active || status?.following) {
    pollTimer = setTimeout(refreshStatus, statusError ? 1600 : 800);
  }
}

async function runCommand(command) {
  if (busy) return;
  busy = true;
  statusRequest += 1;
  clearTimeout(pollTimer);
  pendingCommand = command;
  statusError = '';
  render();
  try {
    const response = await send({ type: 'page.command', command, tabId: tab.id });
    if (response.status) status = response.status;
    await refreshStatus();
  } catch (failure) {
    statusError = failure.message;
  } finally {
    busy = false;
    pendingCommand = '';
    render();
  }
}

async function openSettings() {
  try {
    if (api.runtime.openOptionsPage) await api.runtime.openOptionsPage();
    else await send({ type: 'options.open' }, 5000);
    window.close();
  } catch (error) {
    notice(error.message, true);
  }
}

el('settingsBtn').addEventListener('click', openSettings);
el('openSettings').addEventListener('click', openSettings);
el('translateBtn').addEventListener('click', () => runCommand(
  status?.active ? 'stop'
    : !status?.stopped && !status?.error && status?.errors && status?.hasTranslation ? 'retry' : 'translate',
));
el('restoreBtn').addEventListener('click', () => runCommand('restore'));
el('retranslateBtn').addEventListener('click', () => runCommand('translate'));
async function updatePreference(patch) {
  if (busy) return;
  busy = true;
  render();
  let message = '';
  let failed = false;
  try {
    const response = await send({ type: 'settings.update', patch });
    settings = response.settings;
    await refreshStatus();
    if (patch.targetLang && status?.hasTranslation && !autoTranslatesHost(hostFromUrl(tab.url), settings)) {
      message = '重新翻译后应用新语言。';
    }
  } catch (error) {
    message = error.message;
    failed = true;
    el('targetLang').value = settings.targetLang;
  } finally {
    busy = false;
    render();
    if (message) notice(message, failed);
  }
}

el('targetLang').addEventListener('change', (event) => {
  updatePreference({ targetLang: event.target.value });
});
el('siteAuto').addEventListener('change', async (event) => {
  if (busy) return;
  const enabled = event.target.checked;
  busy = true;
  statusError = '';
  render();
  el('siteAuto').checked = enabled;
  try {
    const response = await send({
      type: 'settings.siteAuto',
      tabId: tab.id,
      host: hostFromUrl(tab.url),
      enabled,
    });
    settings = response.settings;
    await refreshStatus();
  } catch (error) {
    statusError = error.message;
  } finally {
    busy = false;
    render();
  }
});
for (const input of modeInputs) {
  input.addEventListener('change', async () => {
    if (busy || !input.checked) return;
    const displayMode = input.value;
    busy = true;
    statusRequest += 1;
    clearTimeout(pollTimer);
    render();
    input.checked = true;
    try {
      const response = await send({ type: 'settings.pageDisplay', tabId: tab.id, displayMode });
      settings = response.settings;
      if (response.status) status = response.status;
      await refreshStatus();
      if (response.connectionWarning && status?.displayMode !== settings.displayMode) {
        statusError = response.connectionWarning;
      }
    } catch (error) {
      statusError = error.message;
    } finally {
      busy = false;
      render();
    }
  });
}
window.addEventListener('pagehide', () => {
  popupClosed = true;
  clearTimeout(pollTimer);
});

async function init() {
  el('retryPopup').hidden = true;
  notice('正在读取 飞译设置…');
  try {
    const [tabs, response] = await Promise.all([
      callApi(api.tabs, 'query', [{ active: true, currentWindow: true }], { timeoutMs: 5000 }),
      send({ type: 'settings.get' }, 5000),
    ]);
    tab = tabs?.[0];
    restricted = !tab?.id || !/^(https?|file):/i.test(tab.url || '');
    settings = response.settings;
    el('siteDomain').textContent = hostFromUrl(tab?.url || '') || tab?.title || '当前页面';
    for (const { label, code } of TARGET_LANGUAGES) el('targetLang').add(new Option(label, code));
    el('targetLang').value = settings.targetLang;
    render();
    await refreshStatus();
  } catch {
    notice('无法读取 飞译状态。请重试，或在 Safari 的扩展设置中重新启用飞译。', true);
    el('retryPopup').hidden = false;
  }
}
el('retryPopup').addEventListener('click', init);
init();
