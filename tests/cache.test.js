import test from 'node:test';
import assert from 'node:assert/strict';

import { CACHE_STORAGE_KEY } from '../src/shared/constants.js';
import { mergeSettings } from '../src/shared/settings.js';

const store = {};
globalThis.browser = {
  runtime: { id: 'test' },
  storage: {
    local: {
      async get(keys) {
        if (typeof keys === 'string') return { [keys]: store[keys] };
        if (Array.isArray(keys)) {
          return Object.fromEntries(keys.map((key) => [key, store[key]]));
        }
        return { ...store };
      },
      async set(values) {
        Object.assign(store, values);
      },
      async remove(keys) {
        for (const key of Array.isArray(keys) ? keys : [keys]) delete store[key];
      },
    },
  },
};

const { TranslationCache } = await import('../src/background/cache.js');
const settings = mergeSettings({ targetLang: 'zh-CN', cache: { enabled: true, maxEntries: 50 } });

test('cache stores, loads and persists translations', async () => {
  for (const key of Object.keys(store)) delete store[key];
  const cache = new TranslationCache();
  await cache.load();
  cache.configure(settings);
  assert.equal(cache.get('hello', settings), null);
  cache.set('hello', '你好', settings);
  assert.equal(cache.get('hello', settings), '你好');

  await cache.persist();
  assert.ok(store[CACHE_STORAGE_KEY]);

  const reloaded = new TranslationCache();
  await reloaded.load();
  assert.equal(reloaded.get('hello', settings), '你好');
});

test('cache prunes to the configured size and clear removes storage', async () => {
  const cache = new TranslationCache();
  await cache.load();
  cache.configure(settings);
  for (let index = 0; index < 55; index += 1) cache.set(`text-${index}`, `译文-${index}`, settings);
  assert.equal(cache.size, 50);

  await cache.clear();
  assert.equal(cache.size, 0);
  assert.equal(store[CACHE_STORAGE_KEY], undefined);
});

test('cache keys separate target language and style', () => {
  const cache = new TranslationCache();
  cache.configure(settings);
  cache.set('hello', '你好', settings);
  assert.equal(cache.get('hello', mergeSettings({ ...settings, targetLang: 'ja' })), null);
  assert.equal(cache.get('hello', mergeSettings({ ...settings, style: 'formal' })), null);
});
