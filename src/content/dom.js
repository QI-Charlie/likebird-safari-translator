import { LIMITS } from '../shared/constants.js';
import {
  escapeAttribute,
  escapeHtml,
  uid,
} from '../shared/utils.js';

/** Elements that can represent a paragraph-like unit. */
export const BLOCK_TAGS = new Set([
  'P',
  'LI',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'BLOCKQUOTE',
  'FIGCAPTION',
  'DT',
  'DD',
  'TD',
  'TH',
  'CAPTION',
  'SUMMARY',
  'DIV',
  'SECTION',
  'ARTICLE',
  'MAIN',
  'ASIDE',
  'HEADER',
  'FOOTER',
  'FIGURE',
  'ADDRESS',
]);

/** Inline elements worth preserving across translation. */
export const TOKEN_TAGS = new Set([
  'A',
  'STRONG',
  'B',
  'EM',
  'I',
  'U',
  'S',
  'DEL',
  'INS',
  'MARK',
  'CODE',
  'KBD',
  'SAMP',
  'VAR',
  'SUP',
  'SUB',
  'ABBR',
  'CITE',
  'Q',
  'SMALL',
  'TIME',
]);

export const SKIP_TAGS = new Set([
  'SCRIPT',
  'STYLE',
  'NOSCRIPT',
  'TEMPLATE',
  'HEAD',
  'META',
  'LINK',
  'TITLE',
  'TEXTAREA',
  'INPUT',
  'SELECT',
  'OPTION',
  'OPTGROUP',
  'BUTTON',
  'PRE',
  'SVG',
  'MATH',
  'CANVAS',
  'VIDEO',
  'AUDIO',
  'IFRAME',
  'OBJECT',
  'EMBED',
  'IMG',
  'PICTURE',
  'SOURCE',
  'TRACK',
  'MAP',
  'AREA',
]);

const SKIP_SELECTOR = [
  '[translate="no"]',
  '.notranslate',
  '[contenteditable="true"]',
  '[contenteditable=""]',
  '[aria-hidden="true"]',
  '[data-yiliu-block]',
  '[data-yiliu-translation]',
  '[data-yiliu-skip]',
  '[role="button"]',
  '[role="tab"]',
  '[role="menuitem"]',
  '[role="tooltip"]',
].join(',');

function isElement(node) {
  return node && node.nodeType === 1;
}

function isText(node) {
  return node && node.nodeType === 3;
}

export function isSkippedElement(element) {
  if (!isElement(element)) return true;
  if (SKIP_TAGS.has(element.tagName)) return true;
  if (element.isContentEditable) return true;
  try {
    if (element.matches(SKIP_SELECTOR)) return true;
    if (element.closest('[translate="no"], .notranslate, [contenteditable="true"]')) return true;
  } catch {
    // Invalid selector on exotic DOM implementations; do not fail the page.
  }
  return false;
}

/**
 * A conservative visibility check. `checkVisibility` is fast and handles
 * `content-visibility`; older Safari falls back to computed style + layout.
 */
export function isVisible(element, windowObject = globalThis.window) {
  if (!isElement(element) || !element.isConnected) return false;
  if (element.hasAttribute?.('hidden')) return false;
  const inlineStyle = element.getAttribute?.('style') || '';
  if (/display\s*:\s*none|visibility\s*:\s*(?:hidden|collapse)/i.test(inlineStyle)) return false;
  const view = windowObject || element.ownerDocument?.defaultView;
  if (!view) return true;
  try {
    const style = view.getComputedStyle(element);
    if (!style) return true;
    if (style.display === 'none' || style.visibility === 'hidden' || style.visibility === 'collapse') {
      return false;
    }
    if (Number.parseFloat(style.opacity) === 0) return false;
    if (typeof element.checkVisibility === 'function') {
      return element.checkVisibility({
        checkOpacity: true,
        checkVisibilityCSS: true,
      });
    }
    return element.getClientRects().length > 0;
  } catch {
    return true;
  }
}

function hasMeaningfulText(element, view) {
  if (!element.textContent || !element.textContent.trim()) return false;
  return isVisible(element, view);
}

function containsBlockDescendant(element, view, depth = 0) {
  if (depth > 8) return false;
  for (const child of element.children) {
    if (isSkippedElement(child)) continue;
    if (SKIP_TAGS.has(child.tagName)) continue;
    if (BLOCK_TAGS.has(child.tagName) && hasMeaningfulText(child, view)) return true;
    if (containsBlockDescendant(child, view, depth + 1)) return true;
  }
  return false;
}

function inlineAttributes(element) {
  const attrs = {};
  const read = (name) => {
    const value = element.getAttribute(name);
    if (value) attrs[name] = value;
  };
  if (element.tagName === 'A') {
    read('href');
    read('title');
    read('target');
    read('rel');
  } else if (element.tagName === 'ABBR' || element.tagName === 'TIME') {
    read('title');
    read('datetime');
  } else if (element.tagName === 'Q') {
    read('cite');
  }
  return attrs;
}

/**
 * Serialize a block to plain text while replacing meaningful inline elements
 * with balanced `<xN>` markers. The token map lets us reconstruct links and
 * emphasis without ever trusting model-generated HTML.
 */
export function serializeBlock(element) {
  const tokens = new Map();
  let tokenId = 0;
  let out = '';

  const appendText = (text) => {
    if (!text) return;
    out += String(text)
      .replace(/\u00a0/g, ' ')
      .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, ' ');
  };

  const walk = (node) => {
    if (isText(node)) {
      appendText(node.nodeValue);
      return;
    }
    if (!isElement(node)) return;
    if (SKIP_TAGS.has(node.tagName)) return;
    if (isSkippedElement(node)) return;

    if (node.tagName === 'BR') {
      appendText('\n');
      return;
    }

    if (TOKEN_TAGS.has(node.tagName) && !isSkippedElement(node)) {
      const inner = node.textContent?.trim() || '';
      if (inner) {
        const id = tokenId;
        tokenId += 1;
        tokens.set(id, { tag: node.tagName.toLowerCase(), attrs: inlineAttributes(node) });
        out += `<x${id}>`;
        for (const child of node.childNodes) walk(child);
        out += `</x${id}>`;
        return;
      }
    }

    for (const child of node.childNodes) walk(child);
  };

  for (const child of element.childNodes) walk(child);
  const text = out
    .replace(/\u00a0/g, ' ')
    .replace(/[\t\f\v ]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return { text, tokens };
}

function stripTokens(text) {
  return String(text || '').replace(/<\/?x\d+>/g, '');
}

function isMostlyUrl(text) {
  return /^(?:https?:\/\/|www\.)\S+$/i.test(text);
}

export function isTranslatableText(text) {
  const plain = stripTokens(text);
  if (!plain || plain.trim().length < 2) return false;
  if (isMostlyUrl(plain)) return false;
  if (!/[\p{L}\p{N}]/u.test(plain)) return false;
  if (!/[\p{L}]/u.test(plain) && plain.replace(/\d/g, '').trim().length < 3) return false;
  return true;
}

function elementHasFormControls(element) {
  return Boolean(element.querySelector('input, textarea, select, button'));
}

function shouldTranslateElement(element, block, view) {
  if (isSkippedElement(element)) return false;
  if (!block || !isTranslatableText(block.text)) return false;
  if (!isVisible(element, view)) return false;
  if (elementHasFormControls(element) && stripTokens(block.text).length < 80) return false;
  return true;
}

/**
 * @typedef {Object} BlockRecord
 * @property {string} id
 * @property {HTMLElement} element
 * @property {string} text
 * @property {Map<number, {tag: string, attrs: Record<string,string>}>} tokens
 */

/**
 * Collect leaf-level block elements. Nested blocks are traversed rather than
 * translated twice; inline wrappers are kept as tokens.
 * @param {HTMLElement} root
 * @param {{limit?: number, maxChars?: number}} [options]
 * @returns {BlockRecord[]}
 */
export function collectBlocks(root, options = {}) {
  const view = root?.ownerDocument?.defaultView || globalThis.window;
  const limit = Math.max(1, Math.min(options.limit || 600, LIMITS.maxPageBlocks));
  const maxChars = options.maxChars || LIMITS.maxBlockChars;
  const blocks = [];

  const visit = (element) => {
    if (blocks.length >= limit) return;
    if (!isElement(element)) return;
    if (isSkippedElement(element)) return;
    if (!isVisible(element, view)) return;

    const tag = element.tagName;
    if (tag === 'BODY' || tag === 'HTML') {
      for (const child of element.children) visit(child);
      return;
    }

    const isCandidate = BLOCK_TAGS.has(tag) || (tag.includes('-') && !SKIP_TAGS.has(tag));
    if (isCandidate) {
      if (containsBlockDescendant(element, view)) {
        for (const child of element.children) visit(child);
        return;
      }
      const serialized = serializeBlock(element);
      if (serialized.text.length > maxChars) return;
      if (!shouldTranslateElement(element, serialized, view)) return;
      blocks.push({
        id: uid('b'),
        element,
        text: serialized.text,
        tokens: serialized.tokens,
      });
      return;
    }

    // Custom elements and inline wrappers can contain the actual paragraphs.
    for (const child of element.children) visit(child);
  };

  if (root) visit(root);
  return blocks;
}

function safeHref(value) {
  const href = String(value || '').trim();
  if (!href) return '';
  if (/^(?:#|\/(?!\/)|\.{1,2}\/|\?)/.test(href)) return href;
  try {
    const url = new URL(href, 'https://yiliu.invalid/');
    if (url.protocol === 'http:' || url.protocol === 'https:') return href;
    if (url.protocol === 'mailto:' || url.protocol === 'tel:') return href;
  } catch {
    return '';
  }
  return '';
}

function openTag(token) {
  if (!token) return '';
  const tag = token.tag;
  const attrs = token.attrs || {};
  if (tag === 'a') {
    const href = safeHref(attrs.href);
    const pieces = ['<a class="yiliu-inline-link"'];
    if (href) pieces.push(` href="${escapeAttribute(href)}"`);
    if (attrs.title) pieces.push(` title="${escapeAttribute(attrs.title)}"`);
    if (attrs.target === '_blank' || attrs.target === '_self') {
      pieces.push(` target="${attrs.target}"`);
    }
    if (attrs.target === '_blank') pieces.push(' rel="noopener noreferrer"');
    pieces.push('>');
    return pieces.join('');
  }
  if (tag === 'abbr' || tag === 'time') {
    return `<${tag}${attrs.title ? ` title="${escapeAttribute(attrs.title)}"` : ''}${
      attrs.datetime ? ` datetime="${escapeAttribute(attrs.datetime)}"` : ''
    }>`;
  }
  if (tag === 'q' && attrs.cite) {
    return `<q cite="${escapeAttribute(safeHref(attrs.cite))}">`;
  }
  return `<${tag}>`;
}

function fallbackPlain(raw) {
  return escapeHtml(String(raw || '').replace(/<\/?x\d+>/gi, '')).replace(/\n/g, '<br>');
}

/**
 * Turn a translated string containing `<xN>` markers back into a safe HTML
 * fragment. Any malformed marker stream falls back to plain text rather than
 * risking broken markup.
 */
export function renderTranslation(raw, tokens) {
  let text = String(raw || '').trim();
  if (!text) return '';
  text = text
    .replace(/^```[a-zA-Z0-9_-]*\s*\n?/, '')
    .replace(/\n?```\s*$/, '')
    .trim();
  text = text.replace(/&lt;(\/?)x(\d+)&gt;/gi, '<$1x$2>');

  const hasMarkers = /<\/?x\d+>/i.test(text);
  if (!hasMarkers || !tokens || !tokens.size) return fallbackPlain(text);

  const pattern = /<(\/?)x(\d+)>/gi;
  let cursor = 0;
  let output = '';
  const stack = [];
  let match;
  let valid = true;

  while ((match = pattern.exec(text))) {
    const before = text.slice(cursor, match.index);
    if (before) output += fallbackPlain(before);
    cursor = pattern.lastIndex;
    const closing = Boolean(match[1]);
    const id = Number(match[2]);
    const token = tokens.get(id);
    if (!token) {
      // Unknown marker: drop the marker but keep surrounding text.
      continue;
    }
    if (!closing) {
      output += openTag(token);
      stack.push(id);
    } else {
      if (!stack.length || stack[stack.length - 1] !== id) {
        valid = false;
        break;
      }
      output += `</${token.tag}>`;
      stack.pop();
    }
  }
  if (!valid || stack.length) return fallbackPlain(text);
  output += fallbackPlain(text.slice(cursor));
  return output || fallbackPlain(text);
}

const INNER_TRANSLATION_TAGS = new Set(['TD', 'TH', 'LI', 'DT', 'DD', 'SUMMARY', 'CAPTION']);

function insertionParent(block) {
  return INNER_TRANSLATION_TAGS.has(block.tagName) ? block : null;
}

/**
 * Table/list cells cannot be hidden wholesale, so keep their original content
 * inside a `display: contents` wrapper. Bilingual mode is layout-neutral;
 * replace mode collapses the wrapper and leaves only the translation.
 */
function wrapOriginalContent(block) {
  if (block._yiliuOriginalSpan?.isConnected) return;
  const existing = block.querySelector(':scope > [data-yiliu-original]');
  if (existing) {
    block._yiliuOriginalSpan = existing;
    block.classList.add('yiliu-inner');
    return;
  }
  const doc = block.ownerDocument;
  const span = doc.createElement('span');
  span.className = 'yiliu-original';
  span.setAttribute('data-yiliu-original', '');
  while (block.firstChild) span.appendChild(block.firstChild);
  block.appendChild(span);
  block._yiliuOriginalSpan = span;
  block.classList.add('yiliu-inner');
}

/**
 * Insert a translation node, either inside table/list cells or immediately
 * after ordinary paragraph-like elements.
 */
export function insertTranslation(block, html, { lang, id }) {
  const doc = block.ownerDocument;
  if (block._yiliuTranslationNode?.isConnected) {
    block._yiliuTranslationNode.remove();
  }
  for (const stale of block.querySelectorAll(':scope > [data-yiliu-translation]')) stale.remove();

  const parent = insertionParent(block);
  if (parent) wrapOriginalContent(block);

  const node = doc.createElement('div');
  node.className = 'yiliu-translation';
  node.setAttribute('data-yiliu-translation', '');
  node.setAttribute('data-yiliu-for', id);
  node.setAttribute('lang', lang || '');
  node.setAttribute('dir', 'auto');
  node.innerHTML = html;

  if (parent) {
    if (block.tagName === 'LI') {
      const nested = [...block.children].find(
        (child) => child !== node && BLOCK_TAGS.has(child.tagName) && child.tagName !== 'P',
      );
      if (nested) block.insertBefore(node, nested);
      else block.appendChild(node);
    } else {
      block.appendChild(node);
    }
  } else {
    block.insertAdjacentElement('afterend', node);
  }

  block.setAttribute('data-yiliu-block', id);
  block.setAttribute('data-yiliu-state', 'done');
  block._yiliuTranslationNode = node;
  return node;
}

export function markBlockState(block, state) {
  if (!block) return;
  block.setAttribute('data-yiliu-state', state);
}

export function restoreTranslations(root = document) {
  root.querySelectorAll?.('[data-yiliu-original]').forEach((wrapper) => {
    const parent = wrapper.parentElement;
    if (!parent) return;
    while (wrapper.firstChild) parent.insertBefore(wrapper.firstChild, wrapper);
    wrapper.remove();
  });
  root.querySelectorAll?.('[data-yiliu-translation]').forEach((node) => node.remove());
  root.querySelectorAll?.('[data-yiliu-block]').forEach((element) => {
    element.removeAttribute('data-yiliu-block');
    element.removeAttribute('data-yiliu-state');
    element.classList.remove('yiliu-inner');
    delete element._yiliuTranslationNode;
    delete element._yiliuOriginalSpan;
  });
  const html = root.documentElement || document.documentElement;
  html?.classList.remove(
    'yiliu-mode-bilingual',
    'yiliu-mode-replace',
    'yiliu-page-translated',
    'yiliu-dark-page',
  );
}

function parseRgb(value) {
  const match = String(value || '').match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?/i);
  if (!match) return null;
  return {
    r: Number(match[1]),
    g: Number(match[2]),
    b: Number(match[3]),
    a: match[4] === undefined ? 1 : Number(match[4]),
  };
}

export function pageBackgroundIsDark(doc = globalThis.document) {
  if (!doc) return false;
  try {
    for (const element of [doc.body, doc.documentElement]) {
      if (!element) continue;
      const style = doc.defaultView?.getComputedStyle(element);
      if (!style) continue;
      const color = parseRgb(style.backgroundColor);
      if (color && color.a >= 0.1) {
        const luminance = (0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b) / 255;
        return luminance < 0.48;
      }
      // A transparent background often means the page paints its own canvas.
      // The text colour is a useful second signal.
      const textColor = parseRgb(style.color);
      if (textColor && textColor.a >= 0.1) {
        const luminance = (0.2126 * textColor.r + 0.7152 * textColor.g + 0.0722 * textColor.b) / 255;
        if (luminance > 0.68) return true;
        if (luminance < 0.38) return false;
      }
    }
  } catch {
    // Unknown styles: assume a light page. A dark translation on a light canvas
    // is safer than light text disappearing on white.
  }
  return false;
}

export function applyPageStyle(settings) {
  const root = document.documentElement;
  if (!root) return;
  root.style.setProperty('--yiliu-font-size', `${settings.ui.fontSize}px`);
  root.style.setProperty('--yiliu-translation-color', settings.ui.color);
  root.classList.toggle('yiliu-dark-page', pageBackgroundIsDark(document));
  root.setAttribute('data-yiliu-display', settings.ui.displayStyle);
  root.classList.remove('yiliu-mode-bilingual', 'yiliu-mode-replace');
  root.classList.add(`yiliu-mode-${settings.mode}`);
}

export function pageLooksLikeTarget(targetLang, doc = globalThis.document) {
  const declared = (
    doc?.documentElement?.getAttribute('lang') ||
    doc?.querySelector('meta[http-equiv="content-language" i]')?.getAttribute('content') ||
    ''
  )
    .trim()
    .toLowerCase();
  if (!declared) return false;
  const target = String(targetLang || '').toLowerCase();
  if (!target) return false;
  const declaredPrimary = declared.split('-')[0];
  const targetPrimary = target.split('-')[0];
  if (declaredPrimary !== targetPrimary) return false;
  // Chinese scripts differ; only skip when the declared script matches.
  if (declaredPrimary === 'zh') {
    const wantsTraditional = target.includes('tw') || target.includes('hant');
    const looksTraditional = declared.includes('tw') || declared.includes('hk') || declared.includes('hant');
    return wantsTraditional === looksTraditional;
  }
  return true;
}

export function selectionContext(selection) {
  if (!selection || selection.rangeCount === 0) return { before: '', after: '' };
  const range = selection.getRangeAt(0);
  const container = range.startContainer.nodeType === 3
    ? range.startContainer.parentElement
    : range.startContainer;
  if (!container) return { before: '', after: '' };
  try {
    const doc = container.ownerDocument;
    const full = doc.createRange();
    full.selectNodeContents(container);
    const beforeRange = full.cloneRange();
    beforeRange.setEnd(range.startContainer, range.startOffset);
    const afterRange = full.cloneRange();
    afterRange.setStart(range.endContainer, range.endOffset);
    return {
      before: beforeRange.toString().slice(-300),
      after: afterRange.toString().slice(0, 300),
    };
  } catch {
    return { before: '', after: '' };
  }
}

export function elementFromSelection(selection) {
  if (!selection || selection.rangeCount === 0) return null;
  const node = selection.getRangeAt(0).startContainer;
  return node.nodeType === 1 ? node : node.parentElement;
}

