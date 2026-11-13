import {
  CACHE_STORAGE_KEY,
  LIMITS,
  SETTINGS_STORAGE_KEY,
} from '../shared/constants.js';
import { callApi, extensionApi, loadSettings, saveSettings } from '../shared/storage.js';
import {
  isProviderConfigured,
  mergeSettings,
  publicSettings,
} from '../shared/settings.js';
import { hostFromUrl, hostMatchesAny, sleep, uid } from '../shared/utils.js';
import { splitTextSlots } from '../shared/text-slots.js';
import { isChinese, toTraditional } from './traditional.js';
import {
  ApiError,
  apiErrorPayload,
  testProvider,
  translateBatch,
  translateSelection,
} from './api.js';
import { TranslationCache } from './cache.js';

const api = extensionApi();
const cache = new TranslationCache();
let cachedSettings = null;
let settingsWrites = Promise.resolve();
const pageConnections = new Map();
const pageStatuses = new Map();
const PAGE_CONNECTION_ERROR = '无法连接此网页。请确认 Safari 允许飞译 访问此网站，刷新网页后重试。';
const PAGE_RELOAD_ERROR = '此标签页仍在使用旧版飞译。请刷新网页后重试。';

const MENU_PAGE = 'yiliu-translate-page';
const MENU_SELECTION = 'yiliu-translate-selection';
const MENU_RESTORE = 'yiliu-restore-page';

function log(...args) {
  console.info('[LikeBird]', ...args);
}

function isExtensionPage(sender) {
  if (!sender) return true;
  const urls = [sender.url, sender.tab?.url].filter(Boolean).map(String);
  if (!urls.length) return true;
  return urls.some((url) => {
    if (/^(?:safari-web-extension|chrome-extension|moz-extension|safari-extension):/i.test(url)) {
      return true;
    }
    try {
      return url.startsWith(api.runtime.getURL(''));
    } catch {
      return false;
    }
  });
}

async function getSettings() {
  if (!cachedSettings) cachedSettings = await loadSettings();
  return cachedSettings;
}

function mergePatch(current, patch) {
  const next = JSON.parse(JSON.stringify(current));
  if (!patch || typeof patch !== 'object') return next;
  for (const key of Object.keys(patch)) {
    if (!(key in next)) continue;
    const value = patch[key];
    if (key === 'provider' || key === 'selection' || key === 'cache' || key === 'batch' || key === 'advanced') {
      if (value && typeof value === 'object') next[key] = { ...next[key], ...value };
    } else {
      next[key] = value;
    }
  }
  return next;
}

async function broadcastSettings(settings) {
  try {
    const tabs = await callApi(api.tabs, 'query', [{}], { timeoutMs: 10000 });
    await Promise.all(
      tabs.map(async (tab) => {
        if (!tab.id) return;
        try {
          await callApi(
            api.tabs,
            'sendMessage',
            [tab.id, { type: 'settings.changed', settings }],
            { timeoutMs: 2000 },
          );
        } catch {
          // A tab can disappear while we are iterating; nothing to do.
        }
      }),
    );
  } catch {
    // Query can fail while a window is closing.
  }
}

function setBadge(tabId, text, color = '#171717') {
  if (!tabId || !api.browserAction) return;
  try {
    const promise = api.browserAction.setBadgeText({ tabId, text });
    if (promise?.catch) promise.catch(() => {});
    const colorPromise = api.browserAction.setBadgeBackgroundColor({ tabId, color });
    if (colorPromise?.catch) colorPromise.catch(() => {});
  } catch {
    // Badge support differs between Safari versions.
  }
}

async function getActiveTab() {
  const tabs = await callApi(api.tabs, 'query', [{ active: true, currentWindow: true }]);
  return tabs?.[0] || null;
}

async function sendToTab(tabId, message, frameId = 0) {
  try {
    return await callApi(api.tabs, 'sendMessage', [tabId, message, { frameId }], {
      timeoutMs: 30000,
    });
  } catch (error) {
    // Safari can reject a frame-targeted message when frameId support is
    // incomplete; retry without the target before giving up.
    if (frameId !== undefined) {
      return callApi(api.tabs, 'sendMessage', [tabId, message], { timeoutMs: 30000 });
    }
    throw error;
  }
}

async function sendToPage(tabId, message, timeoutMs = 2000) {
  try {
    const reply = await callApi(api.tabs, 'sendMessage', [tabId, message, { frameId: 0 }], { timeoutMs });
    if (reply != null) return reply;
  } catch {
    // Some Safari versions do not support frame-targeted messaging.
  }
  return callApi(api.tabs, 'sendMessage', [tabId, message], { timeoutMs });
}

async function pageResponds(tabId) {
  let response;
  try {
    response = await sendToPage(tabId, { type: 'page.ping' }, 1500);
  } catch {
    return false;
  }
  if (!response?.ok || response.pong !== true) return false;
  if (response.viewportTranslation !== true) throw new Error(PAGE_RELOAD_ERROR);
  return true;
}

async function connectPage(tabId) {
  if (await pageResponds(tabId)) return;
  // The page may have loaded before the extension was enabled or updated.
  try {
    await callApi(api.tabs, 'executeScript', [tabId, { file: 'content.js', runAt: 'document_idle' }], {
      timeoutMs: 5000,
    });
  } catch {
    throw new Error(PAGE_CONNECTION_ERROR);
  }
  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (await pageResponds(tabId)) return;
    await sleep(100);
  }
  throw new Error(PAGE_CONNECTION_ERROR);
}

function ensureContentScript(tabId) {
  if (!pageConnections.has(tabId)) {
    pageConnections.set(tabId, connectPage(tabId).finally(() => pageConnections.delete(tabId)));
  }
  return pageConnections.get(tabId);
}

async function requestPage(tabId, message) {
  const reply = await deliverPageRequest(tabId, message);
  if (reply != null) return reply;

  await ensureContentScript(tabId);
  const recovered = await deliverPageRequest(tabId, message);
  if (recovered == null) throw new Error(PAGE_CONNECTION_ERROR);
  return recovered;
}

async function deliverPageRequest(tabId, message) {
  try {
    const reply = await sendToPage(tabId, message);
    if (reply != null) return reply;
  } catch {
    // The script may be running even when Safari loses the message reply.
  }
  try {
    const [reply] = await callApi(api.tabs, 'executeScript', [tabId, {
      code: `globalThis.__EE_PAGE_REQUEST__?.(${JSON.stringify(message)})`,
      runAt: 'document_idle',
    }], { timeoutMs: 2000 });
    return reply;
  } catch {
    return undefined;
  }
}

async function dispatchPageCommand(command, tabId, payload = {}) {
  const tab = tabId ? await callApi(api.tabs, 'get', [tabId]) : await getActiveTab();
  if (!tab?.id) throw new Error('找不到当前标签页');
  const response = await requestPage(tab.id, { ...payload, type: `page.${command}`, requestId: uid('page') });
  if (response?.ok !== true) {
    throw new Error(response?.error?.message || response?.error || PAGE_CONNECTION_ERROR);
  }
  if (response.status) pageStatuses.set(tab.id, { url: tab.url, status: response.status });
  return { ok: true, tabId: tab.id, status: response.status };
}

async function translateBatchMessage(message) {
  const settings = await getSettings();
  const rawItems = Array.isArray(message.items) ? message.items : [];
  if (rawItems.length > LIMITS.maxBatchItems) {
    throw new ApiError(`一次最多翻译 ${LIMITS.maxBatchItems} 段`, 'BAD_REQUEST');
  }

  const items = [];
  for (const raw of rawItems) {
    const id = String(raw?.id || '').trim();
    const text = String(raw?.text || '').trim();
    if (!id || !text) continue;
    if (text.length > LIMITS.maxBlockChars) {
      throw new ApiError(`单段文本超过 ${LIMITS.maxBlockChars} 字符`, 'TOO_LONG');
    }
    const slots = Number.isInteger(raw.slots) && splitTextSlots(text, raw.slots) ? raw.slots : 1;
    const language = typeof raw.language === 'string' ? raw.language : '';
    items.push({ id, text, slots, language });
  }

  cache.configure(settings);
  await cache.load();
  const traditional = settings.targetLang === 'zh-TW';
  const translations = Object.create(null);
  const misses = [];
  let cached = 0;
  for (const item of items) {
    if (traditional && isChinese(item.text, item.language)) {
      translations[item.id] = toTraditional(item.text, item.slots);
      continue;
    }
    const hit = cache.get(item.text, settings, 'page-text-slots');
    if (splitTextSlots(hit, item.slots)) {
      translations[item.id] = hit;
      cached += 1;
    } else {
      misses.push(item);
    }
  }

  if (!misses.length) return { ok: true, translations, errors: [], cached };
  if (!isProviderConfigured(settings)) {
    const error = new ApiError('翻译其他语言需要先连接翻译服务。', 'NO_API_KEY');
    if (!Object.keys(translations).length) throw error;
    return { ok: true, translations, errors: misses.map(({ id }) => ({ id })), cached, warning: apiErrorPayload(error) };
  }

  try {
    const result = await translateBatch({ items: misses, settings, context: message.context || {} });
    for (const item of misses) {
      const translation = result.translations[item.id];
      if (!translation) continue;
      const normalized = traditional ? toTraditional(translation, item.slots) : translation;
      translations[item.id] = normalized;
      cache.set(item.text, normalized, settings, 'page-text-slots');
    }
    await cache.persist();
    return {
      ok: true,
      translations,
      errors: result.errors,
      cached,
      usage: result.usage,
      latencyMs: result.latencyMs,
    };
  } catch (error) {
    if (!Object.keys(translations).length) throw error;
    return { ok: true, translations, errors: misses.map(({ id }) => ({ id })), cached, warning: apiErrorPayload(error) };
  }
}

async function translateSelectionMessage(message) {
  const settings = await getSettings();
  const text = String(message.text || '').trim();
  if (!text) throw new ApiError('没有选中文字', 'EMPTY_SELECTION');
  if (text.length > LIMITS.maxSelectionChars) {
    throw new ApiError(`选中文字过长，最多 ${LIMITS.maxSelectionChars} 字符`, 'TOO_LONG');
  }
  const traditional = settings.targetLang === 'zh-TW';
  if (traditional && isChinese(text)) return { ok: true, translation: toTraditional(text) };
  if (!isProviderConfigured(settings)) {
    throw new ApiError('翻译其他语言需要先连接翻译服务。', 'NO_API_KEY');
  }
  cache.configure(settings);
  await cache.load();
  const hit = cache.get(text, settings) || cache.get(text, settings, 'page-text-slots');
  if (hit) {
    return { ok: true, translation: traditional ? toTraditional(hit) : hit, cached: true, latencyMs: 0 };
  }
  const result = await translateSelection({
    text,
    settings,
    context: message.context || {},
  });
  const translation = traditional ? toTraditional(result.translation) : result.translation;
  cache.set(text, translation, settings);
  await cache.persist();
  return {
    ok: true,
    translation,
    cached: false,
    usage: result.usage,
    latencyMs: result.latencyMs,
  };
}

function updateSettings(change, afterSave = broadcastSettings) {
  const write = settingsWrites.then(async () => {
    const next = mergeSettings(change(await getSettings()));
    cachedSettings = await saveSettings(next);
    const settings = publicSettings(cachedSettings);
    await afterSave(settings);
    return settings;
  });
  settingsWrites = write.catch(() => {});
  return write;
}

async function handleSettingsUpdate(message, sender) {
  if (!isExtensionPage(sender)) throw new ApiError('网页不能修改扩展设置', 'FORBIDDEN');
  const settings = await updateSettings((current) => mergePatch(current, message.patch || message.settings || {}));
  return { ok: true, settings };
}

async function setPageDisplay(message, sender) {
  if (!isExtensionPage(sender)) throw new ApiError('网页不能修改扩展设置', 'FORBIDDEN');
  const settings = await updateSettings((current) => ({ ...current, displayMode: message.displayMode }));
  try {
    const result = await dispatchPageCommand('display', message.tabId, { displayMode: settings.displayMode });
    return { ok: true, settings, status: result.status };
  } catch (error) {
    return { ok: true, settings, connectionWarning: error.message };
  }
}

async function setSiteAutoTranslation(message, sender) {
  if (!isExtensionPage(sender)) throw new ApiError('网页不能修改扩展设置', 'FORBIDDEN');
  const tab = await callApi(api.tabs, 'get', [message.tabId]);
  const host = hostFromUrl(tab?.url || '');
  if (!/^https?:/i.test(tab?.url || '') || !host || host !== message.host) {
    throw new ApiError('当前网站已变化，请重新打开 飞译弹窗。', 'BAD_REQUEST');
  }

  const settings = await updateSettings((current) => {
    const rules = current.autoTranslateSites.filter((rule) => rule !== host);
    const disabled = current.autoTranslateDisabledSites.filter((name) => name !== host);
    if (message.enabled && !hostMatchesAny(host, rules)) rules.push(host);
    if (!message.enabled && hostMatchesAny(host, rules)) disabled.push(host);
    return { ...current, autoTranslateSites: rules, autoTranslateDisabledSites: disabled };
  }, (settings) => Promise.all([
    broadcastSettings(settings),
    requestPage(tab.id, { type: 'settings.changed', settings }).catch(() => {}),
  ]));
  return { ok: true, settings };
}

async function handleMessage(message, sender) {
  switch (message?.type) {
    case 'settings.get':
      return { ok: true, settings: publicSettings(await getSettings()) };

    case 'settings.full': {
      if (!isExtensionPage(sender)) throw new ApiError('网页不能读取完整设置', 'FORBIDDEN');
      return { ok: true, settings: await getSettings() };
    }

    case 'settings.update':
      return handleSettingsUpdate(message, sender);

    case 'settings.siteAuto':
      return setSiteAutoTranslation(message, sender);

    case 'settings.pageDisplay':
      return setPageDisplay(message, sender);

    case 'translate.batch':
      return translateBatchMessage(message);

    case 'translate.selection':
      return translateSelectionMessage(message);

    case 'api.test': {
      if (!isExtensionPage(sender)) throw new ApiError('网页不能测试 API', 'FORBIDDEN');
      const provider = message.provider || (await getSettings()).provider;
      const targetLang = message.targetLang || (await getSettings()).targetLang;
      const result = await testProvider(provider, targetLang);
      return { ok: true, result };
    }

    case 'cache.clear':
      await cache.load();
      await cache.clear();
      return { ok: true };

    case 'cache.stats':
      await cache.load();
      return { ok: true, size: cache.size };

    case 'options.open':
      if (api.runtime.openOptionsPage) {
        const opened = api.runtime.openOptionsPage();
        if (opened?.then) await opened;
      } else {
        await callApi(api.tabs, 'create', [{ url: api.runtime.getURL('options.html') }]);
      }
      return { ok: true };

    case 'page.command':
      return dispatchPageCommand(message.command, message.tabId, message.payload || {});

    case 'page.status': {
      const tab = message.tabId ? await callApi(api.tabs, 'get', [message.tabId]) : await getActiveTab();
      if (!tab?.id) return { ok: false, error: '找不到当前标签页' };
      try {
        const status = await requestPage(tab.id, { type: 'page.status' });
        if (typeof status?.active !== 'boolean') {
          throw new Error(status?.error?.message || status?.error || PAGE_CONNECTION_ERROR);
        }
        pageStatuses.set(tab.id, { url: tab.url, status });
        return { ok: true, status };
      } catch (error) {
        const previous = pageStatuses.get(tab.id);
        if (previous && previous.url === tab.url) {
          return { ok: true, status: previous.status, connectionWarning: '正在重新连接此网页…' };
        }
        throw error;
      }
    }

    case 'page.report':
      if (sender?.tab?.id && (!sender.frameId || sender.frameId === 0)) {
        if (typeof message.status?.active === 'boolean') {
          pageStatuses.set(sender.tab.id, { url: message.url || sender.url || sender.tab.url, status: message.status });
        }
        if (message.state === 'translating') setBadge(sender.tab.id, '…', '#171717');
        else if (message.state === 'done') setBadge(sender.tab.id, '译', '#171717');
        else if (message.state === 'error') setBadge(sender.tab.id, '!', '#b42318');
        else if (message.state === 'restored') setBadge(sender.tab.id, '');
      }
      return { ok: true };

    case 'page.ping':
      return { ok: true, pong: true };

    case 'diagnostics': {
      const settings = await getSettings();
      return {
        ok: true,
        configured: isProviderConfigured(settings),
        cacheSize: cache.size,
        version: api.runtime.getManifest().version,
      };
    }

    default:
      return { ok: false, error: `未知消息：${message?.type || ''}` };
  }
}

async function createContextMenus() {
  if (!api.contextMenus) return;
  try {
    const removal = api.contextMenus.removeAll();
    if (removal?.then) await removal;
  } catch {
    // No existing menus.
  }
  api.contextMenus.create({
    id: MENU_PAGE,
    title: '飞译：翻译此页面',
    contexts: ['page', 'frame'],
  });
  api.contextMenus.create({
    id: MENU_SELECTION,
    title: '飞译：翻译选中文字',
    contexts: ['selection'],
  });
  api.contextMenus.create({
    id: MENU_RESTORE,
    title: '飞译：显示原文',
    contexts: ['page', 'frame'],
  });
}

async function openOptionsWithRetry() {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      if (api.runtime.openOptionsPage) {
        const opened = api.runtime.openOptionsPage();
        if (opened?.then) await opened;
        return;
      }
      await callApi(api.tabs, 'create', [{ url: api.runtime.getURL('options.html') }]);
      return;
    } catch {
      await sleep(400);
    }
  }
}

api.runtime.onInstalled.addListener((details) => {
  cachedSettings = null;
  createContextMenus().catch(() => {});
  if (details.reason === 'install') {
    setTimeout(() => openOptionsWithRetry(), 500);
  }
});

if (api.runtime.onStartup) {
  api.runtime.onStartup.addListener(() => {
    cachedSettings = null;
    createContextMenus().catch(() => {});
  });
}

api.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender)
    .then((response) => sendResponse(response))
    .catch((error) => {
      if (!(error instanceof ApiError)) log('message failed', message?.type, error);
      sendResponse({ ok: false, error: apiErrorPayload(error) });
    });
  return true;
});

if (api.contextMenus) {
  api.contextMenus.onClicked.addListener(async (info, tab) => {
    try {
      if (!tab?.id) return;
      if (info.menuItemId === MENU_SELECTION) {
        await ensureContentScript(tab.id);
        const text = String(info.selectionText || '').trim();
        await sendToTab(
          tab.id,
          { type: 'selection.translate', text, fromContextMenu: true },
          info.frameId ?? 0,
        );
        return;
      }
      if (info.menuItemId === MENU_PAGE) {
        await dispatchPageCommand('translate', tab.id, { force: true });
        return;
      }
      if (info.menuItemId === MENU_RESTORE) {
        await dispatchPageCommand('restore', tab.id);
      }
    } catch (error) {
      log('context menu failed', error);
      setBadge(tab?.id, '!', '#b42318');
    }
  });
}

if (api.commands) {
  api.commands.onCommand.addListener(async (command) => {
    try {
      if (command === 'toggle-page') await dispatchPageCommand('toggle');
      else if (command === 'translate-page') await dispatchPageCommand('translate', null, { force: true });
      else if (command === 'restore-page') await dispatchPageCommand('restore');
      else if (command === 'translate-selection') {
        const tab = await getActiveTab();
        if (!tab?.id) return;
        await ensureContentScript(tab.id);
        await sendToTab(tab.id, { type: 'selection.translate-current' }, 0);
      }
    } catch (error) {
      log('command failed', command, error);
    }
  });
}

if (api.tabs?.onUpdated) {
  api.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.status === 'loading') {
      pageStatuses.delete(tabId);
      setBadge(tabId, '');
    }
    if (changeInfo.url) sendToPage(tabId, { type: 'page.navigate' }, 1500).catch(() => {});
  });
}
api.tabs?.onRemoved?.addListener((tabId) => pageStatuses.delete(tabId));

if (api.storage?.onChanged) {
  api.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes[SETTINGS_STORAGE_KEY]) cachedSettings = null;
    if (area === 'local' && changes[CACHE_STORAGE_KEY] && !changes[CACHE_STORAGE_KEY].newValue) {
      // Another extension page cleared the cache.
      cache.entries.clear();
    }
  });
}

// Warm the cache opportunistically. If this fails, individual requests still
// fall back to network.
cache.load().catch(() => {});

log(`background ready · v${api.runtime.getManifest().version}`);
