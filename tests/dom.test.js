import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from './support/linkedom.mjs';

import {
  collectBlocks,
  pageLooksLikeTarget,
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
  assert.ok(texts.includes('<x0>Read</x0> <x1>this</x1> <x2>now.</x2>'));
  assert.ok(texts.includes('Nested paragraph'));
  assert.ok(texts.includes('<x0>Item</x0> <x1>one</x1>'));
  assert.equal(texts.some((text) => text.includes('const x')), false);
  assert.equal(texts.some((text) => text.includes('Hidden')), false);
  assert.equal(texts.some((text) => text.includes('Already')), false);
  assert.equal(texts.some((text) => text.includes('Do not')), false);
});

test('inline text maps to its original nodes and line breaks stay outside translation', () => {
  const { document } = makeDom('<p>Read <a href="/x"><em>this</em></a><br>Second line</p>');
  const paragraph = document.querySelector('p');
  const [first, second] = collectBlocks(document.body);
  assert.equal(first.text, '<x0>Read</x0> <x1>this</x1>');
  assert.equal(first.parts[0].node, paragraph.firstChild);
  assert.equal(first.parts[1].node, paragraph.querySelector('em').firstChild);
  assert.equal(second.text, 'Second line');
  assert.equal(second.parts[0].node, paragraph.lastChild);
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
