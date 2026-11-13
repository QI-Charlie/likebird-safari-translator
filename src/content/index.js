import { BRAND } from '../shared/constants.js';
import { mergeSettings } from '../shared/settings.js';
import { extensionApi, sendRuntimeMessage } from '../shared/storage.js';
import { hostMatchesAny } from '../shared/utils.js';
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
let overlay = null;
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

function report(state) {
  send({ type: 'page.report', state }).catch(() => {});
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
    const response = await send({ type: 'settings.get' });
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
  page?.applySettings(settings);
  selection?.updateSettings();
}

function shouldAutoTranslate() {
  if (!isTopFrame) return false;
  if (!settings.configured) return false;
  if (!settings.autoTranslateSites?.length) return false;
  return hostMatchesAny(location.hostname, settings.autoTranslateSites);
}

function installMessageBridge() {
  api.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    Promise.resolve()
      .then(async () => {
        if (message?.type === 'page.ping') return { ok: true, pong: true };
        await ready;
        if (!page) return { ok: false, error: '译流初始化失败，请刷新页面' };
        if (message?.type === 'page.status') return page.status();
        if (message?.type === 'settings.changed') {
          applySettings(message.settings);
          return { ok: true };
        }

        switch (message?.type) {
          case 'page.translate':
            if (!isTopFrame) return { ok: false, unsupported: true };
            page.start({ force: true }).catch((error) => {
              overlay.toast(error?.message || '页面翻译失败', { type: 'error' });
            });
            return { ok: true, started: true };
          case 'page.toggle':
            if (!isTopFrame) return { ok: false, unsupported: true };
            page.toggle();
            return { ok: true };
          case 'page.restore':
            if (!isTopFrame) return { ok: false, unsupported: true };
            page.restore();
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
      })
      .then(sendResponse)
      .catch((error) => {
        sendResponse({ ok: false, error: { message: error?.message || '页面脚本错误' } });
      });
    return true;
  });
}

function scheduleAutoTranslate() {
  if (!shouldAutoTranslate()) return;
  const delay = document.readyState === 'complete' ? 650 : 1200;
  window.setTimeout(() => {
    if (!page.active && !page.hasTranslations()) {
      page.start({ auto: true }).catch(() => {});
    }
  }, delay);
}

async function initialize() {
  if (initialized) return;
  document.documentElement.setAttribute('data-yiliu-version', BRAND.version);

  overlay = new OverlayUI();
  page = new PageTranslator(overlay, {
    getSettings: () => settings,
    requestBatch: (items, context) => send({ type: 'translate.batch', items, context }),
    report,
    openOptions,
  });
  selection = new SelectionController(overlay, {
    getSettings: () => settings,
    requestSelection: (text, context) =>
      send({ type: 'translate.selection', text, context }),
    openOptions,
  });
  selection.start();
  initialized = true;

  await fetchSettings();
  page.applySettings(settings);
  resolveReady();
  scheduleAutoTranslate();
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
  page?.stopObserver();
});

window.addEventListener('pageshow', (event) => {
  if (!event.persisted) return;
  selection?.start();
  if (page?.hasTranslations()) page.startObserver();
});
