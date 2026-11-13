import test from 'node:test';
import assert from 'node:assert/strict';

import { makeBatches, runPool } from '../src/content/batch.js';

const block = (length) => ({ text: 'x'.repeat(length) });

test('makeBatches respects item and character limits', () => {
  const batches = makeBatches([block(10), block(10), block(10), block(10)], {
    maxItems: 2,
    maxChars: 100,
  });
  assert.equal(batches.length, 2);
  assert.equal(batches[0].length, 2);
});

test('makeBatches keeps long blocks in their own batch', () => {
  const batches = makeBatches([block(4), block(120), block(4)], {
    maxItems: 10,
    maxChars: 50,
  });
  assert.deepEqual(
    batches.map((batch) => batch.length),
    [1, 1, 1],
  );
});

test('runPool bounds concurrency and preserves result order', async () => {
  let active = 0;
  let peak = 0;
  const results = await runPool(
    [1, 2, 3, 4, 5],
    async (value) => {
      active += 1;
      peak = Math.max(peak, active);
      await new Promise((resolve) => setTimeout(resolve, 10));
      active -= 1;
      return value * 2;
    },
    2,
  );
  assert.deepEqual(results, [2, 4, 6, 8, 10]);
  assert.ok(peak <= 2);
});
