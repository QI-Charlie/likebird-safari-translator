import overlayCss from './overlay.css';
import brandMark from '../../assets/icons/brand-small.png';
import closeIcon from '../../assets/remix-icon/close-line.svg';
import copyIcon from '../../assets/remix-icon/file-copy-line.svg';
import speakIcon from '../../assets/remix-icon/volume-up-line.svg';
import retryIcon from '../../assets/remix-icon/refresh-line.svg';
import selectionIcon from '../../assets/remix-icon/text-snippet.svg';
import settingsIcon from '../../assets/remix-icon/settings-3-line.svg';

const MARK = `<img class="yl-mark" src="${brandMark}" alt="" />`;

function decorativeIcon(svg) {
  return svg.replace('<svg ', '<svg aria-hidden="true" focusable="false" ');
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
    document.body.appendChild(area);
    area.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    area.remove();
    return ok;
  }
}

export class OverlayUI {
  constructor() {
    this.host = document.createElement('div');
    this.host.id = 'yiliu-overlay-host';
    this.host.setAttribute('data-yiliu-extension', '');
    this.host.style.cssText =
      'all:initial;position:fixed;inset:0;z-index:2147483647;pointer-events:none;';
    this.shadow = this.host.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = overlayCss;
    this.shadow.appendChild(style);

    this.layer = document.createElement('div');
    this.layer.className = 'yl-layer';
    this.layer.innerHTML = `
      <button class="yl-trigger" type="button" aria-label="翻译选中文字" hidden>${MARK}</button>

      <section class="yl-bubble" role="dialog" aria-label="划词翻译" aria-hidden="true">
        <header class="yl-bubble-head">
          <div class="yl-bubble-title">${decorativeIcon(selectionIcon)}<strong>划词翻译</strong></div>
          <button class="yl-icon-btn" data-act="close" title="关闭" aria-label="关闭">
            ${decorativeIcon(closeIcon)}
          </button>
        </header>
        <div class="yl-bubble-body">
          <div class="yl-source" data-role="source"></div>
          <div class="yl-divider"></div>
          <div class="yl-result" data-role="result" aria-live="polite"></div>
        </div>
        <footer class="yl-bubble-foot">
          <button class="yl-action" data-act="copy" type="button">
            ${decorativeIcon(copyIcon)}<span>复制</span>
          </button>
          <button class="yl-action" data-act="speak" type="button">
            ${decorativeIcon(speakIcon)}<span>朗读</span>
          </button>
          <button class="yl-action" data-act="retry" type="button" hidden>
            ${decorativeIcon(retryIcon)}<span>重试</span>
          </button>
        </footer>
      </section>

      <div class="yl-toast" role="status" aria-live="polite"></div>
    `;
    this.shadow.appendChild(this.layer);

    this.trigger = this.shadow.querySelector('.yl-trigger');
    this.bubble = this.shadow.querySelector('.yl-bubble');
    this.source = this.shadow.querySelector('[data-role="source"]');
    this.result = this.shadow.querySelector('[data-role="result"]');
    this.copyButton = this.shadow.querySelector('[data-act="copy"]');
    this.speakButton = this.shadow.querySelector('[data-act="speak"]');
    this.bubbleFooter = this.shadow.querySelector('.yl-bubble-foot');
    this.retryButton = this.shadow.querySelector('[data-act="retry"]');
    this.toastNode = this.shadow.querySelector('.yl-toast');

    this.currentText = '';
    this.currentTranslation = '';
    this.currentLang = '';
    this.anchorRect = null;
    this.toastTimer = 0;
    this.onTrigger = null;
    this.onRetry = null;
    this.onSettings = null;
    this.onClose = null;

    this.bind();
  }

  bind() {
    this.trigger.addEventListener('pointerdown', (event) => {
      // Keep the page selection alive while the button is pressed.
      event.preventDefault();
      event.stopPropagation();
    });
    this.trigger.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.onTrigger?.();
    });

    this.shadow.querySelector('[data-act="close"]').addEventListener('click', () => this.hideBubble());
    this.copyButton.addEventListener('click', () => this.copyTranslation());
    this.speakButton.addEventListener('click', () => this.speakTranslation());
    this.retryButton.addEventListener('click', () => this.onRetry?.());

    this.bubble.addEventListener('pointerdown', (event) => event.stopPropagation());
    this.bubble.addEventListener('click', (event) => event.stopPropagation());

    this.shadow.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') this.hideBubble();
    });
  }

  showTrigger(rect) {
    if (!rect) return;
    if (!this.host.isConnected) document.documentElement.appendChild(this.host);
    const width = 34;
    const gap = 9;
    let top = rect.top - width - gap;
    let below = false;
    if (top < 8) {
      top = rect.bottom + gap;
      below = true;
    }
    const left = clamp(rect.right - width / 2, 10, (window.innerWidth || 1024) - width - 10);
    this.trigger.style.left = `${left}px`;
    this.trigger.style.top = `${top}px`;
    this.trigger.classList.toggle('is-below', below);
    this.trigger.hidden = false;
    this.trigger.tabIndex = 0;
    this.trigger.setAttribute('aria-hidden', 'false');
    this.trigger.classList.add('is-visible');
  }

  hideTrigger() {
    this.trigger.classList.remove('is-visible');
    this.trigger.tabIndex = -1;
    this.trigger.setAttribute('aria-hidden', 'true');
    clearTimeout(this.triggerHideTimer);
    this.triggerHideTimer = setTimeout(() => {
      if (!this.trigger.classList.contains('is-visible')) this.trigger.hidden = true;
    }, 150);
  }

  showBubble({ rect, source = '', loading = true } = {}) {
    if (!this.host.isConnected) document.documentElement.appendChild(this.host);
    this.anchorRect = rect || {
      left: (window.innerWidth || 1024) - 430,
      right: (window.innerWidth || 1024) - 30,
      top: 70,
      bottom: 70,
    };
    this.currentText = source;
    this.currentTranslation = '';
    this.source.textContent = source;
    this.copyButton.querySelector('span').textContent = '复制';
    this.copyButton.classList.remove('is-done');
    this.retryButton.hidden = true;
    // Position while the bubble is still hidden, then reveal it. This avoids a
    // one-frame jump and does not depend on requestAnimationFrame, which Safari
    // throttles in background tabs.
    this.bubble.classList.remove('is-visible');
    this.bubble.setAttribute('aria-hidden', 'false');
    if (loading) this.setBubbleLoading();
    else this.positionBubble(this.anchorRect);
    this.bubble.classList.add('is-visible');
  }

  positionBubble(rect) {
    const margin = 12;
    const width = Math.min(396, (window.innerWidth || 1024) - margin * 2);
    const height = this.bubble.getBoundingClientRect().height || 260;
    const viewportWidth = window.innerWidth || 1024;
    const viewportHeight = window.innerHeight || 768;
    const left = clamp(rect.left, margin, viewportWidth - width - margin);
    let top = rect.bottom + 10;
    if (top + height > viewportHeight - margin) {
      top = Math.max(margin, rect.top - height - 10);
    }
    if (top + height > viewportHeight - margin) {
      top = Math.max(margin, viewportHeight - height - margin);
    }
    this.bubble.style.left = `${left}px`;
    this.bubble.style.top = `${top}px`;
    this.bubble.style.width = `${width}px`;
  }

  setBubbleLoading(message = '正在翻译…') {
    this.result.innerHTML = `<div class="yl-loading"><span class="yl-spin"></span><span>${message}</span></div>`;
    this.retryButton.hidden = true;
    this.copyButton.hidden = true;
    this.speakButton.hidden = true;
    this.bubbleFooter.hidden = true;
    this.positionBubble(this.anchorRect);
  }

  setBubbleText(text, lang = '') {
    this.currentTranslation = text;
    this.currentLang = lang;
    this.result.textContent = text;
    this.bubbleFooter.hidden = !text;
    this.copyButton.hidden = !text;
    this.speakButton.hidden = !('speechSynthesis' in window) || !text;
    this.retryButton.hidden = true;
    this.positionBubble(this.anchorRect);
  }

  setBubbleError(payload = {}) {
    this.currentTranslation = '';
    const message = payload.message || '翻译失败，请稍后重试';
    const needsSettings = ['NO_API_KEY', 'AUTH', 'CONFIG', 'NOT_FOUND', 'INSUFFICIENT_BALANCE'].includes(payload.code);
    this.result.innerHTML = '';
    const box = document.createElement('div');
    box.className = 'yl-error';
    const paragraph = document.createElement('p');
    paragraph.textContent = message;
    box.appendChild(paragraph);
    if (needsSettings) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'yl-error-action';
      button.innerHTML = `${decorativeIcon(settingsIcon)}<span>打开飞译设置</span>`;
      button.addEventListener('click', () => this.onSettings?.());
      box.appendChild(button);
    }
    this.result.appendChild(box);
    this.copyButton.hidden = true;
    this.speakButton.hidden = true;
    this.retryButton.hidden = needsSettings && !payload.retryable;
    this.bubbleFooter.hidden = this.retryButton.hidden;
    this.positionBubble(this.anchorRect);
  }

  hideBubble() {
    this.bubble.classList.remove('is-visible');
    this.bubble.setAttribute('aria-hidden', 'true');
    this.onClose?.();
  }

  async copyTranslation() {
    if (!this.currentTranslation) return;
    const ok = await copyText(this.currentTranslation);
    const span = this.copyButton.querySelector('span');
    span.textContent = ok ? '已复制' : '复制失败';
    this.copyButton.classList.toggle('is-done', ok);
    setTimeout(() => {
      span.textContent = '复制';
      this.copyButton.classList.remove('is-done');
    }, 1500);
  }

  speakTranslation() {
    if (!this.currentTranslation || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(this.currentTranslation);
    if (this.currentLang) utterance.lang = this.currentLang;
    utterance.rate = 0.98;
    const voices = window.speechSynthesis.getVoices();
    const match = this.currentLang
      ? voices.find((voice) => voice.lang?.toLowerCase().startsWith(this.currentLang.toLowerCase()))
      : null;
    if (match) utterance.voice = match;
    window.speechSynthesis.speak(utterance);
  }

  toast(message, { type = 'info', duration = 3600, action = null } = {}) {
    if (!this.host.isConnected) document.documentElement.appendChild(this.host);
    clearTimeout(this.toastTimer);
    this.toastNode.className = `yl-toast${type === 'error' ? ' is-error' : ''}`;
    this.toastNode.innerHTML = '';
    const text = document.createElement('span');
    text.textContent = message;
    this.toastNode.appendChild(text);
    if (action?.label) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'yl-toast-action';
      button.textContent = action.label;
      button.addEventListener('click', () => {
        action.onClick?.();
        this.hideToast();
      });
      this.toastNode.appendChild(button);
      this.toastNode.style.pointerEvents = 'auto';
    } else {
      this.toastNode.style.pointerEvents = 'none';
    }
    this.toastNode.classList.add('is-visible');
    this.toastTimer = setTimeout(() => this.hideToast(), duration);
  }

  hideToast() {
    this.toastNode.classList.remove('is-visible');
    clearTimeout(this.toastTimer);
  }

  destroy() {
    this.host.remove();
  }
}
