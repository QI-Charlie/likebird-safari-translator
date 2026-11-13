import { CACHE_STORAGE_KEY } from '../shared/constants.js';
import { hashText } from '../shared/utils.js';
import { storageGet, storageRemove, storageSet } from '../shared/storage.js';

function cacheKey(text, settings, scope) {
  return hashText(
    [
      scope ? `${scope}\u0000${text}` : text,
      settings.targetLang,
      settings.sourceLang,
      settings.style,
      settings.provider.baseUrl,
      settings.provider.model,
      settings.glossary,
      settings.customPrompt,
    ].join('\u0000'),
  );
}

/**
 * A tiny LRU-ish translation cache backed by extension storage. The cache is
 * scoped to the extension, never leaves the device, and is keyed by everything
 * that can change a translation (model, language, style, glossary, prompt).
 */
export class TranslationCache {
  constructor() {
    this.entries = new Map();
    this.loaded = false;
    this.maxEntries = 600;
    this.dirty = false;
  }

  async load() {
    if (this.loaded) return;
    this.loaded = true;
    try {
      const data = await storageGet(CACHE_STORAGE_KEY);
      const stored = data?.[CACHE_STORAGE_KEY];
      if (stored?.entries && typeof stored.entries === 'object') {
        for (const [key, value] of Object.entries(stored.entries)) {
          if (value && typeof value.text === 'string' && Number.isFinite(value.at)) {
            this.entries.set(key, { text: value.text, at: value.at });
          }
        }
      }
    } catch {
      this.entries.clear();
    }
  }

  configure(settings) {
    this.maxEntries = settings.cache.maxEntries;
  }

  get(text, settings, scope) {
    if (!settings.cache.enabled) return null;
    const key = cacheKey(text, settings, scope);
    const entry = this.entries.get(key);
    if (!entry) return null;
    entry.at = Date.now();
    return entry.text;
  }

  set(text, translation, settings, scope) {
    if (!settings.cache.enabled || !translation) return;
    const key = cacheKey(text, settings, scope);
    this.entries.set(key, { text: translation, at: Date.now() });
    this.dirty = true;
    this.prune();
  }

  prune() {
    if (this.entries.size <= this.maxEntries) return;
    const sorted = [...this.entries.entries()].sort((a, b) => a[1].at - b[1].at);
    const removeCount = this.entries.size - this.maxEntries;
    for (let index = 0; index < removeCount; index += 1) {
      this.entries.delete(sorted[index][0]);
    }
  }

  async persist(force = false) {
    if (!this.dirty && !force) return;
    this.dirty = false;
    const entries = {};
    for (const [key, value] of this.entries) entries[key] = value;
    try {
      await storageSet({
        [CACHE_STORAGE_KEY]: {
          version: 1,
          entries,
          savedAt: Date.now(),
        },
      });
    } catch {
      this.dirty = true;
    }
  }

  async clear() {
    this.entries.clear();
    this.dirty = false;
    try {
      await storageRemove(CACHE_STORAGE_KEY);
    } catch {
      // Clearing should never break translation.
    }
  }

  get size() {
    return this.entries.size;
  }
}
