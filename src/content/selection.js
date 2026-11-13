import { LIMITS, targetLanguageLabel } from '../shared/constants.js';
import { normalizeSpace, squish } from '../shared/utils.js';
import { elementFromSelection, selectionContext } from './dom.js';

function isEditable(element) {
  if (!element) return false;
  if (element.isContentEditable) return true;
  const tag = element.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
}

export class SelectionController {
  /**
   * @param {import('./overlay.js').OverlayUI} overlay
   * @param {{getSettings: () => any, requestSelection: (text: string, context: any) => Promise<any>, openOptions: () => void}} deps
   */
  constructor(overlay, deps) {
    this.overlay = overlay;
    this.deps = deps;
    this.current = null;
    this.loading = false;
    this.lastRect = null;
    this.autoTimer = 0;
    this.started = false;

    this.requestId = 0;
    this.onPointerUp = this.onPointerUp.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onSelectionChange = this.onSelectionChange.bind(this);
    this.onEscape = this.onEscape.bind(this);

    this.overlay.onTrigger = () => this.translateCurrent();
    this.overlay.onRetry = () => this.translateCurrent({ retry: true });
    this.overlay.onSettings = () => this.deps.openOptions();
    this.overlay.onClose = () => {
      this.requestId += 1;
      this.loading = false;
      this.current = null;
    };
  }

  start() {
    if (this.started) return;
    this.started = true;
    document.addEventListener('mouseup', this.onPointerUp, true);
    document.addEventListener('touchend', this.onPointerUp, true);
    document.addEventListener('keyup', this.onKeyUp, true);
    document.addEventListener('pointerdown', this.onPointerDown, true);
    document.addEventListener('selectionchange', this.onSelectionChange);
    document.addEventListener('keydown', this.onEscape, true);
  }

  stop() {
    this.started = false;
    document.removeEventListener('mouseup', this.onPointerUp, true);
    document.removeEventListener('touchend', this.onPointerUp, true);
    document.removeEventListener('keyup', this.onKeyUp, true);
    document.removeEventListener('pointerdown', this.onPointerDown, true);
    document.removeEventListener('selectionchange', this.onSelectionChange);
    document.removeEventListener('keydown', this.onEscape, true);
    clearTimeout(this.autoTimer);
    this.overlay.hideTrigger();
    this.overlay.hideBubble();
  }

  onEscape(event) {
    if (event.key !== 'Escape') return;
    this.overlay.hideTrigger();
    this.overlay.hideBubble();
  }

  onSelectionChange() {
    if (this.loading) return;
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.toString().trim()) {
      this.overlay.hideTrigger();
    }
  }

  onPointerDown(event) {
    if (event.composedPath?.().includes(this.overlay.host)) return;
    this.overlay.hideTrigger();
    // Clicking back into the page dismisses an old result.
    if (this.current && !this.loading) this.overlay.hideBubble();
  }

  onPointerUp(event) {
    if (event.button !== undefined && event.button !== 0) return;
    if (event.composedPath?.().includes(this.overlay.host)) return;
    if (this.isEventInsideOverlay(event)) return;
    // Let the browser finish updating the selection.
    setTimeout(() => this.captureSelection(event), 10);
  }

  onKeyUp(event) {
    if (event.key === 'Escape' || event.key === 'Shift' || event.key === 'Meta' || event.key === 'Control') {
      return;
    }
    if (event.target && isEditable(event.target)) return;
    setTimeout(() => this.captureSelection(event, true), 0);
  }

  isEventInsideOverlay(event) {
    return Boolean(event.target?.closest?.('#yiliu-overlay-host'));
  }

  captureSelection(event, fromKeyboard = false) {
    if (!this.deps.getSettings()?.selection?.enabled) return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;
    const text = normalizeSpace(selection.toString());
    if (!text) return;
    if (text.length > LIMITS.maxSelectionChars) {
      this.overlay.toast(`选中文字过长，最多支持 ${LIMITS.maxSelectionChars} 字符`, {
        type: 'error',
      });
      return;
    }
    const element = elementFromSelection(selection);
    if (isEditable(element)) return;
    if (element?.closest?.('#yiliu-overlay-host')) return;

    const range = selection.getRangeAt(0);
    let rect = range.getBoundingClientRect();
    if ((!rect || (!rect.width && !rect.height)) && event) {
      rect = {
        left: event.clientX || 0,
        right: event.clientX || 0,
        top: event.clientY || 0,
        bottom: event.clientY || 0,
        width: 0,
        height: 0,
      };
    }
    this.lastRect = rect;
    this.current = {
      text,
      rect,
      context: {
        ...selectionContext(selection),
        title: document.title,
      },
    };
    this.overlay.showTrigger(rect);

    clearTimeout(this.autoTimer);
    if (this.deps.getSettings()?.selection?.auto && !fromKeyboard) {
      this.autoTimer = setTimeout(() => {
        if (this.current?.text === text) this.translateCurrent();
      }, 380);
    }
  }

  async translateCurrent({ retry = false } = {}) {
    if (this.loading || !this.deps.getSettings()?.selection?.enabled) return;
    if (!this.current?.text) {
      this.captureSelection(null, true);
    }
    if (!this.current?.text) return;
    const requestId = ++this.requestId;
    const targetLang = this.deps.getSettings()?.targetLang || '';
    this.loading = true;
    this.overlay.hideTrigger();
    this.overlay.showBubble({ rect: this.current.rect, source: this.current.text });
    try {
      const response = await this.deps.requestSelection(this.current.text, this.current.context);
      if (requestId !== this.requestId) return;
      if (!response?.ok) {
        this.loading = false;
        this.overlay.setBubbleError(response?.error || { message: '翻译失败，请重试' });
        return;
      }
      this.loading = false;
      this.overlay.setBubbleText(
        response.translation,
        targetLang,
      );
      if (retry) this.overlay.toast('已重新翻译');
    } catch (error) {
      if (requestId !== this.requestId) return;
      this.loading = false;
      this.overlay.setBubbleError({
        message: error?.message || '翻译失败，请检查网络或 API 设置',
        code: 'NETWORK',
      });
    }
  }

  /**
   * Open the bubble for text supplied by a context menu or command, even when
   * the live selection has already collapsed.
   */
  translateSuppliedText(text) {
    const cleaned = normalizeSpace(text);
    if (!cleaned) return;
    const selection = window.getSelection();
    let rect = this.lastRect;
    if (selection && !selection.isCollapsed) {
      const rangeRect = selection.getRangeAt(0).getBoundingClientRect();
      if (rangeRect.width || rangeRect.height) rect = rangeRect;
    }
    if (!rect) {
      rect = {
        left: Math.max(16, (window.innerWidth || 1024) / 2 - 120),
        right: Math.max(16, (window.innerWidth || 1024) / 2 + 120),
        top: Math.max(60, (window.innerHeight || 768) / 3),
        bottom: Math.max(60, (window.innerHeight || 768) / 3),
      };
    }
    this.current = {
      text: cleaned,
      rect,
      context: {
        title: document.title,
        before: '',
        after: '',
      },
    };
    this.translateCurrent();
  }

  getSelectionPreview() {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return '';
    return squish(selection.toString(), 80);
  }

  updateSettings() {
    // Settings are read lazily through deps.getSettings; this method exists so
    // the controller can react to changes without being recreated.
    if (!this.deps.getSettings()?.selection?.enabled) {
      this.overlay.hideTrigger();
      this.overlay.hideBubble();
    }
  }

  targetLabel() {
    return targetLanguageLabel(this.deps.getSettings()?.targetLang);
  }
}
