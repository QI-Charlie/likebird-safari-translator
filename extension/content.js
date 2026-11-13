(() => {
  // src/shared/constants.js
  var BUILD_VERSION = true ? "1.0.0" : "dev";
  var BRAND = Object.freeze({
    name: "译流",
    english: "YiLiu",
    tagline: "让每一页，都读得懂",
    version: BUILD_VERSION
  });
  var TARGET_LANGUAGES = Object.freeze([
    { code: "zh-CN", label: "简体中文", english: "Simplified Chinese" },
    { code: "zh-TW", label: "繁體中文", english: "Traditional Chinese" },
    { code: "en", label: "English", english: "English" },
    { code: "ja", label: "日本語", english: "Japanese" },
    { code: "ko", label: "한국어", english: "Korean" },
    { code: "fr", label: "Français", english: "French" },
    { code: "de", label: "Deutsch", english: "German" },
    { code: "es", label: "Español", english: "Spanish" },
    { code: "ru", label: "Русский", english: "Russian" },
    { code: "pt", label: "Português", english: "Portuguese" },
    { code: "it", label: "Italiano", english: "Italian" },
    { code: "ar", label: "العربية", english: "Arabic" },
    { code: "vi", label: "Tiếng Việt", english: "Vietnamese" },
    { code: "th", label: "ไทย", english: "Thai" },
    { code: "id", label: "Bahasa Indonesia", english: "Indonesian" },
    { code: "tr", label: "Türkçe", english: "Turkish" },
    { code: "nl", label: "Nederlands", english: "Dutch" },
    { code: "pl", label: "Polski", english: "Polish" }
  ]);
  var SOURCE_LANGUAGES = Object.freeze([
    { code: "auto", label: "自动检测" },
    { code: "en", label: "English" },
    { code: "zh", label: "中文" },
    { code: "ja", label: "日本語" },
    { code: "ko", label: "한국어" },
    { code: "fr", label: "Français" },
    { code: "de", label: "Deutsch" },
    { code: "es", label: "Español" },
    { code: "ru", label: "Русский" },
    { code: "pt", label: "Português" },
    { code: "it", label: "Italiano" },
    { code: "ar", label: "العربية" }
  ]);
  var STYLE_OPTIONS = Object.freeze([
    {
      value: "natural",
      label: "自然流畅",
      hint: "像母语者写的一样，适合日常阅读",
      prompt: "Use natural, idiomatic language that reads as if originally written in the target language. Prefer clarity over literal structure."
    },
    {
      value: "faithful",
      label: "忠实原文",
      hint: "保留原文结构与语气，适合技术资料",
      prompt: "Stay close to the source structure and tone. Do not add or omit information, but still produce grammatical target-language prose."
    },
    {
      value: "formal",
      label: "正式书面",
      hint: "适合论文、新闻、商务文档",
      prompt: "Use a polished, formal written register suitable for academic, news, or business documents. Avoid colloquialisms."
    },
    {
      value: "literal",
      label: "逐句对照",
      hint: "更贴近原句，便于语言学习",
      prompt: "Translate clause by clause with minimal restructuring. Preserve the original sentence order where the target language allows it."
    }
  ]);
  var MODE_OPTIONS = Object.freeze([
    {
      value: "bilingual",
      label: "双语对照",
      hint: "译文显示在原文下方，适合阅读与学习"
    },
    {
      value: "replace",
      label: "仅看译文",
      hint: "隐藏原文，只保留翻译后的内容"
    }
  ]);
  var DISPLAY_STYLES = Object.freeze([
    { value: "plain", label: "简洁" },
    { value: "soft", label: "柔和底色" },
    { value: "line", label: "左侧竖线" }
  ]);
  var PROVIDER_PRESETS = Object.freeze({
    deepseek: {
      label: "DeepSeek",
      type: "openai",
      baseUrl: "https://api.deepseek.com/v1",
      model: "deepseek-chat",
      jsonMode: true,
      keyless: false,
      hint: "性价比高，中文表达自然"
    },
    openai: {
      label: "OpenAI",
      type: "openai",
      baseUrl: "https://api.openai.com/v1",
      model: "gpt-4o-mini",
      jsonMode: true,
      keyless: false,
      hint: "兼容 GPT 系列与多数 OpenAI 格式服务"
    },
    openrouter: {
      label: "OpenRouter",
      type: "openai",
      baseUrl: "https://openrouter.ai/api/v1",
      model: "openai/gpt-4o-mini",
      jsonMode: true,
      keyless: false,
      hint: "一个 Key 调用多家模型"
    },
    siliconflow: {
      label: "硅基流动",
      type: "openai",
      baseUrl: "https://api.siliconflow.cn/v1",
      model: "Qwen/Qwen2.5-7B-Instruct",
      jsonMode: true,
      keyless: false,
      hint: "国内访问稳定，支持多种开源模型"
    },
    moonshot: {
      label: "Moonshot",
      type: "openai",
      baseUrl: "https://api.moonshot.cn/v1",
      model: "moonshot-v1-8k",
      jsonMode: true,
      keyless: false,
      hint: "Kimi 开放平台"
    },
    zhipu: {
      label: "智谱 GLM",
      type: "openai",
      baseUrl: "https://open.bigmodel.cn/api/paas/v4",
      model: "glm-4-flash",
      jsonMode: true,
      keyless: false,
      hint: "GLM 系列模型"
    },
    ollama: {
      label: "Ollama（本地）",
      type: "openai",
      baseUrl: "http://127.0.0.1:11434/v1",
      model: "qwen2.5:7b",
      jsonMode: false,
      keyless: true,
      hint: "数据不出本机，需要先运行 ollama serve"
    },
    lmstudio: {
      label: "LM Studio（本地）",
      type: "openai",
      baseUrl: "http://127.0.0.1:1234/v1",
      model: "local-model",
      jsonMode: false,
      keyless: true,
      hint: "在 LM Studio 中启动本地服务器"
    },
    anthropic: {
      label: "Anthropic Claude",
      type: "anthropic",
      baseUrl: "https://api.anthropic.com/v1",
      model: "claude-3-5-haiku-latest",
      jsonMode: false,
      keyless: false,
      hint: "使用 Anthropic Messages API"
    },
    custom: {
      label: "自定义 / 兼容接口",
      type: "openai",
      baseUrl: "https://api.example.com/v1",
      model: "",
      jsonMode: false,
      keyless: false,
      hint: "任何兼容 /chat/completions 的服务"
    }
  });
  var SHORTCUT = Object.freeze({
    key: "Alt+A",
    mac: "⌥ A",
    windows: "Alt + A"
  });
  var LIMITS = Object.freeze({
    maxSelectionChars: 8e3,
    maxBlockChars: 12e3,
    maxBatchItems: 16,
    maxBatchChars: 6e3,
    maxPageBlocks: 1500
  });
  function targetLanguageLabel(code) {
    return TARGET_LANGUAGES.find((item) => item.code === code)?.label || code;
  }

  // src/shared/utils.js
  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }
  function debounce(fn, wait = 300) {
    let timer = 0;
    const debounced = (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), wait);
    };
    debounced.cancel = () => clearTimeout(timer);
    debounced.flush = (...args) => {
      clearTimeout(timer);
      fn(...args);
    };
    return debounced;
  }
  var uidCounter = 0;
  function uid(prefix = "id") {
    uidCounter = (uidCounter + 1) % 1e6;
    return `${prefix}_${Date.now().toString(36)}_${uidCounter.toString(36)}`;
  }
  function escapeHtml(value) {
    return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function escapeAttribute(value) {
    return escapeHtml(value).replace(/`/g, "&#96;");
  }
  function normalizeSpace(value) {
    return String(value ?? "").replace(/\u00a0/g, " ").replace(/[\t\f\v ]+/g, " ").replace(/ *\n */g, " ").replace(/\s{2,}/g, " ").trim();
  }
  function squish(value, max = 200) {
    const text = normalizeSpace(value);
    if (text.length <= max) return text;
    return `${text.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
  }
  function hostMatchesRule(host, rule) {
    const normalizedHost = String(host || "").toLowerCase().replace(/^www\./, "");
    const raw = String(rule || "").trim().toLowerCase().replace(/^https?:\/\//, "").split("/")[0].replace(/:\d+$/, "").replace(/^\*\./, "").replace(/^\./, "");
    if (!raw) return false;
    if (raw === "*") return true;
    return normalizedHost === raw || normalizedHost.endsWith(`.${raw}`);
  }
  function hostMatchesAny(host, rules) {
    if (!Array.isArray(rules)) return false;
    return rules.some((rule) => hostMatchesRule(host, rule));
  }

  // src/shared/settings.js
  var DEFAULT_SETTINGS = Object.freeze({
    schemaVersion: 1,
    provider: {
      preset: "deepseek",
      type: "openai",
      baseUrl: "https://api.deepseek.com/v1",
      apiKey: "",
      model: "deepseek-chat",
      temperature: 0.2,
      maxTokens: 4096,
      jsonMode: true,
      extraHeaders: ""
    },
    sourceLang: "auto",
    targetLang: "zh-CN",
    style: "natural",
    mode: "bilingual",
    autoTranslateSites: [],
    excludeSites: [],
    skipTargetLanguagePages: true,
    glossary: "",
    customPrompt: "",
    selection: {
      enabled: true,
      auto: false
    },
    cache: {
      enabled: true,
      maxEntries: 600
    },
    batch: {
      maxItems: 10,
      concurrency: 2
    },
    ui: {
      fontSize: 15,
      color: "#4a4842",
      displayStyle: "plain"
    },
    advanced: {
      timeoutMs: 6e4,
      sendPageContext: true
    }
  });
  var PROVIDER_TYPES = /* @__PURE__ */ new Set(["openai", "anthropic"]);
  var STYLE_VALUES = new Set(STYLE_OPTIONS.map((item) => item.value));
  var MODE_VALUES = new Set(MODE_OPTIONS.map((item) => item.value));
  var DISPLAY_VALUES = new Set(DISPLAY_STYLES.map((item) => item.value));
  function isPlainObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }
  function mergeObject(defaults, raw) {
    if (!isPlainObject(raw)) return structuredCloneSafe(defaults);
    const result = {};
    for (const key of Object.keys(defaults)) {
      const defaultValue = defaults[key];
      const rawValue = raw[key];
      if (Array.isArray(defaultValue)) {
        result[key] = Array.isArray(rawValue) ? rawValue.filter((item) => typeof item === "string").map((item) => item.trim()).filter(Boolean) : [...defaultValue];
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
    return /^#[0-9a-f]{6}$/i.test(String(value || "")) ? String(value) : fallback;
  }
  function mergeSettings(raw) {
    const merged = mergeObject(DEFAULT_SETTINGS, raw);
    const provider = merged.provider;
    if (!PROVIDER_TYPES.has(provider.type)) provider.type = "openai";
    if (!PROVIDER_PRESETS[provider.preset]) provider.preset = "custom";
    provider.baseUrl = String(provider.baseUrl || "").trim().replace(/\/+$/, "");
    provider.apiKey = String(provider.apiKey || "").trim();
    provider.model = String(provider.model || "").trim();
    provider.extraHeaders = String(provider.extraHeaders || "").slice(0, 4e3);
    provider.temperature = clamp(Number(provider.temperature) || 0.2, 0, 1.5);
    provider.maxTokens = Math.round(clamp(Number(provider.maxTokens) || 4096, 128, 32e3));
    provider.jsonMode = Boolean(provider.jsonMode);
    if (!TARGET_LANGUAGES.some((item) => item.code === merged.targetLang)) {
      merged.targetLang = "zh-CN";
    }
    if (!STYLE_VALUES.has(merged.style)) merged.style = "natural";
    if (!MODE_VALUES.has(merged.mode)) merged.mode = "bilingual";
    if (!DISPLAY_VALUES.has(merged.ui.displayStyle)) merged.ui.displayStyle = "plain";
    merged.autoTranslateSites = uniqueStrings(merged.autoTranslateSites);
    merged.excludeSites = uniqueStrings(merged.excludeSites);
    merged.glossary = String(merged.glossary || "").slice(0, 12e3);
    merged.customPrompt = String(merged.customPrompt || "").slice(0, 4e3);
    merged.selection.enabled = Boolean(merged.selection.enabled);
    merged.selection.auto = Boolean(merged.selection.auto);
    merged.cache.enabled = Boolean(merged.cache.enabled);
    merged.cache.maxEntries = Math.round(clamp(Number(merged.cache.maxEntries) || 600, 50, 2e3));
    merged.batch.maxItems = Math.round(clamp(Number(merged.batch.maxItems) || 10, 1, 16));
    merged.batch.concurrency = Math.round(clamp(Number(merged.batch.concurrency) || 2, 1, 4));
    merged.ui.fontSize = clamp(Number(merged.ui.fontSize) || 15, 12, 22);
    merged.ui.color = validHexColor(merged.ui.color, DEFAULT_SETTINGS.ui.color);
    if (merged.ui.color.toLowerCase() === "#52627a") merged.ui.color = DEFAULT_SETTINGS.ui.color;
    merged.advanced.timeoutMs = Math.round(
      clamp(Number(merged.advanced.timeoutMs) || 6e4, 5e3, 18e4)
    );
    merged.advanced.sendPageContext = Boolean(merged.advanced.sendPageContext);
    return merged;
  }

  // src/shared/storage.js
  function extensionApi() {
    if (globalThis.chrome?.runtime?.id) return globalThis.chrome;
    return globalThis.browser ?? globalThis.chrome;
  }
  function runtimeLastError() {
    try {
      return extensionApi()?.runtime?.lastError || globalThis.chrome?.runtime?.lastError || null;
    } catch {
      return null;
    }
  }
  function callApi(target, method, args = [], { timeoutMs = 3e4 } = {}) {
    return new Promise((resolve, reject) => {
      const fn = target?.[method];
      if (typeof fn !== "function") {
        reject(new Error(`扩展 API 不可用：${method}`));
        return;
      }
      let settled = false;
      const timer = setTimeout(() => {
        settle(new Error(`扩展 API 超时：${method}`));
      }, timeoutMs);
      function settle(error, value) {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        if (error) reject(error);
        else resolve(value);
      }
      const callback = (value) => {
        const error = runtimeLastError();
        if (error) settle(new Error(error.message || String(error)));
        else settle(null, value);
      };
      let returned;
      try {
        returned = fn.apply(target, [...args, callback]);
      } catch (error) {
        if (/argument|parameter|callback|type/i.test(String(error?.message || ""))) {
          try {
            returned = fn.apply(target, args);
            if (returned && typeof returned.then === "function") {
              returned.then(
                (value) => settle(null, value),
                (retryError) => settle(retryError)
              );
              return;
            }
            settle(null, returned);
            return;
          } catch {
          }
        }
        settle(error);
        return;
      }
      if (returned && typeof returned.then === "function") {
        returned.then(
          (value) => settle(null, value),
          (error) => settle(error)
        );
      }
    });
  }
  async function sendRuntimeMessage(message, timeoutMs = 3e5) {
    const api2 = extensionApi();
    if (!api2?.runtime?.sendMessage) throw new Error("扩展消息通道不可用");
    return callApi(api2.runtime, "sendMessage", [message], { timeoutMs });
  }

  // src/content/overlay.css
  var overlay_default = ':host {\n  all: initial;\n  --yl-paper: #f7f4ec;\n  --yl-ink: #111111;\n  --yl-mist: #c6c2ba;\n  --yl-char: #2a2a28;\n  --yl-lime: #a6ff00;\n  --yl-iris: #a060f0;\n  --yl-card: #ffffff;\n  --yl-line: #e2ded4;\n  --yl-line-strong: #d2cdc1;\n  --yl-muted: #6f6b63;\n  --yl-faint: #7c776d;\n  --yl-shadow: 0 10px 30px rgba(17, 17, 17, 0.1);\n  color-scheme: light dark;\n  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;\n}\n\n*,\n*::before,\n*::after {\n  box-sizing: border-box;\n}\n\n.yl-layer {\n  position: fixed;\n  inset: 0;\n  z-index: 2147483647;\n  pointer-events: none;\n  color: var(--yl-ink);\n  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;\n  font-size: 14px;\n  line-height: 1.5;\n  text-align: left;\n  -webkit-font-smoothing: antialiased;\n}\n\n.yl-layer button {\n  appearance: none;\n  border: 0;\n  margin: 0;\n  padding: 0;\n  background: none;\n  color: inherit;\n  font: inherit;\n  cursor: pointer;\n}\n\n.yl-layer button:focus-visible {\n  outline: 2px solid var(--yl-ink);\n  outline-offset: 2px;\n}\n\n.yl-layer svg {\n  display: block;\n  width: 15px;\n  height: 15px;\n  fill: none;\n  stroke: currentColor;\n  stroke-width: 1.7;\n  stroke-linecap: round;\n  stroke-linejoin: round;\n}\n\n.yl-brand-mark {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  width: 23px;\n  height: 23px;\n  border-radius: 6px;\n  background: var(--yl-lime);\n  color: #111111;\n  font-size: 13px;\n  font-weight: 700;\n  letter-spacing: -0.02em;\n}\n\n.yl-trigger {\n  position: fixed;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 34px;\n  height: 34px;\n  border-radius: 9px;\n  background: var(--yl-char);\n  color: var(--yl-lime);\n  font-size: 15px;\n  font-weight: 700;\n  pointer-events: auto;\n  box-shadow: 0 5px 16px rgba(17, 17, 17, 0.18);\n  opacity: 0;\n  transform: translateY(4px) scale(0.96);\n  transition: opacity 140ms ease, transform 140ms ease;\n  user-select: none;\n  -webkit-user-select: none;\n}\n\n.yl-trigger::after {\n  content: "";\n  position: absolute;\n  left: 50%;\n  bottom: -4px;\n  width: 8px;\n  height: 8px;\n  background: var(--yl-char);\n  transform: translateX(-50%) rotate(45deg);\n  border-radius: 1px;\n}\n\n.yl-trigger:hover {\n  background: #111111;\n}\n\n.yl-trigger.is-visible {\n  opacity: 1;\n  transform: translateY(0) scale(1);\n}\n\n.yl-bubble {\n  position: fixed;\n  display: flex;\n  flex-direction: column;\n  width: min(396px, calc(100vw - 24px));\n  max-height: min(72vh, 560px);\n  overflow: hidden;\n  border: 1px solid var(--yl-line);\n  border-radius: 16px;\n  background: var(--yl-card);\n  box-shadow: var(--yl-shadow);\n  pointer-events: auto;\n  opacity: 0;\n  visibility: hidden;\n  transform: translateY(6px);\n  transform-origin: top left;\n  transition: opacity 150ms ease, transform 150ms ease, visibility 150ms ease;\n}\n\n.yl-bubble.is-visible {\n  opacity: 1;\n  visibility: visible;\n  transform: translateY(0);\n}\n\n.yl-bubble-head {\n  display: flex;\n  align-items: center;\n  gap: 9px;\n  padding: 12px 12px 10px 14px;\n  border-bottom: 1px solid var(--yl-line);\n  background: var(--yl-card);\n}\n\n.yl-bubble-title {\n  display: flex;\n  align-items: baseline;\n  gap: 6px;\n  min-width: 0;\n  flex: 1;\n}\n\n.yl-bubble-title strong {\n  color: var(--yl-ink);\n  font-size: 13px;\n  font-weight: 650;\n  letter-spacing: 0.01em;\n}\n\n.yl-bubble-title span {\n  overflow: hidden;\n  color: var(--yl-faint);\n  font-size: 11px;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.yl-icon-btn {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  width: 27px;\n  height: 27px;\n  border-radius: 7px;\n  color: var(--yl-faint);\n  transition: background 120ms ease, color 120ms ease;\n}\n\n.yl-icon-btn:hover {\n  background: var(--yl-paper);\n  color: var(--yl-ink);\n}\n\n.yl-bubble-body {\n  min-height: 0;\n  overflow-y: auto;\n  padding: 12px 16px 14px;\n  overscroll-behavior: contain;\n}\n\n.yl-source {\n  max-height: 76px;\n  overflow-y: auto;\n  margin-bottom: 11px;\n  padding: 8px 10px;\n  border: 1px solid var(--yl-line);\n  border-radius: 8px;\n  background: var(--yl-paper);\n  color: var(--yl-muted);\n  font-size: 12px;\n  line-height: 1.55;\n  white-space: pre-wrap;\n  overflow-wrap: anywhere;\n}\n\n.yl-divider {\n  height: 1px;\n  margin: 0 0 12px;\n  background: var(--yl-line);\n}\n\n.yl-result {\n  min-height: 42px;\n  color: var(--yl-ink);\n  font-size: 15.5px;\n  line-height: 1.72;\n  overflow-wrap: anywhere;\n  white-space: pre-wrap;\n}\n\n.yl-result strong {\n  font-weight: 650;\n}\n\n.yl-loading {\n  display: flex;\n  align-items: center;\n  gap: 9px;\n  min-height: 34px;\n  color: var(--yl-muted);\n  font-size: 12.5px;\n}\n\n.yl-dots {\n  display: inline-flex;\n  gap: 3px;\n}\n\n.yl-dots i {\n  width: 5px;\n  height: 5px;\n  border-radius: 50%;\n  background: var(--yl-ink);\n  animation: yl-pulse 1.15s ease-in-out infinite;\n}\n\n.yl-dots i:nth-child(2) {\n  animation-delay: 0.14s;\n}\n\n.yl-dots i:nth-child(3) {\n  animation-delay: 0.28s;\n}\n\n@keyframes yl-pulse {\n  0%,\n  100% {\n    opacity: 0.25;\n    transform: translateY(0);\n  }\n  50% {\n    opacity: 1;\n    transform: translateY(-2px);\n  }\n}\n\n.yl-error {\n  display: flex;\n  flex-direction: column;\n  gap: 9px;\n  color: var(--yl-ink);\n  font-size: 13px;\n  line-height: 1.55;\n}\n\n.yl-error p {\n  margin: 0;\n}\n\n.yl-error-action {\n  align-self: flex-start;\n  padding: 6px 10px;\n  border: 1px solid var(--yl-line-strong, #d2cdc1);\n  border-radius: 7px;\n  background: var(--yl-card);\n  color: var(--yl-ink);\n  font-size: 12px;\n  font-weight: 600;\n}\n\n.yl-error-action:hover {\n  border-color: var(--yl-ink);\n}\n\n.yl-bubble-foot {\n  display: flex;\n  align-items: center;\n  gap: 2px;\n  padding: 8px 10px;\n  border-top: 1px solid var(--yl-line);\n  background: var(--yl-card);\n}\n\n.yl-action {\n  display: inline-flex;\n  align-items: center;\n  gap: 5px;\n  padding: 6px 8px;\n  border-radius: 7px;\n  color: var(--yl-muted);\n  font-size: 11.5px;\n  transition: background 120ms ease, color 120ms ease;\n}\n\n.yl-action:hover {\n  background: var(--yl-paper);\n  color: var(--yl-ink);\n}\n\n.yl-action.is-done {\n  color: var(--yl-ink);\n}\n\n.yl-foot-spacer {\n  flex: 1;\n}\n\n.yl-watermark {\n  padding-right: 3px;\n  color: var(--yl-faint);\n  font-size: 10px;\n  letter-spacing: 0.04em;\n}\n\n.yl-toast {\n  position: fixed;\n  left: 50%;\n  bottom: 26px;\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  max-width: min(460px, calc(100vw - 32px));\n  padding: 11px 14px;\n  border-radius: 9px;\n  background: var(--yl-char);\n  color: var(--yl-paper);\n  font-size: 12.5px;\n  line-height: 1.45;\n  pointer-events: none;\n  opacity: 0;\n  transform: translate(-50%, 8px);\n  transition: opacity 160ms ease, transform 160ms ease;\n}\n\n.yl-toast.is-visible {\n  opacity: 1;\n  transform: translate(-50%, 0);\n}\n\n.yl-toast.is-error {\n  background: #6e1d16;\n}\n\n.yl-toast-action {\n  flex: none;\n  padding: 4px 8px;\n  border: 1px solid rgba(247, 244, 236, 0.3);\n  border-radius: 5px;\n  background: transparent;\n  color: var(--yl-paper);\n  font-size: 11.5px;\n  font-weight: 600;\n  pointer-events: auto;\n}\n\n.yl-toast-action:hover {\n  border-color: var(--yl-paper);\n}\n\n.yl-progress {\n  position: fixed;\n  right: 20px;\n  bottom: 20px;\n  width: min(292px, calc(100vw - 32px));\n  padding: 12px 13px 11px;\n  border-radius: 12px;\n  background: var(--yl-char);\n  color: var(--yl-paper);\n  pointer-events: auto;\n  opacity: 0;\n  transform: translateY(6px);\n  transition: opacity 150ms ease, transform 150ms ease;\n}\n\n.yl-progress.is-visible {\n  opacity: 1;\n  transform: translateY(0);\n}\n\n.yl-progress-row {\n  display: flex;\n  align-items: center;\n  gap: 9px;\n}\n\n.yl-progress-mark {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  width: 23px;\n  height: 23px;\n  border-radius: 6px;\n  background: var(--yl-lime);\n  color: #111111;\n  font-size: 12px;\n  font-weight: 700;\n}\n\n.yl-progress-label {\n  flex: 1;\n  overflow: hidden;\n  color: var(--yl-paper);\n  font-size: 11.5px;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.yl-progress-count {\n  color: var(--yl-mist);\n  font-size: 10.5px;\n  font-variant-numeric: tabular-nums;\n}\n\n.yl-cancel {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  width: 22px;\n  height: 22px;\n  border-radius: 5px;\n  color: var(--yl-mist);\n}\n\n.yl-cancel:hover {\n  background: rgba(247, 244, 236, 0.08);\n  color: var(--yl-paper);\n}\n\n.yl-progress-track {\n  height: 3px;\n  margin-top: 9px;\n  overflow: hidden;\n  border-radius: 999px;\n  background: rgba(247, 244, 236, 0.16);\n}\n\n.yl-progress-fill {\n  width: 0%;\n  height: 100%;\n  border-radius: inherit;\n  background: var(--yl-paper);\n  transition: width 300ms ease;\n}\n\n.yl-spin {\n  width: 13px;\n  height: 13px;\n  border: 1.5px solid var(--yl-line);\n  border-top-color: var(--yl-ink);\n  border-radius: 50%;\n  animation: yl-rotate 0.8s linear infinite;\n}\n\n@keyframes yl-rotate {\n  to {\n    transform: rotate(360deg);\n  }\n}\n\n/* Author display rules would otherwise override the hidden attribute. */\n.yl-layer [hidden] {\n  display: none !important;\n}\n\n@media (prefers-color-scheme: dark) {\n  :host {\n    --yl-ink: #f7f4ec;\n    --yl-card: #333330;\n    --yl-line: #45453f;\n    --yl-line-strong: #55554d;\n    --yl-muted: #bdb8ae;\n    --yl-faint: #918d84;\n    --yl-shadow: 0 10px 30px rgba(0, 0, 0, 0.28);\n  }\n\n  .yl-bubble-head,\n  .yl-bubble-foot {\n    background: var(--yl-card);\n  }\n\n  .yl-source {\n    background: #2c2c29;\n  }\n\n  .yl-icon-btn:hover,\n  .yl-action:hover {\n    background: #3a3a36;\n  }\n\n  .yl-bubble-title strong,\n  .yl-result,\n  .yl-action.is-done,\n  .yl-error {\n    color: var(--yl-paper);\n  }\n\n  .yl-error-action {\n    border-color: var(--yl-line);\n    background: var(--yl-card);\n    color: var(--yl-paper);\n  }\n\n  .yl-spin {\n    border-color: var(--yl-line);\n    border-top-color: var(--yl-paper);\n  }\n\n  .yl-trigger,\n  .yl-trigger::after {\n    background: var(--yl-char);\n  }\n\n  .yl-trigger {\n    color: var(--yl-lime);\n  }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .yl-trigger,\n  .yl-bubble,\n  .yl-toast,\n  .yl-progress,\n  .yl-progress-fill {\n    transition: none;\n  }\n\n  .yl-dots i,\n  .yl-spin {\n    animation: none;\n  }\n}\n';

  // src/content/overlay.js
  var ICON = {
    close: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15"/></svg>',
    copy: '<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="7" y="7" width="9" height="9" rx="2"/><path d="M5 12H4.5A1.5 1.5 0 013 10.5v-6A1.5 1.5 0 014.5 3h6A1.5 1.5 0 0112 4.5V5"/></svg>',
    speak: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 8v4h3l4 3V5L7 8H4z"/><path d="M14 7.5a4 4 0 010 5M16.5 5a7 7 0 010 10"/></svg>',
    retry: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M16 10a6 6 0 11-1.8-4.3"/><path d="M16 4v4h-4"/></svg>',
    closeSmall: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M6 6l8 8M14 6l-8 8"/></svg>'
  };
  function clamp2(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.cssText = "position:fixed;left:-9999px;top:0;opacity:0";
      document.body.appendChild(area);
      area.select();
      let ok = false;
      try {
        ok = document.execCommand("copy");
      } catch {
        ok = false;
      }
      area.remove();
      return ok;
    }
  }
  var OverlayUI = class {
    constructor() {
      this.host = document.createElement("div");
      this.host.id = "yiliu-overlay-host";
      this.host.setAttribute("data-yiliu-extension", "");
      this.host.style.cssText = "all:initial;position:fixed;inset:0;z-index:2147483647;pointer-events:none;";
      (document.documentElement || document.body).appendChild(this.host);
      this.shadow = this.host.attachShadow({ mode: "open" });
      const style = document.createElement("style");
      style.textContent = overlay_default;
      this.shadow.appendChild(style);
      this.layer = document.createElement("div");
      this.layer.className = "yl-layer";
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
      this.trigger = this.shadow.querySelector(".yl-trigger");
      this.bubble = this.shadow.querySelector(".yl-bubble");
      this.source = this.shadow.querySelector('[data-role="source"]');
      this.result = this.shadow.querySelector('[data-role="result"]');
      this.copyButton = this.shadow.querySelector('[data-act="copy"]');
      this.speakButton = this.shadow.querySelector('[data-act="speak"]');
      this.retryButton = this.shadow.querySelector('[data-act="retry"]');
      this.progress = this.shadow.querySelector(".yl-progress");
      this.toast = this.shadow.querySelector(".yl-toast");
      this.currentText = "";
      this.currentTranslation = "";
      this.currentLang = "";
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
      this.trigger.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        event.stopPropagation();
      });
      this.trigger.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.onTrigger?.();
      });
      this.trigger.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          this.onTrigger?.();
        }
      });
      this.shadow.querySelector('[data-act="close"]').addEventListener("click", () => this.hideBubble());
      this.shadow.querySelector('[data-act="cancel"]').addEventListener("click", () => this.onCancel?.());
      this.copyButton.addEventListener("click", () => this.copyTranslation());
      this.speakButton.addEventListener("click", () => this.speakTranslation());
      this.retryButton.addEventListener("click", () => this.onRetry?.());
      this.bubble.addEventListener("pointerdown", (event) => event.stopPropagation());
      this.bubble.addEventListener("click", (event) => event.stopPropagation());
      this.progress.addEventListener("pointerdown", (event) => event.stopPropagation());
      this.progress.addEventListener("click", (event) => event.stopPropagation());
      this.shadow.addEventListener("keydown", (event) => {
        if (event.key === "Escape") this.hideBubble();
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
      const left = clamp2(rect.right - width / 2, 10, (window.innerWidth || 1024) - width - 10);
      this.trigger.style.left = `${left}px`;
      this.trigger.style.top = `${top}px`;
      this.trigger.classList.toggle("is-below", below);
      this.trigger.hidden = false;
      this.trigger.setAttribute("aria-hidden", "false");
      this.trigger.classList.add("is-visible");
    }
    hideTrigger() {
      this.trigger.classList.remove("is-visible");
      this.trigger.setAttribute("aria-hidden", "true");
      clearTimeout(this.triggerHideTimer);
      this.triggerHideTimer = setTimeout(() => {
        if (!this.trigger.classList.contains("is-visible")) this.trigger.hidden = true;
      }, 150);
    }
    showBubble({ rect, source = "", loading = true } = {}) {
      this.anchorRect = rect || {
        left: (window.innerWidth || 1024) - 430,
        right: (window.innerWidth || 1024) - 30,
        top: 70,
        bottom: 70
      };
      this.currentText = source;
      this.currentTranslation = "";
      this.source.textContent = source;
      this.copyButton.querySelector("span").textContent = "复制";
      this.copyButton.classList.remove("is-done");
      this.retryButton.hidden = true;
      this.bubble.classList.remove("is-visible");
      this.bubble.setAttribute("aria-hidden", "false");
      this.positionBubble(this.anchorRect);
      this.bubble.classList.add("is-visible");
      if (loading) this.setBubbleLoading();
    }
    positionBubble(rect) {
      const margin = 12;
      const width = Math.min(396, (window.innerWidth || 1024) - margin * 2);
      const height = this.bubble.getBoundingClientRect().height || 260;
      const viewportWidth = window.innerWidth || 1024;
      const viewportHeight = window.innerHeight || 768;
      const left = clamp2(rect.left, margin, viewportWidth - width - margin);
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
    setBubbleLoading(message = "正在翻译…") {
      this.result.innerHTML = `<div class="yl-loading"><span class="yl-spin"></span><span>${message}</span></div>`;
      this.retryButton.hidden = true;
      this.positionBubble(this.anchorRect);
    }
    setBubbleText(text, lang = "") {
      this.currentTranslation = text;
      this.currentLang = lang;
      this.result.textContent = text;
      this.speakButton.hidden = !("speechSynthesis" in window) || !text;
      this.retryButton.hidden = true;
      this.positionBubble(this.anchorRect);
    }
    setBubbleError(payload = {}) {
      this.currentTranslation = "";
      const message = payload.message || "翻译失败，请稍后重试";
      const needsSettings = payload.code === "NO_API_KEY" || payload.code === "AUTH" || payload.code === "CONFIG";
      this.result.innerHTML = "";
      const box = document.createElement("div");
      box.className = "yl-error";
      const paragraph = document.createElement("p");
      paragraph.textContent = message;
      box.appendChild(paragraph);
      if (needsSettings) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "yl-error-action";
        button.textContent = "打开译流设置";
        button.addEventListener("click", () => this.onSettings?.());
        box.appendChild(button);
      }
      this.result.appendChild(box);
      this.retryButton.hidden = false;
      this.positionBubble(this.anchorRect);
    }
    hideBubble() {
      this.bubble.classList.remove("is-visible");
      this.bubble.setAttribute("aria-hidden", "true");
      this.onClose?.();
    }
    async copyTranslation() {
      if (!this.currentTranslation) return;
      const ok = await copyText(this.currentTranslation);
      const span = this.copyButton.querySelector("span");
      span.textContent = ok ? "已复制" : "复制失败";
      this.copyButton.classList.toggle("is-done", ok);
      setTimeout(() => {
        span.textContent = "复制";
        this.copyButton.classList.remove("is-done");
      }, 1500);
    }
    speakTranslation() {
      if (!this.currentTranslation || !("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(this.currentTranslation);
      if (this.currentLang) utterance.lang = this.currentLang;
      utterance.rate = 0.98;
      const voices = window.speechSynthesis.getVoices();
      const match = this.currentLang ? voices.find((voice) => voice.lang?.toLowerCase().startsWith(this.currentLang.toLowerCase())) : null;
      if (match) utterance.voice = match;
      window.speechSynthesis.speak(utterance);
    }
    showProgress({ total = 0, label = "正在翻译此页…" } = {}) {
      clearTimeout(this.progressHideTimer);
      this.progressTotal = total;
      this.progressDone = 0;
      this.progressLabel = label;
      this.shadow.querySelector(".yl-progress-label").textContent = label;
      this.shadow.querySelector(".yl-progress-count").textContent = `0 / ${total}`;
      this.shadow.querySelector(".yl-progress-fill").style.width = "0%";
      this.progress.classList.add("is-visible");
      this.progress.setAttribute("aria-hidden", "false");
    }
    updateProgress({ done, total, label, errors = 0 } = {}) {
      if (Number.isFinite(total)) this.progressTotal = total;
      if (Number.isFinite(done)) this.progressDone = done;
      const totalValue = this.progressTotal || 0;
      const doneValue = this.progressDone || 0;
      const percent = totalValue ? Math.min(100, Math.round(doneValue / totalValue * 100)) : 0;
      if (label) {
        this.progressLabel = label;
        this.shadow.querySelector(".yl-progress-label").textContent = label;
      }
      this.shadow.querySelector(".yl-progress-count").textContent = `${doneValue} / ${totalValue}${errors ? ` · ${errors} 失败` : ""}`;
      this.shadow.querySelector(".yl-progress-fill").style.width = `${percent}%`;
    }
    hideProgress(delay = 0) {
      clearTimeout(this.progressHideTimer);
      const hide = () => {
        this.progress.classList.remove("is-visible");
        this.progress.setAttribute("aria-hidden", "true");
      };
      if (delay) this.progressHideTimer = setTimeout(hide, delay);
      else hide();
    }
    setProgressVisible(visible) {
      if (visible) this.progress.classList.add("is-visible");
      else this.hideProgress();
    }
    toast(message, { type = "info", duration = 3600, action = null } = {}) {
      clearTimeout(this.toastTimer);
      this.toast.className = `yl-toast${type === "error" ? " is-error" : ""}`;
      this.toast.innerHTML = "";
      const text = document.createElement("span");
      text.textContent = message;
      this.toast.appendChild(text);
      if (action?.label) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "yl-toast-action";
        button.textContent = action.label;
        button.addEventListener("click", () => {
          action.onClick?.();
          this.hideToast();
        });
        this.toast.appendChild(button);
        this.toast.style.pointerEvents = "auto";
      } else {
        this.toast.style.pointerEvents = "none";
      }
      this.toast.classList.add("is-visible");
      this.toastTimer = setTimeout(() => this.hideToast(), duration);
    }
    hideToast() {
      this.toast.classList.remove("is-visible");
      clearTimeout(this.toastTimer);
    }
    destroy() {
      this.host.remove();
    }
  };

  // src/content/dom.js
  var BLOCK_TAGS = /* @__PURE__ */ new Set([
    "P",
    "LI",
    "H1",
    "H2",
    "H3",
    "H4",
    "H5",
    "H6",
    "BLOCKQUOTE",
    "FIGCAPTION",
    "DT",
    "DD",
    "TD",
    "TH",
    "CAPTION",
    "SUMMARY",
    "DIV",
    "SECTION",
    "ARTICLE",
    "MAIN",
    "ASIDE",
    "HEADER",
    "FOOTER",
    "FIGURE",
    "ADDRESS"
  ]);
  var TOKEN_TAGS = /* @__PURE__ */ new Set([
    "A",
    "STRONG",
    "B",
    "EM",
    "I",
    "U",
    "S",
    "DEL",
    "INS",
    "MARK",
    "CODE",
    "KBD",
    "SAMP",
    "VAR",
    "SUP",
    "SUB",
    "ABBR",
    "CITE",
    "Q",
    "SMALL",
    "TIME"
  ]);
  var SKIP_TAGS = /* @__PURE__ */ new Set([
    "SCRIPT",
    "STYLE",
    "NOSCRIPT",
    "TEMPLATE",
    "HEAD",
    "META",
    "LINK",
    "TITLE",
    "TEXTAREA",
    "INPUT",
    "SELECT",
    "OPTION",
    "OPTGROUP",
    "BUTTON",
    "PRE",
    "SVG",
    "MATH",
    "CANVAS",
    "VIDEO",
    "AUDIO",
    "IFRAME",
    "OBJECT",
    "EMBED",
    "IMG",
    "PICTURE",
    "SOURCE",
    "TRACK",
    "MAP",
    "AREA"
  ]);
  var SKIP_SELECTOR = [
    '[translate="no"]',
    ".notranslate",
    '[contenteditable="true"]',
    '[contenteditable=""]',
    '[aria-hidden="true"]',
    "[data-yiliu-block]",
    "[data-yiliu-translation]",
    "[data-yiliu-skip]",
    '[role="button"]',
    '[role="tab"]',
    '[role="menuitem"]',
    '[role="tooltip"]'
  ].join(",");
  function isElement(node) {
    return node && node.nodeType === 1;
  }
  function isText(node) {
    return node && node.nodeType === 3;
  }
  function isSkippedElement(element) {
    if (!isElement(element)) return true;
    if (SKIP_TAGS.has(element.tagName)) return true;
    if (element.isContentEditable) return true;
    try {
      if (element.matches(SKIP_SELECTOR)) return true;
      if (element.closest('[translate="no"], .notranslate, [contenteditable="true"]')) return true;
    } catch {
    }
    return false;
  }
  function isVisible(element, windowObject = globalThis.window) {
    if (!isElement(element) || !element.isConnected) return false;
    if (element.hasAttribute?.("hidden")) return false;
    const inlineStyle = element.getAttribute?.("style") || "";
    if (/display\s*:\s*none|visibility\s*:\s*(?:hidden|collapse)/i.test(inlineStyle)) return false;
    const view = windowObject || element.ownerDocument?.defaultView;
    if (!view) return true;
    try {
      const style = view.getComputedStyle(element);
      if (!style) return true;
      if (style.display === "none" || style.visibility === "hidden" || style.visibility === "collapse") {
        return false;
      }
      if (Number.parseFloat(style.opacity) === 0) return false;
      if (typeof element.checkVisibility === "function") {
        return element.checkVisibility({
          checkOpacity: true,
          checkVisibilityCSS: true
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
    if (element.tagName === "A") {
      read("href");
      read("title");
      read("target");
      read("rel");
    } else if (element.tagName === "ABBR" || element.tagName === "TIME") {
      read("title");
      read("datetime");
    } else if (element.tagName === "Q") {
      read("cite");
    }
    return attrs;
  }
  function serializeBlock(element) {
    const tokens = /* @__PURE__ */ new Map();
    let tokenId = 0;
    let out = "";
    const appendText = (text2) => {
      if (!text2) return;
      out += String(text2).replace(/\u00a0/g, " ").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, " ");
    };
    const walk = (node) => {
      if (isText(node)) {
        appendText(node.nodeValue);
        return;
      }
      if (!isElement(node)) return;
      if (SKIP_TAGS.has(node.tagName)) return;
      if (isSkippedElement(node)) return;
      if (node.tagName === "BR") {
        appendText("\n");
        return;
      }
      if (TOKEN_TAGS.has(node.tagName) && !isSkippedElement(node)) {
        const inner = node.textContent?.trim() || "";
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
    const text = out.replace(/\u00a0/g, " ").replace(/[\t\f\v ]+/g, " ").replace(/ *\n */g, "\n").replace(/\n{3,}/g, "\n\n").trim();
    return { text, tokens };
  }
  function stripTokens(text) {
    return String(text || "").replace(/<\/?x\d+>/g, "");
  }
  function isMostlyUrl(text) {
    return /^(?:https?:\/\/|www\.)\S+$/i.test(text);
  }
  function isTranslatableText(text) {
    const plain = stripTokens(text);
    if (!plain || plain.trim().length < 2) return false;
    if (isMostlyUrl(plain)) return false;
    if (!/[\p{L}\p{N}]/u.test(plain)) return false;
    if (!/[\p{L}]/u.test(plain) && plain.replace(/\d/g, "").trim().length < 3) return false;
    return true;
  }
  function elementHasFormControls(element) {
    return Boolean(element.querySelector("input, textarea, select, button"));
  }
  function shouldTranslateElement(element, block, view) {
    if (isSkippedElement(element)) return false;
    if (!block || !isTranslatableText(block.text)) return false;
    if (!isVisible(element, view)) return false;
    if (elementHasFormControls(element) && stripTokens(block.text).length < 80) return false;
    return true;
  }
  function collectBlocks(root, options = {}) {
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
      if (tag === "BODY" || tag === "HTML") {
        for (const child of element.children) visit(child);
        return;
      }
      const isCandidate = BLOCK_TAGS.has(tag) || tag.includes("-") && !SKIP_TAGS.has(tag);
      if (isCandidate) {
        if (containsBlockDescendant(element, view)) {
          for (const child of element.children) visit(child);
          return;
        }
        const serialized = serializeBlock(element);
        if (serialized.text.length > maxChars) return;
        if (!shouldTranslateElement(element, serialized, view)) return;
        blocks.push({
          id: uid("b"),
          element,
          text: serialized.text,
          tokens: serialized.tokens
        });
        return;
      }
      for (const child of element.children) visit(child);
    };
    if (root) visit(root);
    return blocks;
  }
  function safeHref(value) {
    const href = String(value || "").trim();
    if (!href) return "";
    if (/^(?:#|\/(?!\/)|\.{1,2}\/|\?)/.test(href)) return href;
    try {
      const url = new URL(href, "https://yiliu.invalid/");
      if (url.protocol === "http:" || url.protocol === "https:") return href;
      if (url.protocol === "mailto:" || url.protocol === "tel:") return href;
    } catch {
      return "";
    }
    return "";
  }
  function openTag(token) {
    if (!token) return "";
    const tag = token.tag;
    const attrs = token.attrs || {};
    if (tag === "a") {
      const href = safeHref(attrs.href);
      const pieces = ['<a class="yiliu-inline-link"'];
      if (href) pieces.push(` href="${escapeAttribute(href)}"`);
      if (attrs.title) pieces.push(` title="${escapeAttribute(attrs.title)}"`);
      if (attrs.target === "_blank" || attrs.target === "_self") {
        pieces.push(` target="${attrs.target}"`);
      }
      if (attrs.target === "_blank") pieces.push(' rel="noopener noreferrer"');
      pieces.push(">");
      return pieces.join("");
    }
    if (tag === "abbr" || tag === "time") {
      return `<${tag}${attrs.title ? ` title="${escapeAttribute(attrs.title)}"` : ""}${attrs.datetime ? ` datetime="${escapeAttribute(attrs.datetime)}"` : ""}>`;
    }
    if (tag === "q" && attrs.cite) {
      return `<q cite="${escapeAttribute(safeHref(attrs.cite))}">`;
    }
    return `<${tag}>`;
  }
  function fallbackPlain(raw) {
    return escapeHtml(String(raw || "").replace(/<\/?x\d+>/gi, "")).replace(/\n/g, "<br>");
  }
  function renderTranslation(raw, tokens) {
    let text = String(raw || "").trim();
    if (!text) return "";
    text = text.replace(/^```[a-zA-Z0-9_-]*\s*\n?/, "").replace(/\n?```\s*$/, "").trim();
    text = text.replace(/&lt;(\/?)x(\d+)&gt;/gi, "<$1x$2>");
    const hasMarkers = /<\/?x\d+>/i.test(text);
    if (!hasMarkers || !tokens || !tokens.size) return fallbackPlain(text);
    const pattern = /<(\/?)x(\d+)>/gi;
    let cursor = 0;
    let output = "";
    const stack = [];
    let match;
    let valid = true;
    while (match = pattern.exec(text)) {
      const before = text.slice(cursor, match.index);
      if (before) output += fallbackPlain(before);
      cursor = pattern.lastIndex;
      const closing = Boolean(match[1]);
      const id = Number(match[2]);
      const token = tokens.get(id);
      if (!token) {
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
  var INNER_TRANSLATION_TAGS = /* @__PURE__ */ new Set(["TD", "TH", "LI", "DT", "DD", "SUMMARY", "CAPTION"]);
  function insertionParent(block) {
    return INNER_TRANSLATION_TAGS.has(block.tagName) ? block : null;
  }
  function wrapOriginalContent(block) {
    if (block._yiliuOriginalSpan?.isConnected) return;
    const existing = block.querySelector(":scope > [data-yiliu-original]");
    if (existing) {
      block._yiliuOriginalSpan = existing;
      block.classList.add("yiliu-inner");
      return;
    }
    const doc = block.ownerDocument;
    const span = doc.createElement("span");
    span.className = "yiliu-original";
    span.setAttribute("data-yiliu-original", "");
    while (block.firstChild) span.appendChild(block.firstChild);
    block.appendChild(span);
    block._yiliuOriginalSpan = span;
    block.classList.add("yiliu-inner");
  }
  function insertTranslation(block, html, { lang, id }) {
    const doc = block.ownerDocument;
    if (block._yiliuTranslationNode?.isConnected) {
      block._yiliuTranslationNode.remove();
    }
    for (const stale of block.querySelectorAll(":scope > [data-yiliu-translation]")) stale.remove();
    const parent = insertionParent(block);
    if (parent) wrapOriginalContent(block);
    const node = doc.createElement("div");
    node.className = "yiliu-translation";
    node.setAttribute("data-yiliu-translation", "");
    node.setAttribute("data-yiliu-for", id);
    node.setAttribute("lang", lang || "");
    node.setAttribute("dir", "auto");
    node.innerHTML = html;
    if (parent) {
      if (block.tagName === "LI") {
        const nested = [...block.children].find(
          (child) => child !== node && BLOCK_TAGS.has(child.tagName) && child.tagName !== "P"
        );
        if (nested) block.insertBefore(node, nested);
        else block.appendChild(node);
      } else {
        block.appendChild(node);
      }
    } else {
      block.insertAdjacentElement("afterend", node);
    }
    block.setAttribute("data-yiliu-block", id);
    block.setAttribute("data-yiliu-state", "done");
    block._yiliuTranslationNode = node;
    return node;
  }
  function markBlockState(block, state) {
    if (!block) return;
    block.setAttribute("data-yiliu-state", state);
  }
  function restoreTranslations(root = document) {
    root.querySelectorAll?.("[data-yiliu-original]").forEach((wrapper) => {
      const parent = wrapper.parentElement;
      if (!parent) return;
      while (wrapper.firstChild) parent.insertBefore(wrapper.firstChild, wrapper);
      wrapper.remove();
    });
    root.querySelectorAll?.("[data-yiliu-translation]").forEach((node) => node.remove());
    root.querySelectorAll?.("[data-yiliu-block]").forEach((element) => {
      element.removeAttribute("data-yiliu-block");
      element.removeAttribute("data-yiliu-state");
      element.classList.remove("yiliu-inner");
      delete element._yiliuTranslationNode;
      delete element._yiliuOriginalSpan;
    });
    const html = root.documentElement || document.documentElement;
    html?.classList.remove(
      "yiliu-mode-bilingual",
      "yiliu-mode-replace",
      "yiliu-page-translated",
      "yiliu-dark-page"
    );
  }
  function parseRgb(value) {
    const match = String(value || "").match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?/i);
    if (!match) return null;
    return {
      r: Number(match[1]),
      g: Number(match[2]),
      b: Number(match[3]),
      a: match[4] === void 0 ? 1 : Number(match[4])
    };
  }
  function pageBackgroundIsDark(doc = globalThis.document) {
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
        const textColor = parseRgb(style.color);
        if (textColor && textColor.a >= 0.1) {
          const luminance = (0.2126 * textColor.r + 0.7152 * textColor.g + 0.0722 * textColor.b) / 255;
          if (luminance > 0.68) return true;
          if (luminance < 0.38) return false;
        }
      }
    } catch {
    }
    return false;
  }
  function applyPageStyle(settings2) {
    const root = document.documentElement;
    if (!root) return;
    root.style.setProperty("--yiliu-font-size", `${settings2.ui.fontSize}px`);
    root.style.setProperty("--yiliu-translation-color", settings2.ui.color);
    root.classList.toggle("yiliu-dark-page", pageBackgroundIsDark(document));
    root.setAttribute("data-yiliu-display", settings2.ui.displayStyle);
    root.classList.remove("yiliu-mode-bilingual", "yiliu-mode-replace");
    root.classList.add(`yiliu-mode-${settings2.mode}`);
  }
  function pageLooksLikeTarget(targetLang, doc = globalThis.document) {
    const declared = (doc?.documentElement?.getAttribute("lang") || doc?.querySelector('meta[http-equiv="content-language" i]')?.getAttribute("content") || "").trim().toLowerCase();
    if (!declared) return false;
    const target = String(targetLang || "").toLowerCase();
    if (!target) return false;
    const declaredPrimary = declared.split("-")[0];
    const targetPrimary = target.split("-")[0];
    if (declaredPrimary !== targetPrimary) return false;
    if (declaredPrimary === "zh") {
      const wantsTraditional = target.includes("tw") || target.includes("hant");
      const looksTraditional = declared.includes("tw") || declared.includes("hk") || declared.includes("hant");
      return wantsTraditional === looksTraditional;
    }
    return true;
  }
  function selectionContext(selection2) {
    if (!selection2 || selection2.rangeCount === 0) return { before: "", after: "" };
    const range = selection2.getRangeAt(0);
    const container = range.startContainer.nodeType === 3 ? range.startContainer.parentElement : range.startContainer;
    if (!container) return { before: "", after: "" };
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
        after: afterRange.toString().slice(0, 300)
      };
    } catch {
      return { before: "", after: "" };
    }
  }
  function elementFromSelection(selection2) {
    if (!selection2 || selection2.rangeCount === 0) return null;
    const node = selection2.getRangeAt(0).startContainer;
    return node.nodeType === 1 ? node : node.parentElement;
  }

  // src/content/batch.js
  function makeBatches(blocks, { maxItems = 10, maxChars = 6e3 } = {}) {
    const batches = [];
    let current = [];
    let currentChars = 0;
    const flush = () => {
      if (current.length) batches.push(current);
      current = [];
      currentChars = 0;
    };
    for (const block of blocks) {
      const length = block.text?.length || 0;
      if (current.length && (current.length >= maxItems || currentChars + length > maxChars)) {
        flush();
      }
      current.push(block);
      currentChars += length;
      if (current.length >= maxItems) flush();
    }
    flush();
    return batches;
  }
  function isInViewport(element, ratio = 1.4) {
    try {
      const rect = element.getBoundingClientRect();
      const height = window.innerHeight || 800;
      return rect.bottom > -height * 0.3 && rect.top < height * ratio;
    } catch {
      return false;
    }
  }
  function prioritizeBlocks(blocks) {
    const visible = [];
    const rest = [];
    for (const block of blocks) {
      (isInViewport(block.element) ? visible : rest).push(block);
    }
    return [...visible, ...rest];
  }

  // src/content/page.js
  var PageTranslator = class {
    /**
     * @param {import('./overlay.js').OverlayUI} overlay
     * @param {{
     *   getSettings: () => any,
     *   requestBatch: (items: Array<{id: string, text: string}>, context: any) => Promise<any>,
     *   report: (state: string) => void,
     *   openOptions: () => void,
     * }} deps
     */
    constructor(overlay2, deps) {
      this.overlay = overlay2;
      this.deps = deps;
      this.settings = deps.getSettings();
      this.active = false;
      this.cancelled = false;
      this.fatal = false;
      this.done = 0;
      this.total = 0;
      this.errorCount = 0;
      this.failedBlocks = /* @__PURE__ */ new Map();
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
      return Boolean(document.querySelector("[data-yiliu-translation]"));
    }
    status() {
      return {
        active: this.active,
        translated: this.done,
        total: this.total,
        errors: this.errorCount,
        hasTranslation: this.hasTranslations(),
        mode: this.settings?.mode || "bilingual",
        targetLang: this.settings?.targetLang || "zh-CN",
        excluded: this.isExcluded()
      };
    }
    async start({ force = false, auto = false } = {}) {
      if (this.active) {
        this.overlay.toast("正在翻译此页，请稍候…");
        return;
      }
      this.settings = this.deps.getSettings();
      if (this.isExcluded()) {
        this.overlay.toast("当前站点在译流的排除列表中，可在设置中移除", {
          type: "error",
          duration: 6e3,
          action: { label: "打开设置", onClick: () => this.deps.openOptions() }
        });
        return;
      }
      if (auto && this.settings.skipTargetLanguagePages && pageLooksLikeTarget(this.settings.targetLang)) {
        return;
      }
      if (this.hasTranslations()) restoreTranslations(document);
      applyPageStyle(this.settings);
      const allBlocks = collectBlocks(document.body, {
        limit: LIMITS.maxPageBlocks,
        maxChars: LIMITS.maxBlockChars
      });
      if (!allBlocks.length) {
        this.overlay.toast("未找到可翻译的正文内容");
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
      this.deps.report("translating");
      this.overlay.showProgress({ total: this.total, label: "正在翻译此页…" });
      try {
        await this.translateBlocks(blocks, { refresh: false });
      } finally {
        this.active = false;
        this.overlay.hideProgress(900);
        if (!this.cancelled) {
          this.overlay.hideProgress(900);
          if (this.done > 0) {
            document.documentElement.classList.add("yiliu-page-translated");
            this.deps.report("done");
            const suffix = this.errorCount ? `，${this.errorCount} 段未完成` : "";
            this.overlay.toast(`已翻译 ${this.done} 段${suffix}`, {
              duration: 2600,
              action: this.errorCount ? { label: "重试失败段落", onClick: () => this.retryFailed() } : null
            });
            this.startObserver();
          } else if (!this.fatal) {
            this.deps.report("error");
            this.overlay.toast("没有成功翻译的内容，请检查 API 设置", {
              type: "error",
              action: { label: "打开设置", onClick: () => this.deps.openOptions() }
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
        maxChars: LIMITS.maxBatchChars
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
        }
      );
      await Promise.all(workers);
    }
    async runBatch(blocks, { refresh = false } = {}) {
      if (this.cancelled) return;
      for (const block of blocks) markBlockState(block.element, "loading");
      const items = blocks.map((block) => ({ id: block.id, text: block.text }));
      let response;
      try {
        response = await this.deps.requestBatch(items, {
          url: location.href,
          title: document.title
        });
      } catch (error) {
        this.handleFatal({
          message: error?.message || "无法连接译流后台，请刷新页面后重试",
          code: "BACKGROUND"
        });
        return;
      }
      if (this.cancelled) return;
      if (!response?.ok) {
        this.handleFatal(response?.error || { message: "翻译失败，请稍后重试" });
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
                id: block.id
              });
              this.done += 1;
              this.everTranslated = true;
              this.failedBlocks.delete(block.id);
              this.overlay.updateProgress({
                done: this.done,
                total: this.total,
                errors: this.errorCount
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
        errors: this.errorCount
      });
      if (this.errorCount > 0) this.deps.report("error");
    }
    markFailed(block) {
      markBlockState(block.element, "error");
      this.failedBlocks.set(block.id, block);
    }
    handleFatal(error) {
      if (this.fatal && this.cancelled) return;
      this.fatal = true;
      this.cancelled = true;
      this.active = false;
      this.deps.report("error");
      this.overlay.hideProgress(0);
      const needsSettings = error?.code === "NO_API_KEY" || error?.code === "AUTH" || error?.code === "CONFIG";
      this.overlay.toast(error?.message || "翻译失败，请稍后重试", {
        type: "error",
        duration: 6500,
        action: needsSettings ? { label: "打开设置", onClick: () => this.deps.openOptions() } : null
      });
    }
    cancel() {
      if (!this.active) return;
      this.cancelled = true;
      this.active = false;
      this.overlay.hideProgress(0);
      this.overlay.toast("已停止翻译，已完成的段落会保留");
      this.deps.report(this.hasTranslations() ? "done" : "restored");
    }
    async retryFailed() {
      if (this.active) return;
      const blocks = [...this.failedBlocks.values()].filter((block) => block.element?.isConnected);
      if (!blocks.length) {
        this.overlay.toast("没有需要重试的段落");
        return;
      }
      this.active = true;
      this.cancelled = false;
      this.fatal = false;
      this.total = this.done + blocks.length;
      this.overlay.showProgress({ total: this.total, label: "正在重试未完成的段落…" });
      this.overlay.updateProgress({ done: this.done, total: this.total });
      try {
        await this.translateBlocks(blocks, { refresh: true });
      } finally {
        this.active = false;
        this.overlay.hideProgress(700);
        if (!this.cancelled) {
          this.deps.report(this.done ? "done" : "error");
          this.overlay.toast(
            this.failedBlocks.size ? `仍有 ${this.failedBlocks.size} 段未完成` : "未完成的段落已全部补译",
            { type: this.failedBlocks.size ? "error" : "info" }
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
      this.overlay.toast("已恢复原文");
      this.done = 0;
      this.total = 0;
      this.errorCount = 0;
      this.failedBlocks.clear();
      this.deps.report("restored");
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
          { duration: 4200 }
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
              if (node.matches?.(".yiliu-translation, #yiliu-overlay-host")) continue;
              if (node.closest?.(".yiliu-translation, #yiliu-overlay-host")) continue;
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
        this.stopObserver();
        return;
      }
      this.refreshRounds += 1;
      const remaining = Math.max(20, LIMITS.maxPageBlocks - this.total);
      const blocks = collectBlocks(document.body, {
        limit: remaining,
        maxChars: LIMITS.maxBlockChars
      });
      if (!blocks.length) return;
      this.refreshing = true;
      this.active = true;
      this.cancelled = false;
      this.total += blocks.length;
      this.overlay.showProgress({
        total: this.total,
        label: "正在翻译新增内容…"
      });
      this.overlay.updateProgress({ done: this.done, total: this.total, errors: this.errorCount });
      try {
        await this.translateBlocks(prioritizeBlocks(blocks), { refresh: true });
      } finally {
        this.refreshing = false;
        this.active = false;
        this.overlay.hideProgress(600);
        this.overlay.updateProgress({ done: this.done, total: this.total, errors: this.errorCount });
        if (this.done) this.deps.report(this.errorCount ? "error" : "done");
      }
    }
  };

  // src/content/selection.js
  function isEditable(element) {
    if (!element) return false;
    if (element.isContentEditable) return true;
    const tag = element.tagName;
    return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
  }
  var SelectionController = class {
    /**
     * @param {import('./overlay.js').OverlayUI} overlay
     * @param {{getSettings: () => any, requestSelection: (text: string, context: any) => Promise<any>, openOptions: () => void}} deps
     */
    constructor(overlay2, deps) {
      this.overlay = overlay2;
      this.deps = deps;
      this.current = null;
      this.loading = false;
      this.lastRect = null;
      this.autoTimer = 0;
      this.started = false;
      this.onPointerUp = this.onPointerUp.bind(this);
      this.onKeyUp = this.onKeyUp.bind(this);
      this.onPointerDown = this.onPointerDown.bind(this);
      this.onSelectionChange = this.onSelectionChange.bind(this);
      this.onEscape = this.onEscape.bind(this);
      this.overlay.onTrigger = () => this.translateCurrent();
      this.overlay.onRetry = () => this.translateCurrent({ retry: true });
      this.overlay.onSettings = () => this.deps.openOptions();
      this.overlay.onClose = () => {
        this.loading = false;
        this.current = null;
      };
    }
    start() {
      if (this.started) return;
      this.started = true;
      document.addEventListener("mouseup", this.onPointerUp, true);
      document.addEventListener("touchend", this.onPointerUp, true);
      document.addEventListener("keyup", this.onKeyUp, true);
      document.addEventListener("pointerdown", this.onPointerDown, true);
      document.addEventListener("selectionchange", this.onSelectionChange);
      document.addEventListener("keydown", this.onEscape, true);
    }
    stop() {
      this.started = false;
      document.removeEventListener("mouseup", this.onPointerUp, true);
      document.removeEventListener("touchend", this.onPointerUp, true);
      document.removeEventListener("keyup", this.onKeyUp, true);
      document.removeEventListener("pointerdown", this.onPointerDown, true);
      document.removeEventListener("selectionchange", this.onSelectionChange);
      document.removeEventListener("keydown", this.onEscape, true);
      clearTimeout(this.autoTimer);
      this.overlay.hideTrigger();
      this.overlay.hideBubble();
    }
    onEscape(event) {
      if (event.key !== "Escape") return;
      this.overlay.hideTrigger();
      this.overlay.hideBubble();
    }
    onSelectionChange() {
      if (this.loading) return;
      const selection2 = window.getSelection();
      if (!selection2 || selection2.isCollapsed || !selection2.toString().trim()) {
        this.overlay.hideTrigger();
      }
    }
    onPointerDown(event) {
      if (event.composedPath?.().includes(this.overlay.host)) return;
      this.overlay.hideTrigger();
      if (this.current && !this.loading) this.overlay.hideBubble();
    }
    onPointerUp(event) {
      if (event.button !== void 0 && event.button !== 0) return;
      if (event.composedPath?.().includes(this.overlay.host)) return;
      if (this.isEventInsideOverlay(event)) return;
      setTimeout(() => this.captureSelection(event), 10);
    }
    onKeyUp(event) {
      if (event.key === "Escape" || event.key === "Shift" || event.key === "Meta" || event.key === "Control") {
        return;
      }
      if (event.target && isEditable(event.target)) return;
      setTimeout(() => this.captureSelection(event, true), 0);
    }
    isEventInsideOverlay(event) {
      return Boolean(event.target?.closest?.("#yiliu-overlay-host"));
    }
    captureSelection(event, fromKeyboard = false) {
      if (!this.deps.getSettings()?.selection?.enabled) return;
      const selection2 = window.getSelection();
      if (!selection2 || selection2.rangeCount === 0 || selection2.isCollapsed) return;
      const text = normalizeSpace(selection2.toString());
      if (!text) return;
      if (text.length > LIMITS.maxSelectionChars) {
        this.overlay.toast(`选中文字过长，最多支持 ${LIMITS.maxSelectionChars} 字符`, {
          type: "error"
        });
        return;
      }
      const element = elementFromSelection(selection2);
      if (isEditable(element)) return;
      if (element?.closest?.("#yiliu-overlay-host, [data-yiliu-translation]")) return;
      const range = selection2.getRangeAt(0);
      let rect = range.getBoundingClientRect();
      if ((!rect || !rect.width && !rect.height) && event) {
        rect = {
          left: event.clientX || 0,
          right: event.clientX || 0,
          top: event.clientY || 0,
          bottom: event.clientY || 0,
          width: 0,
          height: 0
        };
      }
      this.lastRect = rect;
      this.current = {
        text,
        rect,
        context: {
          ...selectionContext(selection2),
          title: document.title
        }
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
      if (this.loading) return;
      if (!this.current?.text) {
        this.captureSelection(null, true);
      }
      if (!this.current?.text) return;
      this.loading = true;
      this.overlay.hideTrigger();
      this.overlay.showBubble({ rect: this.current.rect, source: this.current.text });
      try {
        const response = await this.deps.requestSelection(this.current.text, this.current.context);
        if (!response?.ok) {
          this.loading = false;
          this.overlay.setBubbleError(response?.error || { message: "翻译失败，请重试" });
          return;
        }
        this.loading = false;
        this.overlay.setBubbleText(
          response.translation,
          this.deps.getSettings()?.targetLang || ""
        );
        if (retry) this.overlay.toast("已重新翻译");
      } catch (error) {
        this.loading = false;
        this.overlay.setBubbleError({
          message: error?.message || "翻译失败，请检查网络或 API 设置",
          code: "NETWORK"
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
      const selection2 = window.getSelection();
      let rect = this.lastRect;
      if (selection2 && !selection2.isCollapsed) {
        const rangeRect = selection2.getRangeAt(0).getBoundingClientRect();
        if (rangeRect.width || rangeRect.height) rect = rangeRect;
      }
      if (!rect) {
        rect = {
          left: Math.max(16, (window.innerWidth || 1024) / 2 - 120),
          right: Math.max(16, (window.innerWidth || 1024) / 2 + 120),
          top: Math.max(60, (window.innerHeight || 768) / 3),
          bottom: Math.max(60, (window.innerHeight || 768) / 3)
        };
      }
      this.current = {
        text: cleaned,
        rect,
        context: {
          title: document.title,
          before: "",
          after: ""
        }
      };
      this.translateCurrent();
    }
    getSelectionPreview() {
      const selection2 = window.getSelection();
      if (!selection2 || selection2.isCollapsed) return "";
      return squish(selection2.toString(), 80);
    }
    updateSettings() {
      if (!this.deps.getSettings()?.selection?.enabled) {
        this.overlay.hideTrigger();
        this.overlay.hideBubble();
      }
    }
    targetLabel() {
      return targetLanguageLabel(this.deps.getSettings()?.targetLang);
    }
  };

  // src/content/index.js
  var api = extensionApi();
  var isTopFrame = (() => {
    try {
      return window.top === window;
    } catch {
      return false;
    }
  })();
  var settings = mergeSettings({});
  var overlay = null;
  var selection = null;
  var page = null;
  var initialized = false;
  var resolveReady;
  var ready = new Promise((resolve) => {
    resolveReady = resolve;
  });
  function send(message) {
    return sendRuntimeMessage(message);
  }
  function report(state) {
    send({ type: "page.report", state }).catch(() => {
    });
  }
  function openOptions() {
    send({ type: "options.open" }).catch(() => {
    });
  }
  function normalizePublicSettings(raw) {
    const merged = mergeSettings(raw);
    merged.configured = Boolean(raw?.configured);
    merged.provider.apiKeySet = Boolean(raw?.provider?.apiKeySet);
    return merged;
  }
  async function fetchSettings() {
    try {
      const response = await send({ type: "settings.get" });
      if (response?.ok && response.settings) {
        settings = normalizePublicSettings(response.settings);
        return;
      }
    } catch {
    }
    settings = normalizePublicSettings({});
  }
  function applySettings(next) {
    settings = normalizePublicSettings(next);
    page?.applySettings(settings);
    selection?.updateSettings();
  }
  function shouldAutoTranslate() {
    if (!isTopFrame) return false;
    if (!settings.configured) return false;
    if (!settings.autoTranslateSites?.length) return false;
    return hostMatchesAny(location.hostname, settings.autoTranslateSites);
  }
  function installMessageBridge() {
    api.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      Promise.resolve().then(async () => {
        if (message?.type === "page.ping") return { ok: true, pong: true };
        await ready;
        if (!page) return { ok: false, error: "译流初始化失败，请刷新页面" };
        if (message?.type === "page.status") return page.status();
        if (message?.type === "settings.changed") {
          applySettings(message.settings);
          return { ok: true };
        }
        switch (message?.type) {
          case "page.translate":
            if (!isTopFrame) return { ok: false, unsupported: true };
            page.start({ force: true }).catch((error) => {
              overlay.toast(error?.message || "页面翻译失败", { type: "error" });
            });
            return { ok: true, started: true };
          case "page.toggle":
            if (!isTopFrame) return { ok: false, unsupported: true };
            page.toggle();
            return { ok: true };
          case "page.restore":
            if (!isTopFrame) return { ok: false, unsupported: true };
            page.restore();
            return { ok: true };
          case "selection.translate":
            selection.translateSuppliedText(message.text);
            return { ok: true };
          case "selection.translate-current":
            selection.translateCurrent();
            return { ok: true };
          default:
            return { ok: false, error: "未知页面消息" };
        }
      }).then(sendResponse).catch((error) => {
        sendResponse({ ok: false, error: { message: error?.message || "页面脚本错误" } });
      });
      return true;
    });
  }
  function scheduleAutoTranslate() {
    if (!shouldAutoTranslate()) return;
    const delay = document.readyState === "complete" ? 650 : 1200;
    window.setTimeout(() => {
      if (!page.active && !page.hasTranslations()) {
        page.start({ auto: true }).catch(() => {
        });
      }
    }, delay);
  }
  async function initialize() {
    if (initialized) return;
    document.documentElement.setAttribute("data-yiliu-version", BRAND.version);
    overlay = new OverlayUI();
    page = new PageTranslator(overlay, {
      getSettings: () => settings,
      requestBatch: (items, context) => send({ type: "translate.batch", items, context }),
      report,
      openOptions
    });
    selection = new SelectionController(overlay, {
      getSettings: () => settings,
      requestSelection: (text, context) => send({ type: "translate.selection", text, context }),
      openOptions
    });
    selection.start();
    initialized = true;
    await fetchSettings();
    page.applySettings(settings);
    resolveReady();
    scheduleAutoTranslate();
  }
  if (!globalThis.__YILIU_CONTENT_LOADED__) {
    globalThis.__YILIU_CONTENT_LOADED__ = true;
    installMessageBridge();
    if (document.readyState === "loading") {
      document.addEventListener(
        "DOMContentLoaded",
        () => {
          initialize().catch(() => {
            initialized = false;
            resolveReady();
          });
        },
        { once: true }
      );
    } else {
      initialize().catch(() => {
        initialized = false;
        resolveReady();
      });
    }
  }
  window.addEventListener("pagehide", () => {
    selection?.stop();
    page?.stopObserver();
  });
  window.addEventListener("pageshow", (event) => {
    if (!event.persisted) return;
    selection?.start();
    if (page?.hasTranslations()) page.startObserver();
  });
})();
