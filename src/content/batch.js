/** Split blocks into API-sized batches without breaking DOM order. */
export function makeBatches(blocks, { maxItems = 10, maxChars = 6000 } = {}) {
  const batches = [];
  let current = [];
  let currentChars = 0;

  const flush = () => {
    if (current.length) batches.push(current);
    current = [];
    currentChars = 0;
  };

  for (const block of blocks) {
    const length = block.text?.length || 0;
    if (current.length && (current.length >= maxItems || currentChars + length > maxChars)) {
      flush();
    }
    current.push(block);
    currentChars += length;
    if (current.length >= maxItems) flush();
  }
  flush();
  return batches;
}

/** Run async work with bounded concurrency while preserving result order. */
export async function runPool(items, worker, concurrency = 2) {
  const results = new Array(items.length);
  let cursor = 0;
  const size = Math.max(1, Math.min(concurrency, items.length || 1));

  const runners = Array.from({ length: size }, async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(items[index], index);
    }
  });

  await Promise.all(runners);
  return results;
}
