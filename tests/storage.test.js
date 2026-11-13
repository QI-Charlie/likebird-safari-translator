import test from 'node:test';
import assert from 'node:assert/strict';

import { callApi } from '../src/shared/storage.js';

test('callApi supports callback-style extension APIs', async () => {
  const target = {
    get(keys, callback) {
      setTimeout(() => callback({ value: keys }), 1);
    },
  };
  const result = await callApi(target, 'get', ['key']);
  assert.deepEqual(result, { value: 'key' });
});

test('callApi supports promise-style extension APIs', async () => {
  const target = {
    async get(keys) {
      return { value: keys };
    },
  };
  const result = await callApi(target, 'get', ['key']);
  assert.deepEqual(result, { value: 'key' });
});

test('callApi rejects callback-style runtime errors', async () => {
  globalThis.chrome = {
    runtime: {
      lastError: { message: 'nope' },
    },
  };
  const target = {
    send(message, callback) {
      callback(undefined);
    },
  };
  await assert.rejects(() => callApi(target, 'send', ['hello']), /nope/);
  delete globalThis.chrome;
});

test('callApi rejects a missing API method', async () => {
  await assert.rejects(() => callApi({}, 'missing', []), /API/);
});

test('storage and runtime helpers work with callback-only chrome namespace', async () => {
  const { storageGet, sendRuntimeMessage } = await import('../src/shared/storage.js');
  globalThis.chrome = {
    runtime: {
      id: 'mock',
      sendMessage(message, callback) {
        setTimeout(() => callback({ ok: true, echo: message.type }), 1);
      },
    },
    storage: {
      local: {
        get(keys, callback) {
          setTimeout(() => callback({ settings: { targetLang: 'ja' } }), 1);
        },
      },
    },
  };
  const stored = await storageGet('settings');
  assert.equal(stored.settings.targetLang, 'ja');
  const response = await sendRuntimeMessage({ type: 'settings.get' }, 5000);
  assert.equal(response.echo, 'settings.get');
  delete globalThis.chrome;
});
