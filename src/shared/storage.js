import { SETTINGS_STORAGE_KEY } from './constants.js';
import { mergeSettings } from './settings.js';

/** @returns {typeof browser | typeof chrome | undefined} */
export function extensionApi() {
  // Prefer the callback-flavoured namespace when Safari exposes it. callApi()
  // still supports promise-only implementations (Firefox and some Safari
  // versions) through the returned Promise.
  if (globalThis.chrome?.runtime?.id) return globalThis.chrome;
  return globalThis.browser ?? globalThis.chrome;
}

export function hasPromiseApi() {
  return Boolean(globalThis.browser?.runtime?.id);
}

function runtimeLastError() {
  try {
    return extensionApi()?.runtime?.lastError || globalThis.chrome?.runtime?.lastError || null;
  } catch {
    return null;
  }
}

/**
 * Call a WebExtension API that may be either callback-based (Chrome/Safari) or
 * promise-based (Firefox/newer Safari). Passing the callback is harmless for
 * promise implementations and keeps the extension working in both worlds.
 */
export function callApi(target, method, args = [], { timeoutMs = 30000 } = {}) {
  return new Promise((resolve, reject) => {
    const fn = target?.[method];
    if (typeof fn !== 'function') {
      reject(new Error(`扩展 API 不可用：${method}`));
      return;
    }

    let settled = false;
    const timer = setTimeout(() => {
      settle(new Error(`扩展 API 超时：${method}`));
    }, timeoutMs);

    function settle(error, value) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (error) reject(error);
      else resolve(value);
    }

    const callback = (value) => {
      const error = runtimeLastError();
      if (error) settle(new Error(error.message || String(error)));
      else settle(null, value);
    };

    let returned;
    try {
      returned = fn.apply(target, [...args, callback]);
    } catch (error) {
      // A few promise-only implementations reject an extra callback argument.
      // Retry once without it; the method did not run on the failed call.
      if (/argument|parameter|callback|type/i.test(String(error?.message || ''))) {
        try {
          returned = fn.apply(target, args);
          if (returned && typeof returned.then === 'function') {
            returned.then(
              (value) => settle(null, value),
              (retryError) => settle(retryError),
            );
            return;
          }
          settle(null, returned);
          return;
        } catch {
          // Fall through to the original, more useful error.
        }
      }
      settle(error);
      return;
    }

    if (returned && typeof returned.then === 'function') {
      returned.then(
        (value) => settle(null, value),
        (error) => settle(error),
      );
    }
  });
}

export async function storageGet(keys) {
  const api = extensionApi();
  if (!api?.storage?.local) throw new Error('扩展存储不可用');
  return callApi(api.storage.local, 'get', [keys], { timeoutMs: 15000 });
}

export async function storageSet(values) {
  const api = extensionApi();
  if (!api?.storage?.local) throw new Error('扩展存储不可用');
  return callApi(api.storage.local, 'set', [values], { timeoutMs: 15000 });
}

export async function storageRemove(keys) {
  const api = extensionApi();
  if (!api?.storage?.local) throw new Error('扩展存储不可用');
  return callApi(api.storage.local, 'remove', [keys], { timeoutMs: 15000 });
}

export async function loadSettings() {
  const data = await storageGet(SETTINGS_STORAGE_KEY);
  return mergeSettings(data?.[SETTINGS_STORAGE_KEY]);
}

export async function saveSettings(settings) {
  const clean = mergeSettings(settings);
  await storageSet({ [SETTINGS_STORAGE_KEY]: clean });
  return clean;
}

/** Send a runtime message with a long timeout (translation can be slow). */
export async function sendRuntimeMessage(message, timeoutMs = 300000) {
  const api = extensionApi();
  if (!api?.runtime?.sendMessage) throw new Error('扩展消息通道不可用');
  return callApi(api.runtime, 'sendMessage', [message], { timeoutMs });
}
