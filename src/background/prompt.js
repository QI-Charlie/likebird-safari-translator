import { STYLE_OPTIONS, languageName } from '../shared/constants.js';
import { squish, stripCodeFence, truncate } from '../shared/utils.js';

const TOKEN_RULE = [
  'Numbered pairs such as <x0> and </x0> enclose separate text slots in the original page.',
  'Read all slots in an item together for context, then translate the text inside each slot.',
  'Return each marker pair exactly once, in the original order. Keep linked or styled words in their own slot.',
  'Return only the marker pairs and their text for a marked item. An unmarked item must stay unmarked. Do not add HTML.',
].join(' ');

function stylePrompt(settings) {
  return STYLE_OPTIONS.find((item) => item.value === settings.style)?.prompt || STYLE_OPTIONS[0].prompt;
}

/** Parse `term => translation` or `term = translation` glossary lines. */
export function parseGlossary(raw) {
  return String(raw || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const match = line.match(/^(.+?)\s*(?:=>|=|\uff1d|\u2192)\s*(.+)$/);
      if (!match) return null;
      const source = match[1].trim();
      const target = match[2].trim();
      if (!source || !target) return null;
      return { source, target };
    })
    .filter(Boolean)
    .slice(0, 200);
}

function glossaryBlock(settings) {
  const entries = parseGlossary(settings.glossary);
  if (!entries.length) return '';
  return `\nGlossary (use these exact translations when the term appears):\n${entries
    .map((entry) => `- ${entry.source} => ${entry.target}`)
    .join('\n')}`;
}

function customInstruction(settings) {
  const prompt = String(settings.customPrompt || '').trim();
  if (!prompt) return '';
  return `\nAdditional user instruction (follow it unless it conflicts with the output format):\n${truncate(prompt, 2000)}`;
}

function pageContext(settings, context) {
  if (!settings.advanced?.sendPageContext) return null;
  let host = '';
  try {
    host = context?.url ? new URL(context.url).hostname : '';
  } catch {
    host = '';
  }
  return {
    title: truncate(context?.title || '', 200),
    site: host,
  };
}

/**
 * Build chat messages for a batch of blocks.
 * @param {Array<{id: string, text: string}>} items
 * @param {ReturnType<import('../shared/settings.js').mergeSettings>} settings
 * @param {{title?: string, url?: string}} context
 */
export function buildBatchMessages(items, settings, context = {}) {
  const target = languageName(settings.targetLang);
  const source =
    settings.sourceLang && settings.sourceLang !== 'auto'
      ? languageName(settings.sourceLang)
      : 'the source language, detected automatically';

  const system = `You are the translation engine inside a browser extension called LikeBird. You translate web pages from ${source} into ${target}.

Translation requirements:
- ${stylePrompt(settings)}
- Translate meaning, not words. Produce fluent ${target} prose with natural punctuation.
- Keep each item close to its original length when possible. Keep punctuation and symbols meaningful to the original.
- Keep numbers, URLs, email addresses, code identifiers, and product names intact.
- Do not summarize, explain, answer, or censor the content. Translate it.
- ${TOKEN_RULE}
- Return valid JSON only, with this exact shape: {"translations":[{"id":"<item id>","text":"<translated text>"}]}
- Include one object for every input item, in the same order. Do not wrap the JSON in Markdown fences and do not add commentary.${glossaryBlock(settings)}${customInstruction(settings)}`;

  const payload = {
    task: 'translate_blocks',
    target_language: target,
    ...(pageContext(settings, context)
      ? { page: pageContext(settings, context) }
      : {}),
    items: items.map((item) => ({ id: item.id, text: item.text })),
  };

  return [
    { role: 'system', content: system },
    { role: 'user', content: JSON.stringify(payload) },
  ];
}

/**
 * Build chat messages for a selected passage. The result is plain text rather
 * than JSON, which is both cheaper and easier to stream into a small bubble.
 */
export function buildSelectionMessages(text, settings, context = {}) {
  const target = languageName(settings.targetLang);
  const source =
    settings.sourceLang && settings.sourceLang !== 'auto'
      ? languageName(settings.sourceLang)
      : 'the source language, detected automatically';

  const system = `You are a precise translator inside a browser reading assistant. Translate the selected passage from ${source} into ${target}.

Rules:
- ${stylePrompt(settings)}
- Preserve paragraph breaks, numbers, names, code, and punctuation conventions of ${target}.
- If the selection is already in ${target}, return it unchanged.
- Output ONLY the translation. No labels, quotes, Markdown, explanations, or notes.${glossaryBlock(settings)}${customInstruction(settings)}`;

  const contextBefore = squish(context.before || '', 500);
  const contextAfter = squish(context.after || '', 500);
  const contextPayload = {
    ...(context.title ? { page_title: truncate(context.title, 180) } : {}),
    ...(contextBefore ? { text_before_selection: contextBefore } : {}),
    ...(contextAfter ? { text_after_selection: contextAfter } : {}),
  };

  const user = {
    selected_text: text,
    ...(settings.advanced?.sendPageContext && Object.keys(contextPayload).length ? { context: contextPayload } : {}),
  };

  return [
    { role: 'system', content: system },
    { role: 'user', content: JSON.stringify(user) },
  ];
}

export function buildConnectionMessages(targetLang = 'zh-CN') {
  return [
    {
      role: 'system',
      content: `You are a translation API health check. Translate the word "Hello" into ${languageName(
        targetLang,
      )}. Output only the translation, with no quotes or explanation.`,
    },
    { role: 'user', content: 'Hello' },
  ];
}

/** Extract the first balanced JSON object/array from a model response. */
export function extractBalancedJson(input) {
  const text = stripCodeFence(input);
  for (let start = 0; start < text.length; start += 1) {
    const first = text[start];
    if (first !== '{' && first !== '[') continue;
    const open = first;
    const close = first === '{' ? '}' : ']';
    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let index = start; index < text.length; index += 1) {
      const char = text[index];
      if (inString) {
        if (escaped) escaped = false;
        else if (char === '\\') escaped = true;
        else if (char === '"') inString = false;
        continue;
      }
      if (char === '"') {
        inString = true;
        continue;
      }
      if (char === open) depth += 1;
      else if (char === close) {
        depth -= 1;
        if (depth === 0) {
          const candidate = text.slice(start, index + 1);
          try {
            return JSON.parse(candidate);
          } catch {
            break;
          }
        }
      }
    }
  }
  return null;
}

function normalizeEntry(entry) {
  if (!entry || typeof entry !== 'object') return null;
  const id = String(entry.id ?? entry.item_id ?? entry.key ?? '').trim();
  const text =
    entry.text ??
    entry.translation ??
    entry.translated ??
    entry.translated_text ??
    entry.content ??
    entry.value;
  if (!id || typeof text !== 'string') return null;
  return { id, text: text.trim() };
}

function entriesFromParsed(parsed) {
  if (!parsed) return [];
  let list = [];
  if (Array.isArray(parsed)) list = parsed;
  else if (Array.isArray(parsed.translations)) list = parsed.translations;
  else if (Array.isArray(parsed.items)) list = parsed.items;
  else if (Array.isArray(parsed.results)) list = parsed.results;
  else if (parsed.translations && typeof parsed.translations === 'object') {
    list = Object.entries(parsed.translations).map(([id, text]) => ({ id, text }));
  } else if (typeof parsed === 'object') {
    const keys = Object.keys(parsed);
    if (keys.length && keys.every((key) => typeof parsed[key] === 'string')) {
      list = keys.map((key) => ({ id: key, text: parsed[key] }));
    }
  }
  return list.map(normalizeEntry).filter(Boolean);
}

function cleanPlainTranslation(value) {
  return stripCodeFence(value)
    .replace(/^(?:\u7ffb\u8bd1|\u8bd1\u6587|translation|translated text)\s*[:\uff1a]\s*/i, '')
    .trim()
    .replace(/^["\u201c](.*)["\u201d]$/s, '$1')
    .trim();
}

function parseLineFormat(text, expectedIds) {
  const map = new Map();
  for (const id of expectedIds) {
    const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(
      `(?:^|\\n)\\s*(?:【|\\[)?${escaped}(?:】|\\])?\\s*[:：\\-]\\s*([^\\n]+)`,
      'i',
    );
    const match = text.match(pattern);
    if (match?.[1]?.trim()) map.set(id, match[1].trim());
  }
  return map;
}

/**
 * Parse a batch translation response. Supports the requested JSON shape plus a
 * few common fallbacks produced by smaller or older models.
 * @param {string} raw
 * @param {string[]} expectedIds
 */
export function parseBatchResponse(raw, expectedIds = []) {
  const text = stripCodeFence(String(raw ?? '').trim());
  const expected = [...new Set(expectedIds.map(String))];
  /** @type {Map<string, string>} */
  const translations = new Map();

  const parsed = extractBalancedJson(text);
  const entries = entriesFromParsed(parsed);
  for (const entry of entries) {
    if (!entry.text) continue;
    if (!expected.length || expected.includes(entry.id)) {
      translations.set(entry.id, entry.text);
    }
  }

  // Some models return an array of bare strings in the same order.
  if (!translations.size && Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')) {
    parsed.forEach((value, index) => {
      const id = expected[index];
      if (id && value.trim()) translations.set(id, value.trim());
    });
  }

  if (!translations.size && expected.length) {
    for (const [id, value] of parseLineFormat(text, expected)) translations.set(id, value);
  }

  // A single item is unambiguous: accept plain prose when the model ignored the
  // JSON instruction. This keeps the bubble and short paragraphs resilient.
  if (!translations.size && expected.length === 1) {
    const plain = cleanPlainTranslation(text);
    if (plain && !/^[{[]/.test(plain)) translations.set(expected[0], plain);
  }

  // If the model included extra ids we do not know about, ignore them; callers
  // only render expected blocks.
  const missing = expected.filter((id) => !translations.has(id));
  return { translations, missing, raw: text };
}

export function parseSelectionResponse(raw) {
  const text = stripCodeFence(String(raw ?? '').trim());
  const withoutLabel = text
    .replace(/^(?:\u7ffb\u8bd1|\u8bd1\u6587|translation|translated text)\s*[:\uff1a]\s*/i, '')
    .trim();
  return withoutLabel.replace(/^["\u201c](.*)["\u201d]$/s, '$1').trim();
}
