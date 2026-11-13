import overlayCss from './overlay.css';

const ICON = {
  close:
    '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15"/></svg>',
  copy:
    '<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="7" y="7" width="9" height="9" rx="2"/><path d="M5 12H4.5A1.5 1.5 0 013 10.5v-6A1.5 1.5 0 014.5 3h6A1.5 1.5 0 0112 4.5V5"/></svg>',
  speak:
    '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 8v4h3l4 3V5L7 8H4z"/><path d="M14 7.5a4 4 0 010 5M16.5 5a7 7 0 010 10"/></svg>',
  retry:
    '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M16 10a6 6 0 11-1.8-4.3"/><path d="M16 4v4h-4"/></svg>',
  closeSmall:
    '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M6 6l8 8M14 6l-8 8"/></svg>',
};

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
    (document.documentElement || document.body).appendChild(this.host);
    this.shadow = this.host.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = overlayCss;
    this.shadow.appendChild(style);

    this.layer = document.createElement('div');
    this.layer.className = 'yl-layer';
    this.layer.innerHTML = `
      <div class="yl-trigger" role="button" tabindex="0" aria-label="翻译选中文字" hidden>
        <span>译</span>
      </div>

      <section class="yl-bubble" role="dialog" aria-label="译流划词翻译" aria-hidden="true">
        <header class="yl-bubble-head">
          <span class="yl-brand-mark" aria-hidden="true">译</span>
          <div class="yl-bubble-title">
            <strong>译流</strong>
            <span>划词翻译</span>
          </div>
          <button class="yl-icon-btn" data-act="close" title="关闭" aria-label="关闭">
            ${ICON.close}
          </button>
        </header>
        <div class="yl-bubble-body">
          <div class="yl-source" data-role="source"></div>
          <div class="yl-divider"></div>
          <div class="yl-result" data-role="result" aria-live="polite"></div>
        </div>
        <footer class="yl-bubble-foot">
          <button class="yl-action" data-act="copy" type="button">
            ${ICON.copy}<span>复制</span>
          </button>
          <button class="yl-action" data-act="speak" type="button">
            ${ICON.speak}<span>朗读</span>
          </button>
          <button class="yl-action" data-act="retry" type="button" hidden>
            ${ICON.retry}<span>重试</span>
          </button>
          <span class="yl-foot-spacer"></span>
          <span class="yl-watermark">译流 · YiLiu</span>
        </footer>
      </section>

      <div class="yl-progress" aria-live="polite" aria-hidden="true">
        <div class="yl-progress-row">
          <span class="yl-progress-mark">译</span>
          <span class="yl-progress-label">正在翻译此页…</span>
          <span class="yl-progress-count">0 / 0</span>
          <button class="yl-cancel" data-act="cancel" title="停止翻译" aria-label="停止翻译">
            ${ICON.closeSmall}
          </button>
        </div>
        <div class="yl-progress-track"><div class="yl-progress-fill"></div></div>
      </div>

      <div class="yl-toast" role="status" aria-live="polite"></div>
    `;
    this.shadow.appendChild(this.layer);

    this.trigger = this.shadow.querySelector('.yl-trigger');
    this.bubble = this.shadow.querySelector('.yl-bubble');
    this.source = this.shadow.querySelector('[data-role="source"]');
    this.result = this.shadow.querySelector('[data-role="result"]');
    this.copyButton = this.shadow.querySelector('[data-act="copy"]');
    this.speakButton = this.shadow.querySelector('[data-act="speak"]');
    this.retryButton = this.shadow.querySelector('[data-act="retry"]');
    this.progress = this.shadow.querySelector('.yl-progress');
    this.toast = this.shadow.querySelector('.yl-toast');

    this.currentText = '';
    this.currentTranslation = '';
    this.currentLang = '';
    this.anchorRect = null;
    this.toastTimer = 0;
    this.progressHideTimer = 0;
    this.onTrigger = null;
    this.onRetry = null;
    this.onSettings = null;
    this.onCancel = null;
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
    this.trigger.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this.onTrigger?.();
      }
    });

    this.shadow.querySelector('[data-act="close"]').addEventListener('click', () => this.hideBubble());
    this.shadow.querySelector('[data-act="cancel"]').addEventListener('click', () => this.onCancel?.());
    this.copyButton.addEventListener('click', () => this.copyTranslation());
    this.speakButton.addEventListener('click', () => this.speakTranslation());
    this.retryButton.addEventListener('click', () => this.onRetry?.());

    this.bubble.addEventListener('pointerdown', (event) => event.stopPropagation());
    this.bubble.addEventListener('click', (event) => event.stopPropagation());
    this.progress.addEventListener('pointerdown', (event) => event.stopPropagation());
    this.progress.addEventListener('click', (event) => event.stopPropagation());

    this.shadow.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') this.hideBubble();
    });
  }

  showTrigger(rect) {
    if (!rect) return;
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
    this.trigger.setAttribute('aria-hidden', 'false');
    this.trigger.classList.add('is-visible');
  }

  hideTrigger() {
    this.trigger.classList.remove('is-visible');
    this.trigger.setAttribute('aria-hidden', 'true');
    clearTimeout(this.triggerHideTimer);
    this.triggerHideTimer = setTimeout(() => {
      if (!this.trigger.classList.contains('is-visible')) this.trigger.hidden = true;
    }, 150);
  }

  showBubble({ rect, source = '', loading = true } = {}) {
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
    this.positionBubble(this.anchorRect);
    this.bubble.classList.add('is-visible');
    if (loading) this.setBubbleLoading();
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
    this.positionBubble(this.anchorRect);
  }

  setBubbleText(text, lang = '') {
    this.currentTranslation = text;
    this.currentLang = lang;
    this.result.textContent = text;
    this.speakButton.hidden = !('speechSynthesis' in window) || !text;
    this.retryButton.hidden = true;
    this.positionBubble(this.anchorRect);
  }

  setBubbleError(payload = {}) {
    this.currentTranslation = '';
    const message = payload.message || '翻译失败，请稍后重试';
    const needsSettings = payload.code === 'NO_API_KEY' || payload.code === 'AUTH' || payload.code === 'CONFIG';
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
      button.textContent = '打开译流设置';
      button.addEventListener('click', () => this.onSettings?.());
      box.appendChild(button);
    }
    this.result.appendChild(box);
    this.retryButton.hidden = false;
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

  showProgress({ total = 0, label = '正在翻译此页…' } = {}) {
    clearTimeout(this.progressHideTimer);
    this.progressTotal = total;
    this.progressDone = 0;
    this.progressLabel = label;
    this.shadow.querySelector('.yl-progress-label').textContent = label;
    this.shadow.querySelector('.yl-progress-count').textContent = `0 / ${total}`;
    this.shadow.querySelector('.yl-progress-fill').style.width = '0%';
    this.progress.classList.add('is-visible');
    this.progress.setAttribute('aria-hidden', 'false');
  }

  updateProgress({ done, total, label, errors = 0 } = {}) {
    if (Number.isFinite(total)) this.progressTotal = total;
    if (Number.isFinite(done)) this.progressDone = done;
    const totalValue = this.progressTotal || 0;
    const doneValue = this.progressDone || 0;
    const percent = totalValue ? Math.min(100, Math.round((doneValue / totalValue) * 100)) : 0;
    if (label) {
      this.progressLabel = label;
      this.shadow.querySelector('.yl-progress-label').textContent = label;
    }
    this.shadow.querySelector('.yl-progress-count').textContent =
      `${doneValue} / ${totalValue}${errors ? ` · ${errors} 失败` : ''}`;
    this.shadow.querySelector('.yl-progress-fill').style.width = `${percent}%`;
  }

  hideProgress(delay = 0) {
    clearTimeout(this.progressHideTimer);
    const hide = () => {
      this.progress.classList.remove('is-visible');
      this.progress.setAttribute('aria-hidden', 'true');
    };
    if (delay) this.progressHideTimer = setTimeout(hide, delay);
    else hide();
  }

  setProgressVisible(visible) {
    if (visible) this.progress.classList.add('is-visible');
    else this.hideProgress();
  }

  toast(message, { type = 'info', duration = 3600, action = null } = {}) {
    clearTimeout(this.toastTimer);
    this.toast.className = `yl-toast${type === 'error' ? ' is-error' : ''}`;
    this.toast.innerHTML = '';
    const text = document.createElement('span');
    text.textContent = message;
    this.toast.appendChild(text);
    if (action?.label) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'yl-toast-action';
      button.textContent = action.label;
      button.addEventListener('click', () => {
        action.onClick?.();
        this.hideToast();
      });
      this.toast.appendChild(button);
      this.toast.style.pointerEvents = 'auto';
    } else {
      this.toast.style.pointerEvents = 'none';
    }
    this.toast.classList.add('is-visible');
    this.toastTimer = setTimeout(() => this.hideToast(), duration);
  }

  hideToast() {
    this.toast.classList.remove('is-visible');
    clearTimeout(this.toastTimer);
  }

  destroy() {
    this.host.remove();
  }
}
