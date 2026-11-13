import { TARGET_LANGUAGES } from '../shared/constants.js';
import { callApi, extensionApi, sendRuntimeMessage } from '../shared/storage.js';
import { hostMatchesAny, hostFromUrl, truncate } from '../shared/utils.js';

const api = extensionApi();
const el = (id) => document.getElementById(id);

const state = {
  tab: null,
  settings: null,
  status: null,
  unsupported: false,
  excluded: false,
  polling: false,
  pollTimer: 0,
};

function sendBackground(message) {
  return sendRuntimeMessage(message, 60000);
}

async function activeTab() {
  const tabs = await callApi(api.tabs, 'query', [{ active: true, currentWindow: true }]);
  return tabs?.[0] || null;
}

function isSupportedTab(tab) {
  if (!tab?.url) return false;
  try {
    const url = new URL(tab.url);
    return ['http:', 'https:', 'file:'].includes(url.protocol);
  } catch {
    return false;
  }
}

function hostOf(tab) {
  return hostFromUrl(tab?.url || '');
}

function showToast(message, type = 'info') {
  const toast = el('toast');
  toast.textContent = message;
  toast.className = `toast${type === 'error' ? ' is-error' : ''}`;
  requestAnimationFrame(() => toast.classList.add('is-visible'));
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('is-visible'), 3200);
}

function shortcutLabel() {
  return /Mac|iPhone|iPad/.test(navigator.userAgent) ? '⌥ A' : 'Alt + A';
}

function renderSite() {
  const tab = state.tab;
  const host = hostOf(tab);
  el('siteDomain').textContent = host || '当前标签页';
  el('siteTitle').textContent = truncate(tab?.title || '无标题页面', 64);
  el('shortcut').textContent = shortcutLabel();

  const icon = el('siteIcon');
  icon.textContent = (host || 'Y').charAt(0).toUpperCase();
  if (tab?.favIconUrl && /^https?:/i.test(tab.favIconUrl)) {
    const image = document.createElement('img');
    image.alt = '';
    image.src = tab.favIconUrl;
    image.addEventListener('error', () => {
      image.remove();
      icon.textContent = (host || 'Y').charAt(0).toUpperCase();
    });
    icon.textContent = '';
    icon.appendChild(image);
  }
}

function renderApiState() {
  const configured = Boolean(state.settings?.configured);
  el('apiBanner').hidden = configured || state.unsupported;
  el('excludedBanner').hidden = !state.excluded || state.unsupported;
}

function renderStatus() {
  const pill = el('statusPill');
  pill.className = 'status-pill';
  const status = state.status;

  if (state.unsupported) {
    pill.textContent = '不可用';
    el('translateBtn').disabled = true;
    el('restoreBtn').disabled = true;
    el('autoSite').disabled = true;
    el('hint').textContent = 'Safari 设置页、扩展商店等内部页面不支持翻译。';
    return;
  }

  if (state.excluded) {
    pill.textContent = '已排除';
    pill.classList.add('is-error');
    el('translateBtn').disabled = true;
    el('restoreBtn').disabled = true;
  } else if (status?.active) {
    pill.textContent = '翻译中';
    pill.classList.add('is-active');
    el('translateBtn').disabled = true;
    el('restoreBtn').disabled = false;
    const total = status.total || 0;
    const done = status.translated || 0;
    el('hint').textContent = total
      ? `正在翻译：${done} / ${total} 段，可在网页右下角停止。`
      : '正在准备翻译…';
  } else if (status?.hasTranslation) {
    pill.textContent = '已翻译';
    pill.classList.add('is-done');
    el('translateBtn').disabled = false;
    el('restoreBtn').disabled = false;
    el('hint').textContent = status.errors
      ? `${status.errors} 段未完成，可在网页右下角重试。`
      : '译文已插入页面，切换标签页后会保留。';
  } else if (status?.errors) {
    pill.textContent = '部分失败';
    pill.classList.add('is-error');
    el('translateBtn').disabled = false;
    el('restoreBtn').disabled = false;
    el('hint').textContent = '翻译未完成，请检查 API 设置或重试。';
  } else {
    pill.textContent = '待翻译';
    el('translateBtn').disabled = false;
    el('restoreBtn').disabled = true;
    el('hint').textContent = '选中网页文字，点击浮出的「译」即可划词翻译。';
  }

  if (status?.active) {
    el('translateBtn').querySelector('.btn-label').textContent = '正在翻译…';
  } else if (status?.hasTranslation) {
    el('translateBtn').querySelector('.btn-label').textContent = '重新翻译此页';
  } else {
    el('translateBtn').querySelector('.btn-label').textContent = '翻译此页';
  }
}

function renderAutoSwitch() {
  const host = hostOf(state.tab);
  const auto = Boolean(host && hostMatchesAny(host, state.settings?.autoTranslateSites || []));
  el('autoSite').checked = auto;
}

function populateLanguages() {
  const select = el('targetLang');
  select.innerHTML = '';
  for (const language of TARGET_LANGUAGES) {
    const option = document.createElement('option');
    option.value = language.code;
    option.textContent = `${language.label}`;
    select.appendChild(option);
  }
  select.value = state.settings?.targetLang || 'zh-CN';
}

async function loadStatus() {
  if (state.unsupported || !state.tab?.id) return;
  try {
    const response = await sendBackground({ type: 'page.status', tabId: state.tab.id });
    if (response?.ok && response.status) {
      state.status = response.status;
    } else if (response?.unsupported) {
      state.unsupported = true;
    }
  } catch {
    // Keep the last known state; commands will surface a concrete error.
  }
  renderStatus();
  schedulePolling();
}

function schedulePolling() {
  clearTimeout(state.pollTimer);
  if (!state.status?.active) return;
  state.pollTimer = setTimeout(async () => {
    await loadStatus();
  }, 900);
}

async function translatePage() {
  if (!state.settings?.configured) {
    showToast('请先配置翻译服务', 'error');
    await sendBackground({ type: 'options.open' }).catch(() => {});
    window.close();
    return;
  }
  if (state.excluded) {
    showToast('此站点在排除列表中，请先在设置中移除', 'error');
    return;
  }
  el('translateBtn').disabled = true;
  try {
    const response = await sendBackground({
      type: 'page.command',
      command: 'translate',
      tabId: state.tab?.id,
    });
    if (!response?.ok) {
      showToast(response?.error?.message || response?.error || '无法开始翻译', 'error');
      el('translateBtn').disabled = false;
      return;
    }
    state.status = { ...(state.status || {}), active: true, total: 0, translated: 0 };
    renderStatus();
    setTimeout(() => window.close(), 380);
  } catch (error) {
    showToast(error.message || '无法连接页面脚本', 'error');
    el('translateBtn').disabled = false;
  }
}

async function restorePage() {
  try {
    await sendBackground({
      type: 'page.command',
      command: 'restore',
      tabId: state.tab?.id,
    });
    state.status = { active: false, hasTranslation: false, translated: 0, total: 0, errors: 0 };
    renderStatus();
    showToast('已恢复原文');
  } catch (error) {
    showToast(error.message || '恢复原文失败', 'error');
  }
}

async function updateSettings(patch) {
  const response = await sendBackground({ type: 'settings.update', patch });
  if (response?.ok && response.settings) {
    state.settings = response.settings;
    state.excluded = hostMatchesAny(hostOf(state.tab), state.settings.excludeSites || []);
    renderApiState();
    renderAutoSwitch();
    renderStatus();
  }
  return response;
}

async function onTargetLanguageChange() {
  const targetLang = el('targetLang').value;
  const previous = state.settings?.targetLang;
  try {
    await updateSettings({ targetLang });
    if (previous !== targetLang && state.status?.hasTranslation) {
      showToast('目标语言已保存，重新翻译后生效');
    }
  } catch (error) {
    showToast(error.message || '保存语言设置失败', 'error');
    el('targetLang').value = previous || 'zh-CN';
  }
}

async function onAutoSiteChange() {
  const host = hostOf(state.tab);
  if (!host) {
    el('autoSite').checked = false;
    return;
  }
  const enabled = el('autoSite').checked;
  const auto = new Set(state.settings?.autoTranslateSites || []);
  const excluded = new Set(state.settings?.excludeSites || []);
  if (enabled) {
    auto.add(host);
    excluded.delete(host);
  } else {
    auto.delete(host);
  }
  try {
    await updateSettings({
      autoTranslateSites: [...auto],
      excludeSites: [...excluded],
    });
    showToast(enabled ? `已开启 ${host} 自动翻译` : `已关闭 ${host} 自动翻译`);
  } catch (error) {
    el('autoSite').checked = !enabled;
    showToast(error.message || '保存站点规则失败', 'error');
  }
}

async function openOptions() {
  await sendBackground({ type: 'options.open' }).catch(() => {});
  window.close();
}

async function clearCache() {
  try {
    await sendBackground({ type: 'cache.clear' });
    showToast('本地翻译缓存已清除');
  } catch (error) {
    showToast(error.message || '清除缓存失败', 'error');
  }
}

async function init() {
  state.tab = await activeTab();
  state.unsupported = !isSupportedTab(state.tab);

  const settingsResponse = await sendBackground({ type: 'settings.get' }).catch(() => null);
  if (settingsResponse?.ok) state.settings = settingsResponse.settings;
  if (!state.settings) {
    showToast('无法读取译流设置，请重新打开扩展', 'error');
    return;
  }

  state.excluded = hostMatchesAny(hostOf(state.tab), state.settings.excludeSites || []);
  populateLanguages();
  renderSite();
  renderApiState();
  renderAutoSwitch();
  el('version').textContent = `v${api.runtime.getManifest().version}`;

  if (state.unsupported) {
    renderStatus();
    return;
  }
  await loadStatus();
}

el('settingsBtn').addEventListener('click', openOptions);
el('optionsBtn').addEventListener('click', openOptions);
el('openSettings').addEventListener('click', openOptions);
el('translateBtn').addEventListener('click', translatePage);
el('restoreBtn').addEventListener('click', restorePage);
el('clearCache').addEventListener('click', clearCache);
el('targetLang').addEventListener('change', onTargetLanguageChange);
el('autoSite').addEventListener('change', onAutoSiteChange);
window.addEventListener('beforeunload', () => clearTimeout(state.pollTimer));

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
