import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from './support/linkedom.mjs';
import { PageTranslator } from '../src/content/page.js';
import { mergeSettings } from '../src/shared/settings.js';

test('cancelled responses cannot render or change the next page translation run', async () => {
  const { document } = parseHTML('<html><body><p>Hello world.</p></body></html>');
  globalThis.document = document;
  globalThis.location = new URL('https://example.test/');
  globalThis.MutationObserver = class {
    observe() {}
    disconnect() {}
  };
  const batches = [];
  const translator = new PageTranslator({
    getSettings: () => mergeSettings({}),
    requestBatch: (items) => new Promise((resolve) => batches.push({ items, resolve })),
    report() {},
  });
  function finishBatch(index, text) {
    const { items, resolve } = batches[index];
    resolve({ ok: true, translations: { [items[0].id]: text } });
  }

  const oldRun = translator.start();
  translator.cancel();
  const newRun = translator.start();
  finishBatch(0, '旧译文');
  await oldRun;
  assert.equal(translator.status().active, true);
  assert.equal(translator.status().hasTranslation, false);

  finishBatch(1, '你好，世界。');
  await newRun;
  const status = translator.status();
  assert.equal(status.active, false);
  assert.equal(status.translated, status.total);
  assert.equal(document.querySelector('p').firstChild.data, '你好，世界。');
});

test('translation and restore preserve the original text nodes, markup and link behavior', async () => {
  const { document } = parseHTML(
    '<html lang="en"><head></head><body><p class="original" style="color:red">Read <a href="/more"><b>this</b></a> now.<br>Next line.</p></body></html>',
  );
  globalThis.document = document;
  globalThis.location = new URL('https://example.test/');
  const paragraph = document.querySelector('p');
  const link = paragraph.querySelector('a');
  const emphasis = link.querySelector('b');
  const original = document.toString();
  const originalChildren = [...paragraph.childNodes];
  const emphasisText = emphasis.firstChild;
  let clicks = 0;
  link.addEventListener('click', () => { clicks += 1; });
  let malformed = true;
  const translator = new PageTranslator({
    getSettings: () => mergeSettings({}),
    async requestBatch(items) {
      return { ok: true, translations: Object.fromEntries(items.map(({ id, slots }) => [
        id,
        slots === 1 ? '下一行。' : malformed ? '缺少位置標記'
          : '<x0>請閱讀</x0><x1><img src=x onerror=alert(1)></x1><x2>吧。</x2>',
      ])) };
    },
    report() {},
  });
  await translator.start();
  assert.equal(paragraph.firstChild.data, 'Read ');
  assert.equal(translator.status().errors, 1);
  malformed = false;
  await translator.retryFailed();
  assert.deepEqual([...paragraph.childNodes], originalChildren);
  assert.equal(emphasis.firstChild, emphasisText);
  assert.equal(emphasisText.data, '<img src=x onerror=alert(1)>');
  assert.equal(paragraph.querySelector('img'), null);
  assert.equal(paragraph.firstChild.data, '請閱讀 ');
  assert.equal(paragraph.lastChild.data, '下一行。');
  assert.equal(link.getAttribute('href'), '/more');
  translator.applySettings(mergeSettings({ displayMode: 'bilingual' }));
  assert.equal(paragraph.firstChild.data, 'Read ');
  assert.equal(emphasis.firstChild, emphasisText);
  assert.equal(emphasisText.data, 'this');
  const bilingual = [...paragraph.querySelectorAll('[data-ee-bilingual]')];
  assert.equal(bilingual.length, 2);
  assert.equal(bilingual[0].querySelector('img'), null);
  assert.match(bilingual[0].textContent, /請閱讀/);
  assert.equal(bilingual[1].textContent, '下一行。');
  translator.applySettings(mergeSettings({ displayMode: 'translation' }));
  assert.equal(paragraph.querySelector('[data-ee-bilingual]'), null);
  assert.equal(paragraph.firstChild.data, '請閱讀 ');
  link.click();
  assert.equal(clicks, 1);
  translator.restore();
  assert.equal(document.toString(), original);
  assert.equal(emphasis.firstChild, emphasisText);
});
