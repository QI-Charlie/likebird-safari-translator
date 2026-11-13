import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from './support/linkedom.mjs';

import {
  collectBlocks,
  insertTranslation,
  pageLooksLikeTarget,
  renderTranslation,
  restoreTranslations,
  serializeBlock,
} from '../src/content/dom.js';

function makeDom(body) {
  const { document, window } = parseHTML(
    `<!doctype html><html lang="en"><body>${body}</body></html>`,
  );
  return { window, document };
}

test('collectBlocks finds leaf blocks and skips code, hidden and translated nodes', () => {
  const { document } = makeDom(`
    <h1>Hello world</h1>
    <p>Read <a href="/x"><strong>this</strong></a> now.</p>
    <div><p>Nested paragraph</p></div>
    <pre><code>const x = 1</code></pre>
    <div style="display:none"><p>Hidden paragraph</p></div>
    <p data-yiliu-block="old">Already translated</p>
    <ul><li>Item <b>one</b></li></ul>
    <button>Do not translate</button>
  `);
  const blocks = collectBlocks(document.body);
  const texts = blocks.map((block) => block.text);
  assert.ok(texts.includes('Hello world'));
  assert.ok(texts.includes('Read <x0><x1>this</x1></x0> now.'));
  assert.ok(texts.includes('Nested paragraph'));
  assert.ok(texts.includes('Item <x0>one</x0>'));
  assert.equal(texts.some((text) => text.includes('const x')), false);
  assert.equal(texts.some((text) => text.includes('Hidden')), false);
  assert.equal(texts.some((text) => text.includes('Already')), false);
  assert.equal(texts.some((text) => text.includes('Do not')), false);
});

test('serializeBlock preserves inline token structure and attributes', () => {
  const { document } = makeDom(
    '<p>Read <a href="https://example.com/x" title="More"><em>this</em></a> now.</p>',
  );
  const paragraph = document.querySelector('p');
  const { text, tokens } = serializeBlock(paragraph);
  assert.equal(text, 'Read <x0><x1>this</x1></x0> now.');
  assert.equal(tokens.get(0).tag, 'a');
  assert.equal(tokens.get(0).attrs.href, 'https://example.com/x');
  assert.equal(tokens.get(1).tag, 'em');
});

test('renderTranslation reconstructs safe inline HTML', () => {
  const { document } = makeDom(
    '<p><a href="https://example.com/x"><strong>this</strong></a></p>',
  );
  const { tokens } = serializeBlock(document.querySelector('p'));
  const html = renderTranslation('阅读 <x0><x1>这个</x1></x0> 吧。', tokens);
  assert.match(html, /<a class="yiliu-inline-link" href="https:\/\/example.com\/x">/);
  assert.match(html, /<strong>这个<\/strong>/);
  assert.match(html, /阅读 /);
});

test('renderTranslation escapes HTML and rejects javascript links', () => {
  const { document } = makeDom('<p><a href="javascript:alert(1)">click</a></p>');
  const { tokens } = serializeBlock(document.querySelector('p'));
  const html = renderTranslation('<img src=x onerror=alert(1)> <x0>点</x0>', tokens);
  assert.match(html, /&lt;img/);
  assert.equal(html.includes('<img'), false);
  assert.equal(html.includes('javascript:'), false);
  assert.match(html, /点/);
});

test('renderTranslation falls back when markers are unbalanced', () => {
  const { document } = makeDom('<p><a href="/x">link</a></p>');
  const { tokens } = serializeBlock(document.querySelector('p'));
  const html = renderTranslation('译文 </x0> 结束', tokens);
  assert.equal(html.includes('<a'), false);
  assert.match(html, /译文/);
});

test('insertTranslation and restoreTranslations mutate the page safely', () => {
  const { document } = makeDom('<p id="p">Hello</p>');
  const paragraph = document.getElementById('p');
  const node = insertTranslation(paragraph, '<strong>你好</strong>', {
    lang: 'zh-CN',
    id: 'b1',
  });
  assert.equal(paragraph.getAttribute('data-yiliu-block'), 'b1');
  assert.equal(paragraph.nextElementSibling, node);
  assert.equal(node.getAttribute('data-yiliu-translation'), '');
  assert.equal(node.querySelector('strong').textContent, '你好');

  restoreTranslations(document);
  assert.equal(document.querySelector('[data-yiliu-translation]'), null);
  assert.equal(paragraph.hasAttribute('data-yiliu-block'), false);
});

test('list item translations wrap the original and restore cleanly', () => {
  const { document } = makeDom('<ul><li>Hello</li></ul>');
  const li = document.querySelector('li');
  const node = insertTranslation(li, '你好', { lang: 'zh-CN', id: 'b1' });
  assert.equal(node.parentElement, li);
  assert.equal(li.querySelector('.yiliu-original').textContent, 'Hello');

  restoreTranslations(document);
  assert.equal(li.textContent, 'Hello');
  assert.equal(li.querySelector('.yiliu-original'), null);
  assert.equal(li.classList.contains('yiliu-inner'), false);
});

test('line breaks survive serialization and are restored as breaks', () => {
  const { document } = makeDom('<p>First line<br>Second line</p>');
  const { text, tokens } = serializeBlock(document.querySelector('p'));
  assert.equal(text, 'First line\nSecond line');
  assert.equal(renderTranslation(text, tokens), 'First line<br>Second line');
});

test('page language detection respects Chinese scripts', () => {
  const { document } = makeDom('');
  document.documentElement.lang = 'en-US';
  assert.equal(pageLooksLikeTarget('en', document), true);
  assert.equal(pageLooksLikeTarget('zh-CN', document), false);
  document.documentElement.lang = 'zh-TW';
  assert.equal(pageLooksLikeTarget('zh-CN', document), false);
  assert.equal(pageLooksLikeTarget('zh-TW', document), true);
});
