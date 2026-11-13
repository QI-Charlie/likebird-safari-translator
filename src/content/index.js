import { mergeSettings } from '../shared/settings.js';
import { extensionApi, sendRuntimeMessage } from '../shared/storage.js';
import { OverlayUI } from './overlay.js';
import { PageTranslator } from './page.js';
import { SelectionController } from './selection.js';

const api = extensionApi();
const isTopFrame = (() => {
  try {
    return window.top === window;
  } catch {
    return false;
  }
})();

let settings = mergeSettings({});
let selection = null;
let page = null;
let initialized = false;
let resolveReady;
const ready = new Promise((resolve) => {
  resolveReady = resolve;
});

function send(message) {
  return sendRuntimeMessage(message);
}

function report(state, status = page?.status()) {
  send({ type: 'page.report', state, status, url: location.href }).catch(() => {});
}

function openOptions() {
  send({ type: 'options.open' }).catch(() => {});
}

function normalizePublicSettings(raw) {
  const merged = mergeSettings(raw);
  merged.configured = Boolean(raw?.configured);
  merged.provider.apiKeySet = Boolean(raw?.provider?.apiKeySet);
  return merged;
}

async function fetchSettings() {
  try {
    const response = await sendRuntimeMessage({ type: 'settings.get' }, 5000);
    if (response?.ok && response.settings) {
      settings = normalizePublicSettings(response.settings);
      return;
    }
  } catch {
    // The background page may still be waking up. Keep usable defaults.
  }
  settings = normalizePublicSettings({});
}

function applySettings(next) {
  settings = normalizePublicSettings(next);
  if (isTopFrame) page?.applySettings(settings);
  selection?.updateSettings();
}

const completedRequests = new Set();

function handlePageMessage(message) {
  if (message.type === 'page.ping') return { ok: true, pong: true, viewportTranslation: true };
  if (!page || !initialized) return { ok: false, error: '飞译正在连接网页，请稍后重试。' };
  if (message.type === 'page.status') return page.status();
  if (completedRequests.has(message.requestId)) {
    return { ok: true, status: page.status() };
  }

  switch (message.type) {
    case 'page.translate':
      page.start().catch((error) => page.handleFatal(error));
      break;
    case 'page.toggle':
      page.toggle();
      break;
    case 'page.stop':
      page.cancel();
      break;
    case 'page.retry':
      page.retryFailed().catch((error) => page.handleFatal(error));
      break;
    case 'page.restore':
      page.restore();
      break;
    case 'page.display':
      applySettings({ ...settings, displayMode: message.displayMode });
      break;
    case 'page.navigate':
      page.scheduleRefresh();
      break;
    default:
      return { ok: false, error: '未知页面消息' };
  }
  if (message.requestId) {
    completedRequests.add(message.requestId);
    if (completedRequests.size > 32) completedRequests.delete(completedRequests.values().next().value);
  }
  return { ok: true, status: page.status() };
}

function installMessageBridge() {
  // The background can reach the same isolated script through executeScript
  // when the Safari message channel fails to deliver a reply.
  if (isTopFrame) globalThis.__EE_PAGE_REQUEST__ = handlePageMessage;
  api.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    const type = message?.type;
    if (type === 'page.ping' || type === 'page.status') {
      if (isTopFrame) {
        try {
          sendResponse(handlePageMessage(message));
        } catch (error) {
          sendResponse({ ok: false, error: error.message });
        }
      }
      return false;
    }
    if (type?.startsWith('page.') && !isTopFrame) return false;
    ready.then(() => {
      if (type?.startsWith('page.')) return handlePageMessage(message);
      switch (type) {
        case 'settings.changed':
          applySettings(message.settings);
          return { ok: true };
        case 'selection.translate':
          selection.translateSuppliedText(message.text);
          return { ok: true };
        case 'selection.translate-current':
          selection.translateCurrent();
          return { ok: true };
        default:
          return { ok: false, error: '未知页面消息' };
      }
    }).then(sendResponse, (error) => {
      sendResponse({ ok: false, error: { message: error?.message || '页面脚本错误' } });
    });
    return true;
  });
}

async function initialize() {
  if (initialized) return;
  page = new PageTranslator({
    getSettings: () => settings,
    requestBatch: (items, context) => send({ type: 'translate.batch', items, context }),
    report,
  });
  selection = new SelectionController(new OverlayUI(), {
    getSettings: () => settings,
    requestSelection: (text, context) =>
      send({ type: 'translate.selection', text, context }),
    openOptions,
  });
  selection.start();
  initialized = true;

  await fetchSettings();
  if (isTopFrame) {
    page.startObserver();
    page.applySettings(settings);
    page.startAuto();
  }
  resolveReady();
}

// A re-injected content script (after an extension update) must not create a
// second overlay or duplicate observers.
if (!globalThis.__YILIU_CONTENT_LOADED__) {
  globalThis.__YILIU_CONTENT_LOADED__ = true;
  installMessageBridge();
  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      () => {
        initialize().catch(() => {
          initialized = false;
          resolveReady();
        });
      },
      { once: true },
    );
  } else {
    initialize().catch(() => {
      initialized = false;
      resolveReady();
    });
  }
}

window.addEventListener('pagehide', () => {
  selection?.stop();
  page?.suspend();
});

window.addEventListener('pageshow', (event) => {
  if (!event.persisted) return;
  selection?.start();
  if (isTopFrame) {
    page?.startObserver();
    sendRuntimeMessage({ type: 'settings.get' }, 5000).then((response) => {
      if (response?.ok) applySettings(response.settings);
    }).catch(() => {}).finally(() => page?.scheduleRefresh());
  }
});
