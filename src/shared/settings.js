import {
  DISPLAY_STYLES,
  MODE_OPTIONS,
  PROVIDER_PRESETS,
  STYLE_OPTIONS,
  TARGET_LANGUAGES,
} from './constants.js';
import { clamp, isLikelyLocalUrl, linesToArray } from './utils.js';

/**
 * Stored settings are intentionally flat and JSON-friendly. Provider secrets
 * live next to the rest of the config in extension-local storage; they are
 * never synced and never sent anywhere except the configured API endpoint.
 */
export const DEFAULT_SETTINGS = Object.freeze({
  schemaVersion: 1,
  provider: {
    preset: 'deepseek',
    type: 'openai',
    baseUrl: 'https://api.deepseek.com/v1',
    apiKey: '',
    model: 'deepseek-chat',
    temperature: 0.2,
    maxTokens: 4096,
    jsonMode: true,
    extraHeaders: '',
  },
  sourceLang: 'auto',
  targetLang: 'zh-CN',
  style: 'natural',
  mode: 'bilingual',
  autoTranslateSites: [],
  excludeSites: [],
  skipTargetLanguagePages: true,
  glossary: '',
  customPrompt: '',
  selection: {
    enabled: true,
    auto: false,
  },
  cache: {
    enabled: true,
    maxEntries: 600,
  },
  batch: {
    maxItems: 10,
    concurrency: 2,
  },
  ui: {
    fontSize: 15,
    color: '#4a4842',
    displayStyle: 'plain',
  },
  advanced: {
    timeoutMs: 60000,
    sendPageContext: true,
  },
});

const PROVIDER_TYPES = new Set(['openai', 'anthropic']);
const STYLE_VALUES = new Set(STYLE_OPTIONS.map((item) => item.value));
const MODE_VALUES = new Set(MODE_OPTIONS.map((item) => item.value));
const DISPLAY_VALUES = new Set(DISPLAY_STYLES.map((item) => item.value));

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function mergeObject(defaults, raw) {
  if (!isPlainObject(raw)) return structuredCloneSafe(defaults);
  const result = {};
  for (const key of Object.keys(defaults)) {
    const defaultValue = defaults[key];
    const rawValue = raw[key];
    if (Array.isArray(defaultValue)) {
      result[key] = Array.isArray(rawValue)
        ? rawValue.filter((item) => typeof item === 'string').map((item) => item.trim()).filter(Boolean)
        : [...defaultValue];
    } else if (isPlainObject(defaultValue)) {
      result[key] = mergeObject(defaultValue, rawValue);
    } else if (typeof rawValue === typeof defaultValue) {
      result[key] = rawValue;
    } else {
      result[key] = defaultValue;
    }
  }
  return result;
}

function structuredCloneSafe(value) {
  return JSON.parse(JSON.stringify(value));
}

function uniqueStrings(values) {
  return [...new Set((Array.isArray(values) ? values : []).map((item) => String(item).trim()).filter(Boolean))];
}

function validHexColor(value, fallback) {
  return /^#[0-9a-f]{6}$/i.test(String(value || '')) ? String(value) : fallback;
}

/**
 * Merge untrusted storage input with defaults and clamp every numeric or
 * enumerated value. Safe to call from any context.
 * @param {unknown} raw
 */
export function mergeSettings(raw) {
  const merged = mergeObject(DEFAULT_SETTINGS, raw);
  const provider = merged.provider;

  if (!PROVIDER_TYPES.has(provider.type)) provider.type = 'openai';
  if (!PROVIDER_PRESETS[provider.preset]) provider.preset = 'custom';
  provider.baseUrl = String(provider.baseUrl || '').trim().replace(/\/+$/, '');
  provider.apiKey = String(provider.apiKey || '').trim();
  provider.model = String(provider.model || '').trim();
  provider.extraHeaders = String(provider.extraHeaders || '').slice(0, 4000);
  provider.temperature = clamp(Number(provider.temperature) || 0.2, 0, 1.5);
  provider.maxTokens = Math.round(clamp(Number(provider.maxTokens) || 4096, 128, 32000));
  provider.jsonMode = Boolean(provider.jsonMode);

  if (!TARGET_LANGUAGES.some((item) => item.code === merged.targetLang)) {
    merged.targetLang = 'zh-CN';
  }
  if (!STYLE_VALUES.has(merged.style)) merged.style = 'natural';
  if (!MODE_VALUES.has(merged.mode)) merged.mode = 'bilingual';
  if (!DISPLAY_VALUES.has(merged.ui.displayStyle)) merged.ui.displayStyle = 'plain';

  merged.autoTranslateSites = uniqueStrings(merged.autoTranslateSites);
  merged.excludeSites = uniqueStrings(merged.excludeSites);
  merged.glossary = String(merged.glossary || '').slice(0, 12000);
  merged.customPrompt = String(merged.customPrompt || '').slice(0, 4000);

  merged.selection.enabled = Boolean(merged.selection.enabled);
  merged.selection.auto = Boolean(merged.selection.auto);
  merged.cache.enabled = Boolean(merged.cache.enabled);
  merged.cache.maxEntries = Math.round(clamp(Number(merged.cache.maxEntries) || 600, 50, 2000));
  merged.batch.maxItems = Math.round(clamp(Number(merged.batch.maxItems) || 10, 1, 16));
  merged.batch.concurrency = Math.round(clamp(Number(merged.batch.concurrency) || 2, 1, 4));
  merged.ui.fontSize = clamp(Number(merged.ui.fontSize) || 15, 12, 22);
  merged.ui.color = validHexColor(merged.ui.color, DEFAULT_SETTINGS.ui.color);
  // Migrate the old blue-grey default to the current ink/warm-grey palette.
  if (merged.ui.color.toLowerCase() === '#52627a') merged.ui.color = DEFAULT_SETTINGS.ui.color;
  merged.advanced.timeoutMs = Math.round(
    clamp(Number(merged.advanced.timeoutMs) || 60000, 5000, 180000),
  );
  merged.advanced.sendPageContext = Boolean(merged.advanced.sendPageContext);

  return merged;
}

export function providerRequiresKey(provider) {
  if (!provider) return true;
  if (provider.type === 'anthropic') return true;
  return !isLikelyLocalUrl(provider.baseUrl) && !PROVIDER_PRESETS[provider.preset]?.keyless;
}

export function isProviderConfigured(settings) {
  const provider = settings?.provider;
  if (!provider?.baseUrl || !provider?.model) return false;
  if (providerRequiresKey(provider) && !provider.apiKey) return false;
  return true;
}

/**
 * Settings sent to content scripts and popup. The API key is replaced by a
 * boolean so a compromised page still cannot read it from the message stream.
 */
export function publicSettings(settings) {
  const full = mergeSettings(settings);
  const { apiKey, ...safeProvider } = full.provider;
  return {
    ...full,
    provider: {
      ...safeProvider,
      apiKeySet: Boolean(apiKey),
      requiresKey: providerRequiresKey(full.provider),
    },
    configured: isProviderConfigured(full),
  };
}

export function providerConfigFromForm(input) {
  return {
    preset: String(input.preset || 'custom'),
    type: PROVIDER_TYPES.has(input.type) ? input.type : 'openai',
    baseUrl: String(input.baseUrl || '').trim(),
    apiKey: String(input.apiKey || '').trim(),
    model: String(input.model || '').trim(),
    temperature: clamp(Number(input.temperature) || 0.2, 0, 1.5),
    maxTokens: Math.round(clamp(Number(input.maxTokens) || 4096, 128, 32000)),
    jsonMode: Boolean(input.jsonMode),
    extraHeaders: String(input.extraHeaders || ''),
  };
}

export function settingsForStorage(settings) {
  const clean = mergeSettings(settings);
  clean.autoTranslateSites = linesToArray(clean.autoTranslateSites.join('\n'));
  clean.excludeSites = linesToArray(clean.excludeSites.join('\n'));
  return clean;
}
