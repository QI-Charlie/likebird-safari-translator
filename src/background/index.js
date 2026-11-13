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
import { sleep } from '../shared/utils.js';
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

const MENU_PAGE = 'yiliu-translate-page';
const MENU_SELECTION = 'yiliu-translate-selection';
const MENU_RESTORE = 'yiliu-restore-page';

function log(...args) {
  console.info('[译流]', ...args);
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
    if (key === 'provider' || key === 'selection' || key === 'cache' || key === 'batch' || key === 'ui' || key === 'advanced') {
      if (value && typeof value === 'object') next[key] = { ...next[key], ...value };
    } else {
      next[key] = value;
    }
  }
  return next;
}

async function broadcastSettings(settings) {
  const safe = publicSettings(settings);
  try {
    const tabs = await callApi(api.tabs, 'query', [{}], { timeoutMs: 10000 });
    await Promise.all(
      tabs.map(async (tab) => {
        if (!tab.id) return;
        try {
          await callApi(
            api.tabs,
            'sendMessage',
            [tab.id, { type: 'settings.changed', settings: safe }],
            { timeoutMs: 10000 },
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

function setBadge(tabId, text, color = '#a060f0') {
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

async function ensureContentScript(tabId) {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      await sendToTab(tabId, { type: 'page.ping' });
      return;
    } catch {
      await sleep(60);
    }
  }
  // The page may have loaded before the extension was enabled or updated.
  try {
    await callApi(api.tabs, 'insertCSS', [tabId, { file: 'content.css' }], {
      timeoutMs: 15000,
    });
  } catch {
    // CSS may already be present.
  }
  await callApi(
    api.tabs,
    'executeScript',
    [tabId, { file: 'content.js', runAt: 'document_idle' }],
    { timeoutMs: 15000 },
  );
  for (let attempt = 0; attempt < 10; attempt += 1) {
    await sleep(70);
    try {
      await sendToTab(tabId, { type: 'page.ping' });
      return;
    } catch {
      // Keep waiting for the freshly injected script to finish initializing.
    }
  }
}

async function dispatchPageCommand(command, tabId, payload = {}) {
  const tab = tabId ? await callApi(api.tabs, 'get', [tabId]) : await getActiveTab();
  if (!tab?.id) throw new Error('找不到当前标签页');
  await ensureContentScript(tab.id);
  await sendToTab(tab.id, { type: `page.${command}`, ...payload }, 0);
  return { ok: true, tabId: tab.id };
}

async function translateBatchMessage(message) {
  const settings = await getSettings();
  if (!isProviderConfigured(settings)) {
    throw new ApiError('请先在译流设置中配置翻译服务', 'NO_API_KEY');
  }
  cache.configure(settings);
  await cache.load();

  const rawItems = Array.isArray(message.items) ? message.items : [];
  if (!rawItems.length) return { ok: true, translations: {}, errors: [], cached: 0 };
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
    items.push({ id, text });
  }

  const translations = {};
  const errors = [];
  const misses = [];
  for (const item of items) {
    const hit = cache.get(item.text, settings);
    if (hit) translations[item.id] = hit;
    else misses.push(item);
  }

  let usage = null;
  let latencyMs = 0;
  if (misses.length) {
    const result = await translateBatch({
      items: misses,
      settings,
      context: message.context || {},
    });
    Object.assign(translations, result.translations);
    errors.push(...result.errors);
    usage = result.usage || null;
    latencyMs = result.latencyMs || 0;
    for (const item of misses) {
      if (result.translations[item.id]) cache.set(item.text, result.translations[item.id], settings);
    }
    await cache.persist();
  }

  return {
    ok: true,
    translations,
    errors,
    cached: items.length - misses.length,
    usage,
    latencyMs,
  };
}

async function translateSelectionMessage(message) {
  const settings = await getSettings();
  if (!isProviderConfigured(settings)) {
    throw new ApiError('请先在译流设置中配置翻译服务', 'NO_API_KEY');
  }
  const text = String(message.text || '').trim();
  if (!text) throw new ApiError('没有选中文字', 'EMPTY_SELECTION');
  if (text.length > LIMITS.maxSelectionChars) {
    throw new ApiError(`选中文字过长，最多 ${LIMITS.maxSelectionChars} 字符`, 'TOO_LONG');
  }
  cache.configure(settings);
  await cache.load();
  const hit = cache.get(text, settings);
  if (hit) {
    return { ok: true, translation: hit, cached: true, latencyMs: 0 };
  }
  const result = await translateSelection({
    text,
    settings,
    context: message.context || {},
  });
  cache.set(text, result.translation, settings);
  await cache.persist();
  return {
    ok: true,
    translation: result.translation,
    cached: false,
    usage: result.usage,
    latencyMs: result.latencyMs,
  };
}

async function handleSettingsUpdate(message, sender) {
  if (!isExtensionPage(sender)) throw new ApiError('网页不能修改扩展设置', 'FORBIDDEN');
  const current = await getSettings();
  const next = mergeSettings(mergePatch(current, message.patch || message.settings || {}));
  cachedSettings = await saveSettings(next);
  await broadcastSettings(cachedSettings);
  return { ok: true, settings: publicSettings(cachedSettings) };
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
        const status = await sendToTab(tab.id, { type: 'page.status' }, 0);
        return { ok: true, status };
      } catch {
        return { ok: false, unsupported: true, error: '此页面无法使用译流' };
      }
    }

    case 'page.report':
      if (sender?.tab?.id && (!sender.frameId || sender.frameId === 0)) {
        if (message.state === 'translating') setBadge(sender.tab.id, '…', '#111111');
        else if (message.state === 'done') setBadge(sender.tab.id, '译', '#a060f0');
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
    title: '译流：翻译此页面',
    contexts: ['page', 'frame'],
  });
  api.contextMenus.create({
    id: MENU_SELECTION,
    title: '译流：翻译选中文字',
    contexts: ['selection'],
  });
  api.contextMenus.create({
    id: MENU_RESTORE,
    title: '译流：显示原文',
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
    if (changeInfo.status === 'loading') setBadge(tabId, '');
  });
}

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
