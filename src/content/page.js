import { LIMITS } from '../shared/constants.js';
import { splitTextSlots } from '../shared/text-slots.js';
import { autoTranslatesHost, hostMatchesAny } from '../shared/utils.js';
import { collectBlocks, pageLooksLikeTarget, visibleTextFilter } from './dom.js';
import { makeBatches } from './batch.js';

export class PageTranslator {
  constructor(deps) {
    this.deps = deps;
    this.settings = deps.getSettings();
    this.active = false;
    this.runId = 0;
    this.following = false;
    this.stopped = false;
    this.error = '';
    this.done = 0;
    this.total = 0;
    this.errorCount = 0;
    this.failedBlocks = new Map();
    this.replacements = new Map();
    this.bilingualBlocks = new Set();
    this.observer = null;
    this.route = this.currentRoute();
    this.suspended = false;
    this.refreshTimer = 0;
    this.scheduleRefresh = () => {
      if (this.refreshTimer || this.suspended) return;
      this.refreshTimer = setTimeout(() => {
        this.refreshTimer = 0;
        this.refresh().catch((error) => this.handleFatal(error));
      }, 160);
    };
    this.onViewportChange = () => {
      if (this.following || this.shouldAutoTranslate()) this.scheduleRefresh();
    };
  }

  currentRoute() {
    const { pathname, search, hash } = location;
    return pathname + search + (hash.startsWith('#/') || hash.startsWith('#!') ? hash : '');
  }

  shouldAutoTranslate() {
    return (this.settings.configured || this.settings.targetLang === 'zh-TW')
      && !this.isExcluded() && autoTranslatesHost(location.hostname, this.settings);
  }

  checkNavigation() {
    const route = this.currentRoute();
    if (route === this.route) return false;
    this.route = route;
    const auto = this.shouldAutoTranslate();
    this.reset({ restore: !auto });
    if (auto) {
      for (const node of this.replacements.keys()) this.isReplaced(node);
      this.startAuto();
    } else {
      this.deps.report('restored');
    }
    return true;
  }

  startAuto() {
    if (this.following || this.stopped || !this.shouldAutoTranslate()) return;
    if (this.settings.skipTargetLanguagePages && pageLooksLikeTarget(this.settings.targetLang)) return;
    this.following = true;
    this.scheduleRefresh();
  }

  isExcluded() {
    return hostMatchesAny(location.hostname, this.settings?.excludeSites || []);
  }

  isReplaced(node) {
    const replacement = this.replacements.get(node);
    if (!replacement) return false;
    const displayed = this.settings.displayMode === 'bilingual' ? replacement.source : replacement.text;
    if (node.isConnected && node.data === displayed) return true;
    this.replacements.delete(node);
    return false;
  }

  hasTranslations() {
    for (const [node, { source, text }] of this.replacements) {
      if (this.isReplaced(node) && source !== text) return true;
    }
    return false;
  }

  restoreText() {
    for (const block of this.bilingualBlocks) block.translation?.remove();
    this.bilingualBlocks.clear();
    for (const [node, replacement] of this.replacements) {
      if (replacement.source !== replacement.text && node.data === replacement.text) {
        node.data = replacement.source;
      }
    }
    this.replacements.clear();
  }

  renderBilingual(block) {
    if (!block.parts.every(({ node, parent }) => node.parentNode === parent && this.isReplaced(node))) {
      block.translation?.remove();
      this.bilingualBlocks.delete(block);
      if (this.settings.displayMode === 'bilingual') {
        for (const { node } of block.parts) this.replacements.delete(node);
      }
      return;
    }
    if (this.settings.displayMode !== 'bilingual' || block.translation?.isConnected) return;

    let anchor = block.parts.at(-1).node;
    // Put the translation outside any inline links or emphasis.
    while (anchor.parentElement && anchor.parentElement !== block.element) anchor = anchor.parentElement;
    const translation = document.createElement('span');
    translation.setAttribute('data-ee-bilingual', '');
    translation.lang = block.targetLang;
    translation.dir = 'auto';
    translation.style.display = 'block';
    translation.style.marginBlockStart = '0.25em';
    translation.textContent = block.parts.map(({ node }) => this.replacements.get(node).text).join('').trim();
    anchor.parentNode.insertBefore(translation, anchor.nextSibling);
    block.translation = translation;
  }

  setDisplayMode(next) {
    if (this.settings.displayMode === next.displayMode) return;
    for (const [node, { source, text }] of this.replacements) {
      if (this.isReplaced(node) && source !== text) node.data = next.displayMode === 'bilingual' ? source : text;
    }
    this.settings = next;
    for (const block of this.bilingualBlocks) {
      if (next.displayMode === 'bilingual') this.renderBilingual(block);
      else block.translation?.remove();
    }
    this.reportStatus();
  }

  suspend() {
    this.stopObserver();
    if (this.active) {
      this.runId += 1;
      this.active = false;
    }
  }

  status() {
    return {
      active: this.active,
      following: this.following,
      translated: this.done,
      total: this.total,
      errors: this.errorCount,
      error: this.error,
      stopped: this.stopped,
      hasTranslation: this.hasTranslations(),
      targetLang: this.settings.targetLang,
      displayMode: this.settings.displayMode,
      excluded: this.isExcluded(),
    };
  }

  async start() {
    if (this.active) return;
    this.settings = this.deps.getSettings();
    if (this.isExcluded()) return;
    this.route = this.currentRoute();
    this.reset();
    this.following = true;
    return this.refresh();
  }

  reset({ restore = true } = {}) {
    this.runId += 1;
    this.active = false;
    this.following = false;
    this.stopped = false;
    this.error = '';
    this.done = 0;
    this.total = 0;
    this.errorCount = 0;
    this.failedBlocks.clear();
    this.clearRefresh();
    if (restore) this.restoreText();
  }

  async refresh({ retry = false } = {}) {
    if (this.checkNavigation() || this.suspended || this.active || !this.following) return;

    for (const node of this.replacements.keys()) this.isReplaced(node);
    for (const block of this.bilingualBlocks) this.renderBilingual(block);
    // Failed text can be retried explicitly. A site's own text updates are eligible again.
    const failedNodes = new Set();
    for (const [id, block] of this.failedBlocks) {
      if (retry || !this.isCurrent(block)) {
        this.failedBlocks.delete(id);
      } else {
        for (const { node } of block.parts) failedNodes.add(node);
      }
    }
    this.errorCount = this.failedBlocks.size;
    if (!this.errorCount) this.error = '';

    const blocks = collectBlocks(document.body, {
      skipNode: (node) => this.isReplaced(node) || failedNodes.has(node),
      includeBlock: visibleTextFilter(document),
    });
    if (!blocks.length) {
      this.total = this.done + this.errorCount;
      this.reportStatus();
      return;
    }

    const runId = ++this.runId;
    this.active = true;
    this.total = this.done + this.errorCount + blocks.length;
    this.deps.report('translating');
    try {
      await this.translateBlocks(blocks, runId);
    } finally {
      if (runId === this.runId) {
        this.active = false;
        this.total = this.done + this.errorCount;
        this.reportStatus();
        if (this.observer) this.scheduleRefresh();
      }
    }
  }

  reportStatus() {
    const status = this.status();
    if (this.active) this.deps.report('translating', status);
    else if (this.error || this.errorCount) this.deps.report('error', status);
    else if (this.done || status.hasTranslation) this.deps.report('done', status);
    else this.deps.report('restored', status);
  }

  isCurrent(block) {
    return block.parts.every(({ node, parent, source }) =>
      node.isConnected && node.parentNode === parent && node.data === source);
  }

  async translateBlocks(blocks, runId) {
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
        while (runId === this.runId && cursor < batches.length) {
          const index = cursor;
          cursor += 1;
          await this.runBatch(batches[index], runId);
        }
      },
    );
    await Promise.all(workers);
  }

  async runBatch(blocks, runId) {
    if (runId !== this.runId || this.checkNavigation()) return;
    const visible = visibleTextFilter(document);
    const current = blocks.filter((block) => this.isCurrent(block) && visible(block.parts));
    this.total -= blocks.length - current.length;
    if (!current.length) return;
    const items = current.map(({ id, text, language, parts }) => ({ id, text, language, slots: parts.length }));
    let response;
    try {
      response = await this.deps.requestBatch(items, { url: location.href, title: document.title });
    } catch (error) {
      response = { error: error?.message || '无法连接飞译，请刷新页面后重试' };
    }

    if (runId !== this.runId || this.checkNavigation()) return;
    if (!response?.ok || response.warning) {
      const error = response?.error || response?.warning;
      this.error ||= (typeof error === 'string' ? error : error?.message) || '翻译失败，请稍后重试';
    }

    for (const block of current) {
      // A site can change text while the provider is working. Keep its latest value.
      if (!this.isCurrent(block)) {
        this.failedBlocks.delete(block.id);
        this.total -= 1;
        continue;
      }
      const slots = splitTextSlots(response?.translations?.[block.id], block.parts.length);
      if (!slots) {
        this.failedBlocks.set(block.id, block);
        continue;
      }
      block.parts.forEach(({ node, source }, index) => {
        const text = source.replace(source.trim(), () => slots[index]);
        this.replacements.set(node, { source, text });
        if (source !== text && this.settings.displayMode !== 'bilingual') node.data = text;
      });
      if (block.parts.some(({ node, source }) => this.replacements.get(node).text !== source)) {
        block.targetLang = this.settings.targetLang;
        this.bilingualBlocks.add(block);
        this.renderBilingual(block);
      }
      this.done += 1;
      this.failedBlocks.delete(block.id);
    }
    this.errorCount = this.failedBlocks.size;
  }

  handleFatal(error) {
    this.cancel();
    this.error = (typeof error === 'string' ? error : error?.message) || '翻译失败，请稍后重试';
    this.deps.report('error');
  }

  cancel() {
    this.runId += 1;
    this.active = false;
    this.following = false;
    this.stopped = true;
    this.clearRefresh();
    this.reportStatus();
  }

  retryFailed() {
    if (this.active) return;
    this.following = true;
    this.stopped = false;
    return this.refresh({ retry: true });
  }

  restore() {
    this.reset();
    // Keep original text on this page until an explicit request or the next navigation.
    this.stopped = true;
    this.deps.report('restored');
  }

  toggle() {
    if (this.active) this.cancel();
    else if (this.following || this.hasTranslations()) this.restore();
    else this.start().catch((error) => this.handleFatal(error));
  }

  applySettings(next) {
    const autoBefore = this.shouldAutoTranslate();
    const languageChanged = this.settings.targetLang !== next.targetLang;
    this.setDisplayMode(next);
    this.settings = next;
    const autoNow = this.shouldAutoTranslate();
    if (languageChanged || (autoBefore && !autoNow) || this.isExcluded()) {
      if (this.following) this.cancel();
    }
    if (autoNow && (!autoBefore || languageChanged)) {
      this.stopped = false;
      if (languageChanged && this.hasTranslations()) this.reset();
      this.startAuto();
    }
  }

  startObserver() {
    if (this.observer || !document.documentElement) return;
    this.suspended = false;
    const view = document.defaultView;
    this.observer = new MutationObserver((mutations) => {
      if (this.checkNavigation() || !this.following) return;
      const relevant = mutations.some(({ type, target, addedNodes, removedNodes }) => {
        if (type === 'characterData') return !this.isReplaced(target);
        if (type === 'attributes') return true;
        return addedNodes.length || removedNodes.length;
      });
      if (relevant) this.scheduleRefresh();
    });
    this.observer.observe(document.documentElement, {
      characterData: true, childList: true, subtree: true,
      attributes: true, attributeFilter: ['class', 'style', 'hidden', 'open', 'aria-hidden'],
    });
    view?.addEventListener('scroll', this.onViewportChange, { capture: true, passive: true });
    view?.addEventListener('resize', this.onViewportChange);
    view?.addEventListener('popstate', this.scheduleRefresh);
    view?.addEventListener('hashchange', this.scheduleRefresh);
    view?.navigation?.addEventListener('currententrychange', this.scheduleRefresh);
    document.addEventListener('visibilitychange', this.scheduleRefresh);
  }

  stopObserver() {
    this.suspended = true;
    this.observer?.disconnect();
    this.observer = null;
    this.clearRefresh();
    const view = document.defaultView;
    view?.removeEventListener('scroll', this.onViewportChange, true);
    view?.removeEventListener('resize', this.onViewportChange);
    view?.removeEventListener('popstate', this.scheduleRefresh);
    view?.removeEventListener('hashchange', this.scheduleRefresh);
    view?.navigation?.removeEventListener('currententrychange', this.scheduleRefresh);
    document.removeEventListener('visibilitychange', this.scheduleRefresh);
  }

  clearRefresh() {
    clearTimeout(this.refreshTimer);
    this.refreshTimer = 0;
  }
}
