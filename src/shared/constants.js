/**
 * Static product configuration. Keep this module free of DOM and extension API
 * access so it can be imported by every context and by unit tests.
 */

const BUILD_VERSION =
  typeof __YILIU_VERSION__ !== 'undefined' ? __YILIU_VERSION__ : 'dev';

export const BRAND = Object.freeze({
  name: '译流',
  english: 'YiLiu',
  tagline: '让每一页，都读得懂',
  version: BUILD_VERSION,
});

export const TARGET_LANGUAGES = Object.freeze([
  { code: 'zh-CN', label: '简体中文', english: 'Simplified Chinese' },
  { code: 'zh-TW', label: '繁體中文', english: 'Traditional Chinese' },
  { code: 'en', label: 'English', english: 'English' },
  { code: 'ja', label: '日本語', english: 'Japanese' },
  { code: 'ko', label: '한국어', english: 'Korean' },
  { code: 'fr', label: 'Français', english: 'French' },
  { code: 'de', label: 'Deutsch', english: 'German' },
  { code: 'es', label: 'Español', english: 'Spanish' },
  { code: 'ru', label: 'Русский', english: 'Russian' },
  { code: 'pt', label: 'Português', english: 'Portuguese' },
  { code: 'it', label: 'Italiano', english: 'Italian' },
  { code: 'ar', label: 'العربية', english: 'Arabic' },
  { code: 'vi', label: 'Tiếng Việt', english: 'Vietnamese' },
  { code: 'th', label: 'ไทย', english: 'Thai' },
  { code: 'id', label: 'Bahasa Indonesia', english: 'Indonesian' },
  { code: 'tr', label: 'Türkçe', english: 'Turkish' },
  { code: 'nl', label: 'Nederlands', english: 'Dutch' },
  { code: 'pl', label: 'Polski', english: 'Polish' },
]);

export const SOURCE_LANGUAGES = Object.freeze([
  { code: 'auto', label: '自动检测' },
  { code: 'en', label: 'English' },
  { code: 'zh', label: '中文' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'es', label: 'Español' },
  { code: 'ru', label: 'Русский' },
  { code: 'pt', label: 'Português' },
  { code: 'it', label: 'Italiano' },
  { code: 'ar', label: 'العربية' },
]);

export const STYLE_OPTIONS = Object.freeze([
  {
    value: 'natural',
    label: '自然流畅',
    hint: '像母语者写的一样，适合日常阅读',
    prompt:
      'Use natural, idiomatic language that reads as if originally written in the target language. Prefer clarity over literal structure.',
  },
  {
    value: 'faithful',
    label: '忠实原文',
    hint: '保留原文结构与语气，适合技术资料',
    prompt:
      'Stay close to the source structure and tone. Do not add or omit information, but still produce grammatical target-language prose.',
  },
  {
    value: 'formal',
    label: '正式书面',
    hint: '适合论文、新闻、商务文档',
    prompt:
      'Use a polished, formal written register suitable for academic, news, or business documents. Avoid colloquialisms.',
  },
  {
    value: 'literal',
    label: '逐句对照',
    hint: '更贴近原句，便于语言学习',
    prompt:
      'Translate clause by clause with minimal restructuring. Preserve the original sentence order where the target language allows it.',
  },
]);

export const MODE_OPTIONS = Object.freeze([
  {
    value: 'bilingual',
    label: '双语对照',
    hint: '译文显示在原文下方，适合阅读与学习',
  },
  {
    value: 'replace',
    label: '仅看译文',
    hint: '隐藏原文，只保留翻译后的内容',
  },
]);

export const DISPLAY_STYLES = Object.freeze([
  { value: 'plain', label: '简洁' },
  { value: 'soft', label: '柔和底色' },
  { value: 'line', label: '左侧竖线' },
]);

export const PROVIDER_PRESETS = Object.freeze({
  deepseek: {
    label: 'DeepSeek',
    type: 'openai',
    baseUrl: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat',
    jsonMode: true,
    keyless: false,
    hint: '性价比高，中文表达自然',
  },
  openai: {
    label: 'OpenAI',
    type: 'openai',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
    jsonMode: true,
    keyless: false,
    hint: '兼容 GPT 系列与多数 OpenAI 格式服务',
  },
  openrouter: {
    label: 'OpenRouter',
    type: 'openai',
    baseUrl: 'https://openrouter.ai/api/v1',
    model: 'openai/gpt-4o-mini',
    jsonMode: true,
    keyless: false,
    hint: '一个 Key 调用多家模型',
  },
  siliconflow: {
    label: '硅基流动',
    type: 'openai',
    baseUrl: 'https://api.siliconflow.cn/v1',
    model: 'Qwen/Qwen2.5-7B-Instruct',
    jsonMode: true,
    keyless: false,
    hint: '国内访问稳定，支持多种开源模型',
  },
  moonshot: {
    label: 'Moonshot',
    type: 'openai',
    baseUrl: 'https://api.moonshot.cn/v1',
    model: 'moonshot-v1-8k',
    jsonMode: true,
    keyless: false,
    hint: 'Kimi 开放平台',
  },
  zhipu: {
    label: '智谱 GLM',
    type: 'openai',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    model: 'glm-4-flash',
    jsonMode: true,
    keyless: false,
    hint: 'GLM 系列模型',
  },
  ollama: {
    label: 'Ollama（本地）',
    type: 'openai',
    baseUrl: 'http://127.0.0.1:11434/v1',
    model: 'qwen2.5:7b',
    jsonMode: false,
    keyless: true,
    hint: '数据不出本机，需要先运行 ollama serve',
  },
  lmstudio: {
    label: 'LM Studio（本地）',
    type: 'openai',
    baseUrl: 'http://127.0.0.1:1234/v1',
    model: 'local-model',
    jsonMode: false,
    keyless: true,
    hint: '在 LM Studio 中启动本地服务器',
  },
  anthropic: {
    label: 'Anthropic Claude',
    type: 'anthropic',
    baseUrl: 'https://api.anthropic.com/v1',
    model: 'claude-3-5-haiku-latest',
    jsonMode: false,
    keyless: false,
    hint: '使用 Anthropic Messages API',
  },
  custom: {
    label: '自定义 / 兼容接口',
    type: 'openai',
    baseUrl: 'https://api.example.com/v1',
    model: '',
    jsonMode: false,
    keyless: false,
    hint: '任何兼容 /chat/completions 的服务',
  },
});

export const SHORTCUT = Object.freeze({
  key: 'Alt+A',
  mac: '⌥ A',
  windows: 'Alt + A',
});

export const LIMITS = Object.freeze({
  maxSelectionChars: 8000,
  maxBlockChars: 12000,
  maxBatchItems: 16,
  maxBatchChars: 6000,
  maxPageBlocks: 1500,
});

export const CACHE_STORAGE_KEY = 'yiliuTranslationCacheV1';
export const SETTINGS_STORAGE_KEY = 'yiliuSettingsV1';

/**
 * Resolve the human-readable prompt name for a BCP-47-ish language code.
 * @param {string} code
 */
export function languageName(code) {
  if (!code) return 'the target language';
  const target = TARGET_LANGUAGES.find((item) => item.code === code);
  if (target) return target.english;
  const source = SOURCE_LANGUAGES.find((item) => item.code === code);
  if (source) return source.label;
  return code;
}

/** @param {string} code */
export function targetLanguageLabel(code) {
  return TARGET_LANGUAGES.find((item) => item.code === code)?.label || code;
}
