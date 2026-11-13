import { LIMITS } from '../shared/constants.js';
import { uid } from '../shared/utils.js';

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
  'CODE',
  'KBD',
  'SAMP',
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
  '[contenteditable]:not([contenteditable="false" i])',
  '[aria-hidden="true"]',
  '[data-yiliu-block]',
  '[data-yiliu-translation]',
  '[data-ee-bilingual]',
  '[data-yiliu-skip]',
  '[role="button"]',
  '[role="tab"]',
  '[role="menuitem"]',
  '[role="tooltip"]',
  '[role="img"]',
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
    if (style.display === 'contents') return true;
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

function isTranslatableText(text) {
  return !/^(?:https?:\/\/|www\.)\S+$/i.test(text) && /\p{L}/u.test(text);
}

/**
 * Group adjacent text nodes for context while keeping each node's text in
 * its own slot. Inline elements and line breaks always stay in the page.
 */
export function collectBlocks(root, { limit = LIMITS.maxPageBlocks, maxChars = LIMITS.maxBlockChars, skipNode, includeBlock } = {}) {
  const view = root?.ownerDocument?.defaultView || globalThis.window;
  const blocks = [];
  let parts = [];
  let chars = 0;
  let separator = '';
  let element;
  let language;

  function flush() {
    if (parts.length && (!includeBlock || includeBlock(parts))) {
      const text = parts.length === 1 ? parts[0].source.trim() : parts.map((part, index) =>
        `${part.separator}<x${index}>${part.source.trim()}</x${index}>`).join('');
      blocks.push({ id: uid('b'), element, language, parts, text });
    }
    parts = [];
    chars = 0;
    separator = '';
  }

  function visit(node, container, lang) {
    if (blocks.length >= limit) return;
    if (isText(node)) {
      const source = node.data;
      const trimmed = source.trim();
      if (!trimmed) {
        if (parts.length) separator = ' ';
        return;
      }
      if (skipNode?.(node) || !isTranslatableText(trimmed) || trimmed.length > maxChars) {
        flush();
        return;
      }
      const size = trimmed.length + 16;
      if (parts.length && (language !== lang || chars + size > maxChars)) flush();
      if (blocks.length >= limit) return;
      if (!parts.length) {
        element = container;
        language = lang;
      }
      parts.push({ node, parent: node.parentNode, source, separator: separator || (/^\s/.test(source) && parts.length ? ' ' : '') });
      chars += size;
      separator = /\s$/.test(source) ? ' ' : '';
      return;
    }
    if (!isElement(node)) return;
    if (node.tagName === 'BR' || isSkippedElement(node) || !isVisible(node, view)) {
      flush();
      return;
    }
    const boundary = BLOCK_TAGS.has(node.tagName) || node.tagName.includes('-');
    if (boundary) flush();
    const nextContainer = boundary ? node : container;
    const nextLang = node.getAttribute('lang') || lang;
    for (const child of node.childNodes) visit(child, nextContainer, nextLang);
    if (boundary) flush();
  }

  if (root) visit(root, root, root.closest('[lang]')?.getAttribute('lang') || '');
  flush();
  return blocks;
}

/** Measure the text itself, including text inside a scrolling panel. */
export function visibleTextFilter(doc) {
  const view = doc.defaultView;
  const range = doc.createRange();
  if (!view?.innerHeight || typeof range.getClientRects !== 'function') return () => true;

  const bounds = new WeakMap();
  const viewport = { top: 0, left: 0, bottom: view.innerHeight, right: view.innerWidth };
  function visibleBounds(element) {
    if (!element || element === doc.body || element === doc.documentElement) return viewport;
    if (bounds.has(element)) return bounds.get(element);
    let area = visibleBounds(element.parentElement);
    const style = view.getComputedStyle(element);
    const clipX = /^(auto|scroll|hidden|clip|overlay)$/.test(style.overflowX);
    const clipY = /^(auto|scroll|hidden|clip|overlay)$/.test(style.overflowY);
    if ((clipX || clipY) && style.display !== 'inline' && style.display !== 'contents') {
      const rect = element.getBoundingClientRect();
      area = {
        top: clipY ? Math.max(area.top, rect.top) : area.top,
        bottom: clipY ? Math.min(area.bottom, rect.bottom) : area.bottom,
        left: clipX ? Math.max(area.left, rect.left) : area.left,
        right: clipX ? Math.min(area.right, rect.right) : area.right,
      };
    }
    bounds.set(element, area);
    return area;
  }

  return (parts) => parts.some(({ node }) => {
    const area = visibleBounds(node.parentElement);
    range.selectNodeContents(node);
    return Array.from(range.getClientRects()).some((rect) =>
      rect.height > 0 && rect.width > 0 && area.top < area.bottom && area.left < area.right
      && rect.top < area.bottom && rect.bottom > area.top
      && rect.left < area.right && rect.right > area.left);
  });
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
    if (declared === 'zh') return false;
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

