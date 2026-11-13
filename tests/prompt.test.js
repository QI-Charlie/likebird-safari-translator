import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildBatchMessages,
  buildSelectionMessages,
  extractBalancedJson,
  parseBatchResponse,
  parseSelectionResponse,
  parseGlossary,
} from '../src/background/prompt.js';
import { mergeSettings } from '../src/shared/settings.js';

const settings = mergeSettings({
  targetLang: 'zh-CN',
  glossary: 'Transformer = 变换器\nRAG => 检索增强生成',
  customPrompt: '保留产品名 OpenAI。',
});

test('batch prompt includes rules, target, glossary and item ids', () => {
  const messages = buildBatchMessages(
    [{ id: 'b1', text: 'Read <x0>this</x0>.' }],
    settings,
    { title: 'Example', url: 'https://example.com/a' },
  );
  assert.equal(messages.length, 2);
  assert.match(messages[0].content, /Simplified Chinese/);
  assert.match(messages[0].content, /<x0>/);
  assert.match(messages[0].content, /Transformer => 变换器/);
  assert.match(messages[0].content, /保留产品名 OpenAI/);
  const payload = JSON.parse(messages[1].content);
  assert.equal(payload.items[0].id, 'b1');
  assert.equal(payload.items[0].text, 'Read <x0>this</x0>.');
  assert.equal(payload.page.site, 'example.com');
});

test('glossary parser accepts multiple separators and skips bad lines', () => {
  assert.deepEqual(parseGlossary('A = 甲\nB => 乙\nC＝丙\nD→丁\nbad line'), [
    { source: 'A', target: '甲' },
    { source: 'B', target: '乙' },
    { source: 'C', target: '丙' },
    { source: 'D', target: '丁' },
  ]);
});

test('extractBalancedJson survives prose and strings with braces', () => {
  const parsed = extractBalancedJson('Here you go:\n{"translations":[{"id":"b1","text":"a } b"}]}\nThanks');
  assert.equal(parsed.translations[0].text, 'a } b');
});

test('parseBatchResponse handles fenced JSON', () => {
  const raw = '```json\n{"translations":[{"id":"b1","text":"你好"},{"id":"b2","text":"世界"}]}\n```';
  const result = parseBatchResponse(raw, ['b1', 'b2', 'b3']);
  assert.equal(result.translations.get('b1'), '你好');
  assert.equal(result.translations.get('b2'), '世界');
  assert.deepEqual(result.missing, ['b3']);
});

test('parseBatchResponse handles object maps and array order fallback', () => {
  const map = parseBatchResponse('{"translations":{"b1":"甲","b2":"乙"}}', ['b1', 'b2']);
  assert.equal(map.translations.get('b2'), '乙');

  const array = parseBatchResponse('["甲","乙"]', ['b1', 'b2']);
  assert.equal(array.translations.get('b1'), '甲');
});

test('parseBatchResponse handles line-oriented output', () => {
  const raw = 'b1: 第一段\nb2：第二段';
  const result = parseBatchResponse(raw, ['b1', 'b2']);
  assert.equal(result.translations.get('b1'), '第一段');
  assert.equal(result.translations.get('b2'), '第二段');
});

test('single-item plain prose is accepted', () => {
  const result = parseBatchResponse('翻译：阅读改变我们。', ['b1']);
  assert.equal(result.translations.get('b1'), '阅读改变我们。');
});

test('selection parser strips labels and wrapping quotes', () => {
  assert.equal(parseSelectionResponse('翻译：“你好，世界”'), '你好，世界');
  assert.equal(parseSelectionResponse('```\nHello there\n```'), 'Hello there');
});

test('selection context follows the page context preference', () => {
  const settings = mergeSettings({ advanced: { sendPageContext: false } });
  const [, user] = buildSelectionMessages('Hello', settings, { title: 'Private title', before: 'Context' });
  assert.deepEqual(JSON.parse(user.content), { selected_text: 'Hello' });
});
