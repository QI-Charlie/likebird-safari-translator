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

export function isInViewport(element, ratio = 1.4) {
  try {
    const rect = element.getBoundingClientRect();
    const height = window.innerHeight || 800;
    return rect.bottom > -height * 0.3 && rect.top < height * ratio;
  } catch {
    return false;
  }
}

/**
 * Translate what the reader can see first, preserving relative order inside the
 * two priority groups. Rendering is independent of dispatch order.
 */
export function prioritizeBlocks(blocks) {
  const visible = [];
  const rest = [];
  for (const block of blocks) {
    (isInViewport(block.element) ? visible : rest).push(block);
  }
  return [...visible, ...rest];
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
