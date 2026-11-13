/** Decode a translation that has exactly one result for each original text node. */
export function splitTextSlots(text, count) {
  if (typeof text !== 'string') return null;
  if (count === 1) return text.trim() && !/<\/?x\d+>/i.test(text) ? [text.trim()] : null;

  const slots = [];
  const pattern = /\s*<x(\d+)>([\s\S]*?)<\/x\1>/gy;
  let offset = 0;
  for (let index = 0; index < count; index += 1) {
    const match = pattern.exec(text);
    if (!match || match[1] !== String(index) || !match[2].trim() || /<\/?x\d+>/i.test(match[2])) return null;
    slots.push(match[2].trim());
    offset = pattern.lastIndex;
  }
  return text.slice(offset).trim() ? null : slots;
}
