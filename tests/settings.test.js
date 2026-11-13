import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_SETTINGS,
  isProviderConfigured,
  mergeSettings,
  providerRequiresKey,
  publicSettings,
} from '../src/shared/settings.js';
import { linesToArray, hostMatchesRule } from '../src/shared/utils.js';

test('mergeSettings fills defaults and preserves nested values', () => {
  const settings = mergeSettings({
    targetLang: 'ja',
    provider: { apiKey: 'secret', model: 'custom-model' },
  });
  assert.equal(settings.targetLang, 'ja');
  assert.equal(settings.provider.apiKey, 'secret');
  assert.equal(settings.provider.model, 'custom-model');
  assert.equal(settings.provider.baseUrl, DEFAULT_SETTINGS.provider.baseUrl);
  assert.equal(settings.batch.concurrency, 2);
});

test('mergeSettings clamps hostile or malformed values', () => {
  const settings = mergeSettings({
    targetLang: 'not-a-language',
    style: 'weird',
    batch: { maxItems: 999, concurrency: -4 },
    cache: { maxEntries: 2 },
    advanced: { timeoutMs: 1 },
  });
  assert.equal(settings.targetLang, 'zh-CN');
  assert.equal(settings.style, 'natural');
  assert.equal(settings.batch.maxItems, 16);
  assert.equal(settings.batch.concurrency, 1);
  assert.equal(settings.cache.maxEntries, 50);
  assert.equal(settings.advanced.timeoutMs, 5000);
});

test('the previous Traditional Chinese default migrates while explicit new choices persist', () => {
  assert.equal(mergeSettings({ schemaVersion: 2, targetLang: 'zh-TW' }).targetLang, 'zh-CN');
  assert.equal(mergeSettings({ schemaVersion: 1, targetLang: 'ja' }).targetLang, 'ja');
  assert.equal(mergeSettings({ ...DEFAULT_SETTINGS, targetLang: 'zh-TW' }).targetLang, 'zh-TW');
});

test('public settings never expose API credentials', () => {
  const settings = mergeSettings({
    provider: { apiKey: 'sk-very-secret', baseUrl: 'https://api.example.com/v1', model: 'm' },
  });
  const safe = publicSettings(settings);
  assert.equal(safe.provider.apiKey, undefined);
  assert.equal(safe.provider.apiKeySet, true);
  assert.equal(safe.configured, true);
  assert.equal(JSON.stringify(safe).includes('sk-very-secret'), false);
  const withHeaders = mergeSettings({ provider: { extraHeaders: 'Authorization: Bearer private' } });
  assert.equal(publicSettings(withHeaders).provider.extraHeaders, undefined);
});

test('local endpoints can be keyless; remote endpoints cannot', () => {
  const local = mergeSettings({
    provider: { preset: 'ollama', baseUrl: 'http://127.0.0.1:11434/v1', apiKey: '', model: 'qwen' },
  });
  assert.equal(providerRequiresKey(local.provider), false);
  assert.equal(isProviderConfigured(local), true);

  const remote = mergeSettings({
    provider: { preset: 'deepseek', baseUrl: 'https://api.deepseek.com/v1', apiKey: '', model: 'deepseek-chat' },
  });
  assert.equal(providerRequiresKey(remote.provider), true);
  assert.equal(isProviderConfigured(remote), false);
});

test('domain rules cover subdomains and ignore schemes', () => {
  assert.equal(hostMatchesRule('news.ycombinator.com', 'ycombinator.com'), true);
  assert.equal(hostMatchesRule('news.ycombinator.com', '*.ycombinator.com'), true);
  assert.equal(hostMatchesRule('notycombinator.com', 'ycombinator.com'), false);
  assert.equal(hostMatchesRule('example.com', 'https://example.com/path'), true);
  assert.equal(hostMatchesRule('example.com', '*'), true);
});

test('linesToArray trims, dedupes and drops empty lines', () => {
  assert.deepEqual(linesToArray(' a \n\nb\na\n  c  '), ['a', 'b', 'c']);
});
