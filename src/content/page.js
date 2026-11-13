import { LIMITS, targetLanguageLabel } from '../shared/constants.js';
import { hostMatchesAny, debounce } from '../shared/utils.js';
import {
  applyPageStyle,
  collectBlocks,
  insertTranslation,
  markBlockState,
  pageLooksLikeTarget,
  renderTranslation,
  restoreTranslations,
} from './dom.js';
import { makeBatches, prioritizeBlocks } from './batch.js';

export class PageTranslator {
  /**
   * @param {import('./overlay.js').OverlayUI} overlay
   * @param {{
   *   getSettings: () => any,
   *   requestBatch: (items: Array<{id: string, text: string}>, context: any) => Promise<any>,
   *   report: (state: string) => void,
   *   openOptions: () => void,
   * }} deps
   */
  constructor(overlay, deps) {
    this.overlay = overlay;
    this.deps = deps;
    this.settings = deps.getSettings();
    this.active = false;
    this.cancelled = false;
    this.fatal = false;
    this.done = 0;
    this.total = 0;
    this.errorCount = 0;
    this.failedBlocks = new Map();
    this.observer = null;
    this.refreshTimer = 0;
    this.refreshRounds = 0;
    this.refreshing = false;
    this.everTranslated = false;
    this.lastUrl = location.href;

    this.scheduleRefresh = debounce(() => this.refreshNewContent(), 850);
  }

  isExcluded() {
    return hostMatchesAny(location.hostname, this.settings?.excludeSites || []);
  }

  hasTranslations() {
    return Boolean(document.querySelector('[data-yiliu-translation]'));
  }

  status() {
    return {
      active: this.active,
      translated: this.done,
      total: this.total,
      errors: this.errorCount,
      hasTranslation: this.hasTranslations(),
      mode: this.settings?.mode || 'bilingual',
      targetLang: this.settings?.targetLang || 'zh-CN',
      excluded: this.isExcluded(),
    };
  }

  async start({ force = false, auto = false } = {}) {
    if (this.active) {
      this.overlay.toast('正在翻译此页，请稍候…');
      return;
    }
    this.settings = this.deps.getSettings();
    if (this.isExcluded()) {
      this.overlay.toast('当前站点在译流的排除列表中，可在设置中移除', {
        type: 'error',
        duration: 6000,
        action: { label: '打开设置', onClick: () => this.deps.openOptions() },
      });
      return;
    }
    if (
      auto &&
      this.settings.skipTargetLanguagePages &&
      pageLooksLikeTarget(this.settings.targetLang)
    ) {
      return;
    }

    // A second run (e.g. after changing the target language) should rebuild
    // from the original DOM rather than skipping already-marked blocks.
    if (this.hasTranslations()) restoreTranslations(document);
    applyPageStyle(this.settings);
    const allBlocks = collectBlocks(document.body, {
      limit: LIMITS.maxPageBlocks,
      maxChars: LIMITS.maxBlockChars,
    });
    if (!allBlocks.length) {
      this.overlay.toast('未找到可翻译的正文内容');
      return;
    }

    const blocks = prioritizeBlocks(allBlocks);
    this.active = true;
    this.cancelled = false;
    this.fatal = false;
    this.done = 0;
    this.errorCount = 0;
    this.total = blocks.length;
    this.failedBlocks.clear();
    this.everTranslated = false;
    this.lastUrl = location.href;
    this.deps.report('translating');
    this.overlay.showProgress({ total: this.total, label: '正在翻译此页…' });

    try {
      await this.translateBlocks(blocks, { refresh: false });
    } finally {
      this.active = false;
      this.overlay.hideProgress(900);
      if (!this.cancelled) {
        this.overlay.hideProgress(900);
        if (this.done > 0) {
          document.documentElement.classList.add('yiliu-page-translated');
          this.deps.report('done');
          const suffix = this.errorCount ? `，${this.errorCount} 段未完成` : '';
          this.overlay.toast(`已翻译 ${this.done} 段${suffix}`, {
            duration: 2600,
            action: this.errorCount
              ? { label: '重试失败段落', onClick: () => this.retryFailed() }
              : null,
          });
          this.startObserver();
        } else if (!this.fatal) {
          this.deps.report('error');
          this.overlay.toast('没有成功翻译的内容，请检查 API 设置', {
            type: 'error',
            action: { label: '打开设置', onClick: () => this.deps.openOptions() },
          });
        }
      }
    }
  }

  async translateBlocks(blocks, { refresh = false } = {}) {
    if (!blocks.length) return;
    const { maxItems, concurrency } = this.settings.batch;
    const batches = makeBatches(blocks, {
      maxItems,
      maxChars: LIMITS.maxBatchChars,
    });
    let cursor = 0;

    const workers = Array.from(
      { length: Math.max(1, Math.min(concurrency, batches.length)) },
      async () => {
        while (!this.cancelled && cursor < batches.length) {
          const index = cursor;
          cursor += 1;
          await this.runBatch(batches[index], { refresh });
        }
      },
    );
    await Promise.all(workers);
  }

  async runBatch(blocks, { refresh = false } = {}) {
    if (this.cancelled) return;
    for (const block of blocks) markBlockState(block.element, 'loading');
    const items = blocks.map((block) => ({ id: block.id, text: block.text }));
    let response;
    try {
      response = await this.deps.requestBatch(items, {
        url: location.href,
        title: document.title,
      });
    } catch (error) {
      this.handleFatal({
        message: error?.message || '无法连接译流后台，请刷新页面后重试',
        code: 'BACKGROUND',
      });
      return;
    }

    if (this.cancelled) return;
    if (!response?.ok) {
      this.handleFatal(response?.error || { message: '翻译失败，请稍后重试' });
      return;
    }

    let batchErrors = 0;
    for (const block of blocks) {
      if (this.cancelled) return;
      const translated = response.translations?.[block.id];
      if (translated) {
        try {
          const html = renderTranslation(translated, block.tokens);
          if (html) {
            insertTranslation(block.element, html, {
              lang: this.settings.targetLang,
              id: block.id,
            });
            this.done += 1;
            this.everTranslated = true;
            this.failedBlocks.delete(block.id);
            this.overlay.updateProgress({
              done: this.done,
              total: this.total,
              errors: this.errorCount,
            });
          } else {
            batchErrors += 1;
            this.markFailed(block);
          }
        } catch {
          batchErrors += 1;
          this.markFailed(block);
        }
      } else {
        batchErrors += 1;
        this.markFailed(block);
      }
    }

    const responseErrors = Array.isArray(response.errors) ? response.errors.length : 0;
    this.errorCount += Math.max(batchErrors, responseErrors);
    this.overlay.updateProgress({
      done: this.done,
      total: this.total,
      errors: this.errorCount,
    });
    if (this.errorCount > 0) this.deps.report('error');
  }

  markFailed(block) {
    markBlockState(block.element, 'error');
    this.failedBlocks.set(block.id, block);
  }

  handleFatal(error) {
    if (this.fatal && this.cancelled) return;
    this.fatal = true;
    this.cancelled = true;
    this.active = false;
    this.deps.report('error');
    this.overlay.hideProgress(0);
    const needsSettings =
      error?.code === 'NO_API_KEY' || error?.code === 'AUTH' || error?.code === 'CONFIG';
    this.overlay.toast(error?.message || '翻译失败，请稍后重试', {
      type: 'error',
      duration: 6500,
      action: needsSettings
        ? { label: '打开设置', onClick: () => this.deps.openOptions() }
        : null,
    });
  }

  cancel() {
    if (!this.active) return;
    this.cancelled = true;
    this.active = false;
    this.overlay.hideProgress(0);
    this.overlay.toast('已停止翻译，已完成的段落会保留');
    this.deps.report(this.hasTranslations() ? 'done' : 'restored');
  }

  async retryFailed() {
    if (this.active) return;
    const blocks = [...this.failedBlocks.values()].filter((block) => block.element?.isConnected);
    if (!blocks.length) {
      this.overlay.toast('没有需要重试的段落');
      return;
    }
    this.active = true;
    this.cancelled = false;
    this.fatal = false;
    this.total = this.done + blocks.length;
    this.overlay.showProgress({ total: this.total, label: '正在重试未完成的段落…' });
    this.overlay.updateProgress({ done: this.done, total: this.total });
    try {
      await this.translateBlocks(blocks, { refresh: true });
    } finally {
      this.active = false;
      this.overlay.hideProgress(700);
      if (!this.cancelled) {
        this.deps.report(this.done ? 'done' : 'error');
        this.overlay.toast(
          this.failedBlocks.size
            ? `仍有 ${this.failedBlocks.size} 段未完成`
            : '未完成的段落已全部补译',
          { type: this.failedBlocks.size ? 'error' : 'info' },
        );
      }
    }
  }

  restore() {
    this.cancelled = true;
    this.active = false;
    this.stopObserver();
    restoreTranslations(document);
    this.overlay.hideProgress(0);
    this.overlay.hideBubble();
    this.overlay.toast('已恢复原文');
    this.done = 0;
    this.total = 0;
    this.errorCount = 0;
    this.failedBlocks.clear();
    this.deps.report('restored');
  }

  toggle() {
    if (this.active) {
      this.cancel();
      return;
    }
    if (this.hasTranslations()) this.restore();
    else this.start({ force: true });
  }

  applySettings(nextSettings) {
    const previousTarget = this.settings?.targetLang;
    const hadTranslation = this.hasTranslations();
    this.settings = nextSettings;
    applyPageStyle(nextSettings);
    if (hadTranslation && previousTarget && previousTarget !== nextSettings.targetLang) {
      this.overlay.toast(
        `目标语言已切换为${targetLanguageLabel(nextSettings.targetLang)}，重新翻译后生效`,
        { duration: 4200 },
      );
    }
  }

  startObserver() {
    if (this.observer || !document.body) return;
    this.observer = new MutationObserver((mutations) => {
      let relevant = false;
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === 3 && node.nodeValue?.trim()) {
            relevant = true;
            break;
          }
          if (node.nodeType === 1) {
            if (node.matches?.('.yiliu-translation, #yiliu-overlay-host')) continue;
            if (node.closest?.('.yiliu-translation, #yiliu-overlay-host')) continue;
            if (node.textContent?.trim()) {
              relevant = true;
              break;
            }
          }
        }
        if (relevant) break;
      }
      if (relevant) this.scheduleRefresh();
    });
    this.observer.observe(document.body, { childList: true, subtree: true });
  }

  stopObserver() {
    this.observer?.disconnect();
    this.observer = null;
    this.scheduleRefresh.cancel();
  }

  async refreshNewContent() {
    if (this.refreshing || this.active || this.cancelled || !this.observer) return;
    if (this.refreshRounds >= 50 || this.total >= LIMITS.maxPageBlocks) {
      this.stopObserver();
      return;
    }
    if (location.href !== this.lastUrl) {
      // A SPA route change keeps the content script alive. Reset DOM state on
      // the next manual action instead of translating the previous page's nodes.
      this.stopObserver();
      return;
    }
    this.refreshRounds += 1;
    const remaining = Math.max(20, LIMITS.maxPageBlocks - this.total);
    const blocks = collectBlocks(document.body, {
      limit: remaining,
      maxChars: LIMITS.maxBlockChars,
    });
    if (!blocks.length) return;
    this.refreshing = true;
    this.active = true;
    this.cancelled = false;
    this.total += blocks.length;
    this.overlay.showProgress({
      total: this.total,
      label: '正在翻译新增内容…',
    });
    this.overlay.updateProgress({ done: this.done, total: this.total, errors: this.errorCount });
    try {
      await this.translateBlocks(prioritizeBlocks(blocks), { refresh: true });
    } finally {
      this.refreshing = false;
      this.active = false;
      this.overlay.hideProgress(600);
      this.overlay.updateProgress({ done: this.done, total: this.total, errors: this.errorCount });
      if (this.done) this.deps.report(this.errorCount ? 'error' : 'done');
    }
  }
}
