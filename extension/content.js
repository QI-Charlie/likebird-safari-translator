(() => {
  // src/shared/constants.js
  var BUILD_VERSION = true ? "1.2.0" : "dev";
  var BRAND = Object.freeze({
    name: "LikeBird \u98DE\u8BD1",
    english: "LikeBird",
    tagline: "Like a Bird.",
    version: BUILD_VERSION
  });
  var TARGET_LANGUAGES = Object.freeze([
    { code: "zh-CN", label: "\u7B80\u4F53\u4E2D\u6587", english: "Simplified Chinese" },
    { code: "zh-TW", label: "\u7E41\u9AD4\u4E2D\u6587", english: "Traditional Chinese" },
    { code: "en", label: "English", english: "English" },
    { code: "ja", label: "\u65E5\u672C\u8A9E", english: "Japanese" },
    { code: "ko", label: "\uD55C\uAD6D\uC5B4", english: "Korean" },
    { code: "fr", label: "Fran\xE7ais", english: "French" },
    { code: "de", label: "Deutsch", english: "German" },
    { code: "es", label: "Espa\xF1ol", english: "Spanish" },
    { code: "ru", label: "\u0420\u0443\u0441\u0441\u043A\u0438\u0439", english: "Russian" },
    { code: "pt", label: "Portugu\xEAs", english: "Portuguese" },
    { code: "it", label: "Italiano", english: "Italian" },
    { code: "ar", label: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629", english: "Arabic" },
    { code: "vi", label: "Ti\u1EBFng Vi\u1EC7t", english: "Vietnamese" },
    { code: "th", label: "\u0E44\u0E17\u0E22", english: "Thai" },
    { code: "id", label: "Bahasa Indonesia", english: "Indonesian" },
    { code: "tr", label: "T\xFCrk\xE7e", english: "Turkish" },
    { code: "nl", label: "Nederlands", english: "Dutch" },
    { code: "pl", label: "Polski", english: "Polish" }
  ]);
  var SOURCE_LANGUAGES = Object.freeze([
    { code: "auto", label: "\u81EA\u52A8\u68C0\u6D4B" },
    { code: "en", label: "English" },
    { code: "zh", label: "\u4E2D\u6587" },
    { code: "ja", label: "\u65E5\u672C\u8A9E" },
    { code: "ko", label: "\uD55C\uAD6D\uC5B4" },
    { code: "fr", label: "Fran\xE7ais" },
    { code: "de", label: "Deutsch" },
    { code: "es", label: "Espa\xF1ol" },
    { code: "ru", label: "\u0420\u0443\u0441\u0441\u043A\u0438\u0439" },
    { code: "pt", label: "Portugu\xEAs" },
    { code: "it", label: "Italiano" },
    { code: "ar", label: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629" }
  ]);
  var STYLE_OPTIONS = Object.freeze([
    {
      value: "natural",
      label: "\u81EA\u7136\u6D41\u7545",
      hint: "\u50CF\u6BCD\u8BED\u8005\u5199\u7684\u4E00\u6837\uFF0C\u9002\u5408\u65E5\u5E38\u9605\u8BFB",
      prompt: "Use natural, idiomatic language that reads as if originally written in the target language. Prefer clarity over literal structure."
    },
    {
      value: "faithful",
      label: "\u5FE0\u5B9E\u539F\u6587",
      hint: "\u4FDD\u7559\u539F\u6587\u7ED3\u6784\u4E0E\u8BED\u6C14\uFF0C\u9002\u5408\u6280\u672F\u8D44\u6599",
      prompt: "Stay close to the source structure and tone. Do not add or omit information, but still produce grammatical target-language prose."
    },
    {
      value: "formal",
      label: "\u6B63\u5F0F\u4E66\u9762",
      hint: "\u9002\u5408\u8BBA\u6587\u3001\u65B0\u95FB\u3001\u5546\u52A1\u6587\u6863",
      prompt: "Use a polished, formal written register suitable for academic, news, or business documents. Avoid colloquialisms."
    },
    {
      value: "literal",
      label: "\u9010\u53E5\u5BF9\u7167",
      hint: "\u66F4\u8D34\u8FD1\u539F\u53E5\uFF0C\u4FBF\u4E8E\u8BED\u8A00\u5B66\u4E60",
      prompt: "Translate clause by clause with minimal restructuring. Preserve the original sentence order where the target language allows it."
    }
  ]);
  var PROVIDER_PRESETS = Object.freeze({
    deepseek: {
      label: "DeepSeek",
      type: "openai",
      baseUrl: "https://api.deepseek.com/v1",
      model: "deepseek-flash",
      jsonMode: true,
      keyless: false,
      hint: "\u6027\u4EF7\u6BD4\u9AD8\uFF0C\u4E2D\u6587\u8868\u8FBE\u81EA\u7136"
    },
    qwen: {
      label: "\u5343\u95EE \xB7 \u963F\u91CC\u4E91\u767E\u70BC",
      type: "openai",
      baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
      model: "qwen-plus",
      jsonMode: true,
      keyless: false,
      hint: "\u4F7F\u7528\u767E\u70BC\u534E\u5317 2\uFF08\u5317\u4EAC\uFF09\u5730\u57DF\u7684\u6309\u91CF\u4ED8\u8D39 API Key"
    },
    zhipu: {
      label: "\u667A\u8C31 GLM",
      type: "openai",
      baseUrl: "https://open.bigmodel.cn/api/paas/v4",
      model: "glm-4.7-flash",
      jsonMode: false,
      keyless: false,
      hint: "\u4F7F\u7528\u667A\u8C31\u5F00\u653E\u5E73\u53F0\u7684\u6807\u51C6 API Key"
    },
    moonshot: {
      label: "Kimi \xB7 \u6708\u4E4B\u6697\u9762",
      type: "openai",
      baseUrl: "https://api.moonshot.cn/v1",
      model: "kimi-k3",
      jsonMode: false,
      keyless: false,
      hint: "\u4F7F\u7528 Kimi \u5F00\u653E\u5E73\u53F0\u6309\u91CF\u8BA1\u8D39\u7684 API Key"
    },
    openai: {
      label: "OpenAI",
      type: "openai",
      baseUrl: "https://api.openai.com/v1",
      model: "gpt-4.1-mini",
      jsonMode: true,
      keyless: false,
      hint: "\u517C\u5BB9 GPT \u7CFB\u5217\u4E0E\u591A\u6570 OpenAI \u683C\u5F0F\u670D\u52A1"
    },
    openrouter: {
      label: "OpenRouter",
      type: "openai",
      baseUrl: "https://openrouter.ai/api/v1",
      model: "openai/gpt-4.1-mini",
      jsonMode: true,
      keyless: false,
      hint: "\u4E00\u4E2A Key \u8C03\u7528\u591A\u5BB6\u6A21\u578B"
    },
    siliconflow: {
      label: "\u7845\u57FA\u6D41\u52A8",
      type: "openai",
      baseUrl: "https://api.siliconflow.cn/v1",
      model: "Qwen/Qwen2.5-7B-Instruct",
      jsonMode: true,
      keyless: false,
      hint: "\u56FD\u5185\u8BBF\u95EE\u7A33\u5B9A\uFF0C\u652F\u6301\u591A\u79CD\u5F00\u6E90\u6A21\u578B"
    },
    ollama: {
      label: "Ollama\uFF08\u672C\u5730\uFF09",
      type: "openai",
      baseUrl: "http://127.0.0.1:11434/v1",
      model: "qwen2.5:7b",
      jsonMode: false,
      keyless: true,
      hint: "\u6570\u636E\u4E0D\u51FA\u672C\u673A\uFF0C\u9700\u8981\u5148\u8FD0\u884C ollama serve"
    },
    lmstudio: {
      label: "LM Studio\uFF08\u672C\u5730\uFF09",
      type: "openai",
      baseUrl: "http://127.0.0.1:1234/v1",
      model: "local-model",
      jsonMode: false,
      keyless: true,
      hint: "\u5728 LM Studio \u4E2D\u542F\u52A8\u672C\u5730\u670D\u52A1\u5668"
    },
    anthropic: {
      label: "Anthropic",
      type: "anthropic",
      baseUrl: "https://api.anthropic.com/v1",
      model: "claude-haiku-5-5",
      jsonMode: false,
      keyless: false,
      hint: "\u4F7F\u7528 Anthropic Messages API"
    },
    custom: {
      label: "\u81EA\u5B9A\u4E49 / \u517C\u5BB9\u63A5\u53E3",
      type: "openai",
      baseUrl: "",
      model: "",
      jsonMode: false,
      keyless: false,
      hint: "\u4EFB\u4F55\u517C\u5BB9 /chat/completions \u7684\u670D\u52A1"
    }
  });
  var SHORTCUT = Object.freeze({
    key: "Alt+A",
    mac: "\u2325 A",
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
  var uidCounter = 0;
  function uid(prefix = "id") {
    uidCounter = (uidCounter + 1) % 1e6;
    return `${prefix}_${Date.now().toString(36)}_${uidCounter.toString(36)}`;
  }
  function normalizeSpace(value) {
    return String(value ?? "").replace(/\u00a0/g, " ").replace(/[\t\f\v ]+/g, " ").replace(/ *\n */g, " ").replace(/\s{2,}/g, " ").trim();
  }
  function squish(value, max = 200) {
    const text = normalizeSpace(value);
    if (text.length <= max) return text;
    return `${text.slice(0, Math.max(0, max - 1)).trimEnd()}\u2026`;
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
  function autoTranslatesHost(host, settings2) {
    const name = host.toLowerCase().replace(/^www\./, "");
    return Boolean(name && hostMatchesAny(name, settings2?.autoTranslateSites) && !settings2?.autoTranslateDisabledSites?.includes(name));
  }

  // src/shared/settings.js
  var DEFAULT_TARGET_LANGUAGE = "zh-CN";
  var DEFAULT_SETTINGS = Object.freeze({
    schemaVersion: 3,
    provider: {
      preset: "deepseek",
      type: "openai",
      baseUrl: PROVIDER_PRESETS.deepseek.baseUrl,
      apiKey: "",
      model: PROVIDER_PRESETS.deepseek.model,
      temperature: 0.2,
      maxTokens: 4096,
      jsonMode: true,
      extraHeaders: ""
    },
    sourceLang: "auto",
    targetLang: DEFAULT_TARGET_LANGUAGE,
    displayMode: "translation",
    style: "natural",
    autoTranslateSites: [],
    autoTranslateDisabledSites: [],
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
    advanced: {
      timeoutMs: 6e4,
      sendPageContext: true
    }
  });
  var PROVIDER_TYPES = /* @__PURE__ */ new Set(["openai", "anthropic"]);
  var STYLE_VALUES = new Set(STYLE_OPTIONS.map((item) => item.value));
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
  function mergeSettings(raw) {
    const merged = mergeObject(DEFAULT_SETTINGS, raw);
    const provider = merged.provider;
    if (!PROVIDER_TYPES.has(provider.type)) provider.type = "openai";
    if (!Object.prototype.hasOwnProperty.call(PROVIDER_PRESETS, provider.preset)) provider.preset = "custom";
    provider.baseUrl = String(provider.baseUrl || "").trim().replace(/\/+$/, "");
    provider.apiKey = String(provider.apiKey || "").trim();
    provider.model = String(provider.model || "").trim();
    provider.extraHeaders = String(provider.extraHeaders || "").slice(0, 4e3);
    provider.temperature = clamp(Number.isFinite(provider.temperature) ? provider.temperature : 0.2, 0, 1.5);
    if (provider.preset === "deepseek" && provider.baseUrl === PROVIDER_PRESETS.deepseek.baseUrl && provider.model === "deepseek-chat") provider.model = PROVIDER_PRESETS.deepseek.model;
    if (provider.preset === "anthropic" && provider.baseUrl === PROVIDER_PRESETS.anthropic.baseUrl && provider.model === "claude-3-5-haiku-latest") provider.model = PROVIDER_PRESETS.anthropic.model;
    provider.maxTokens = Math.round(clamp(Number(provider.maxTokens) || 4096, 128, 32e3));
    provider.jsonMode = Boolean(provider.jsonMode);
    if (merged.schemaVersion === 2 && merged.targetLang === "zh-TW" || !TARGET_LANGUAGES.some((item) => item.code === merged.targetLang)) {
      merged.targetLang = DEFAULT_TARGET_LANGUAGE;
    }
    merged.schemaVersion = DEFAULT_SETTINGS.schemaVersion;
    if (merged.displayMode !== "bilingual") merged.displayMode = "translation";
    if (!STYLE_VALUES.has(merged.style)) merged.style = "natural";
    merged.autoTranslateSites = uniqueStrings(merged.autoTranslateSites);
    merged.autoTranslateDisabledSites = uniqueStrings(merged.autoTranslateDisabledSites);
    merged.excludeSites = uniqueStrings(merged.excludeSites);
    merged.glossary = String(merged.glossary || "").slice(0, 12e3);
    merged.customPrompt = String(merged.customPrompt || "").slice(0, 4e3);
    merged.selection.enabled = Boolean(merged.selection.enabled);
    merged.selection.auto = Boolean(merged.selection.auto);
    merged.cache.enabled = Boolean(merged.cache.enabled);
    merged.cache.maxEntries = Math.round(clamp(Number(merged.cache.maxEntries) || 600, 50, 2e3));
    merged.batch.maxItems = Math.round(clamp(Number(merged.batch.maxItems) || 10, 1, 16));
    merged.batch.concurrency = Math.round(clamp(Number(merged.batch.concurrency) || 2, 1, 4));
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
        reject(new Error(`\u6269\u5C55 API \u4E0D\u53EF\u7528\uFF1A${method}`));
        return;
      }
      let settled = false;
      const timer = setTimeout(() => {
        settle(new Error(`\u6269\u5C55 API \u8D85\u65F6\uFF1A${method}`));
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
    if (!api2?.runtime?.sendMessage) throw new Error("\u6269\u5C55\u6D88\u606F\u901A\u9053\u4E0D\u53EF\u7528");
    return callApi(api2.runtime, "sendMessage", [message], { timeoutMs });
  }

  // src/content/overlay.css
  var overlay_default = ':host {\n  all: initial;\n  --yl-paper: #f7f7f7;\n  --yl-ink: #171717;\n  --yl-char: #171717;\n  --yl-trigger-paper: #ffffff;\n  --yl-trigger-edge: rgba(23, 23, 23, 0.14);\n  --yl-lime: #a7ff00;\n  --yl-card: #ffffff;\n  --yl-line: rgba(23, 23, 23, 0.14);\n  --yl-line-strong: rgba(23, 23, 23, 0.34);\n  --yl-muted: rgba(23, 23, 23, 0.72);\n  --yl-faint: var(--yl-muted);\n  --yl-hover: rgba(23, 23, 23, 0.06);\n  --yl-shadow: 0 8px 28px rgba(23, 23, 23, 0.12);\n  color-scheme: light dark;\n  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;\n}\n\n*,\n*::before,\n*::after {\n  box-sizing: border-box;\n}\n\n.yl-layer {\n  position: fixed;\n  inset: 0;\n  z-index: 2147483647;\n  pointer-events: none;\n  color: var(--yl-ink);\n  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;\n  font-size: 14px;\n  line-height: 1.5;\n  text-align: left;\n  -webkit-font-smoothing: antialiased;\n}\n\n.yl-layer :where(button) {\n  appearance: none;\n  border: 0;\n  margin: 0;\n  padding: 0;\n  background: none;\n  color: inherit;\n  font: inherit;\n  cursor: pointer;\n}\n\n.yl-layer button:focus-visible {\n  outline: 2px solid var(--yl-ink);\n  outline-offset: 2px;\n}\n\n.yl-layer svg {\n  display: block;\n  width: 15px;\n  height: 15px;\n  flex: none;\n}\n\n.yl-mark { width: 22px; height: auto; display: block; flex: none; }\n\n.yl-layer .yl-trigger {\n  position: fixed;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 34px;\n  height: 34px;\n  border-radius: 9px;\n  background: var(--yl-trigger-paper);\n  color: var(--yl-lime);\n  font-size: 15px;\n  font-weight: 700;\n  pointer-events: auto;\n  box-shadow: inset 0 0 0 1px var(--yl-trigger-edge), 0 5px 16px rgba(23, 23, 23, 0.15);\n  opacity: 0;\n  transform: translateY(4px) scale(0.96);\n  transition: opacity 140ms ease, transform 140ms ease;\n  user-select: none;\n  -webkit-user-select: none;\n}\n\n.yl-trigger::after {\n  content: "";\n  position: absolute;\n  left: 50%;\n  bottom: -4px;\n  width: 8px;\n  height: 8px;\n  background: var(--yl-trigger-paper);\n  border-inline-end: 1px solid var(--yl-trigger-edge);\n  border-block-end: 1px solid var(--yl-trigger-edge);\n  transform: translateX(-50%) rotate(45deg);\n  border-radius: 1px;\n}\n\n.yl-layer .yl-trigger.is-visible:hover {\n  box-shadow: inset 0 0 0 1px rgba(23, 23, 23, 0.26), 0 6px 18px rgba(23, 23, 23, 0.19);\n}\n\n.yl-trigger.is-below::after { top: -4px; bottom: auto; transform: translateX(-50%) rotate(225deg); }\n\n.yl-trigger.is-visible {\n  opacity: 1;\n  transform: translateY(0) scale(1);\n}\n\n.yl-bubble {\n  position: fixed;\n  display: flex;\n  flex-direction: column;\n  width: min(396px, calc(100vw - 24px));\n  max-height: min(72vh, 560px);\n  overflow: hidden;\n  border: 1px solid var(--yl-line);\n  border-radius: 16px;\n  background: var(--yl-card);\n  box-shadow: var(--yl-shadow);\n  pointer-events: auto;\n  opacity: 0;\n  visibility: hidden;\n  transform: translateY(6px);\n  transform-origin: top left;\n  transition: opacity 150ms ease, transform 150ms ease, visibility 150ms ease;\n}\n\n.yl-bubble.is-visible {\n  opacity: 1;\n  visibility: visible;\n  transform: translateY(0);\n}\n\n.yl-bubble-head {\n  display: flex;\n  align-items: center;\n  gap: 9px;\n  padding: 8px 12px 8px 16px;\n  border-bottom: 1px solid var(--yl-line);\n  background: var(--yl-card);\n}\n\n.yl-bubble-title {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  min-width: 0;\n  flex: 1;\n}\n\n.yl-bubble-title strong {\n  color: var(--yl-ink);\n  font-size: 13px;\n  font-weight: 650;\n  letter-spacing: 0.01em;\n}\n\n.yl-bubble-title span {\n  overflow: hidden;\n  color: var(--yl-faint);\n  font-size: 11px;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.yl-icon-btn {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  width: 27px;\n  height: 27px;\n  border-radius: 7px;\n  color: var(--yl-faint);\n  transition: background 120ms ease, color 120ms ease;\n}\n\n.yl-icon-btn:hover {\n  background: var(--yl-hover);\n  color: var(--yl-ink);\n}\n\n.yl-bubble-body {\n  min-height: 0;\n  overflow-y: auto;\n  padding: 12px 16px 14px;\n  overscroll-behavior: contain;\n}\n\n.yl-source {\n  max-height: 76px;\n  overflow-y: auto;\n  padding: 0 0 10px;\n  color: var(--yl-muted);\n  font-size: 12px;\n  line-height: 1.55;\n  white-space: pre-wrap;\n  overflow-wrap: anywhere;\n}\n\n.yl-divider {\n  height: 1px;\n  margin: 0 0 12px;\n  background: var(--yl-line);\n}\n\n.yl-result {\n  min-height: 42px;\n  color: var(--yl-ink);\n  font-size: 15.5px;\n  line-height: 1.72;\n  overflow-wrap: anywhere;\n  white-space: pre-wrap;\n}\n\n.yl-result strong {\n  font-weight: 650;\n}\n\n.yl-loading {\n  display: flex;\n  align-items: center;\n  gap: 9px;\n  min-height: 34px;\n  color: var(--yl-muted);\n  font-size: 12.5px;\n}\n\n.yl-dots {\n  display: inline-flex;\n  gap: 3px;\n}\n\n.yl-dots i {\n  width: 5px;\n  height: 5px;\n  border-radius: 50%;\n  background: var(--yl-ink);\n  animation: yl-pulse 1.15s ease-in-out infinite;\n}\n\n.yl-dots i:nth-child(2) {\n  animation-delay: 0.14s;\n}\n\n.yl-dots i:nth-child(3) {\n  animation-delay: 0.28s;\n}\n\n@keyframes yl-pulse {\n  0%,\n  100% {\n    opacity: 0.25;\n    transform: translateY(0);\n  }\n  50% {\n    opacity: 1;\n    transform: translateY(-2px);\n  }\n}\n\n.yl-error {\n  display: flex;\n  flex-direction: column;\n  gap: 9px;\n  color: var(--yl-ink);\n  font-size: 13px;\n  line-height: 1.55;\n}\n\n.yl-error p {\n  margin: 0;\n}\n\n.yl-error-action {\n  display: inline-flex;\n  align-items: center;\n  gap: 5px;\n  align-self: flex-start;\n  padding: 6px 10px;\n  border: 1px solid var(--yl-line-strong, #171717);\n  border-radius: 7px;\n  background: var(--yl-card);\n  color: var(--yl-ink);\n  font-size: 12px;\n  font-weight: 600;\n}\n\n.yl-error-action:hover {\n  border-color: var(--yl-ink);\n}\n\n.yl-bubble-foot {\n  display: flex;\n  align-items: center;\n  gap: 2px;\n  padding: 8px 10px;\n  border-top: 1px solid var(--yl-line);\n  background: var(--yl-card);\n}\n\n.yl-action {\n  display: inline-flex;\n  align-items: center;\n  gap: 5px;\n  padding: 6px 8px;\n  border-radius: 7px;\n  color: var(--yl-muted);\n  font-size: 11.5px;\n  transition: background 120ms ease, color 120ms ease;\n}\n\n.yl-action:hover {\n  background: var(--yl-hover);\n  color: var(--yl-ink);\n}\n\n.yl-action.is-done {\n  color: var(--yl-ink);\n}\n\n.yl-toast {\n  position: fixed;\n  left: 50%;\n  bottom: 26px;\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  max-width: min(460px, calc(100vw - 32px));\n  padding: 11px 14px;\n  border-radius: 9px;\n  background: var(--yl-char);\n  color: var(--yl-paper);\n  font-size: 12.5px;\n  line-height: 1.45;\n  pointer-events: none;\n  opacity: 0;\n  transform: translate(-50%, 8px);\n  transition: opacity 160ms ease, transform 160ms ease;\n}\n\n.yl-toast.is-visible {\n  opacity: 1;\n  transform: translate(-50%, 0);\n}\n\n.yl-toast.is-error {\n  box-shadow: inset 3px 0 var(--yl-lime);\n}\n\n.yl-toast-action {\n  flex: none;\n  padding: 4px 8px;\n  border: 1px solid rgba(247, 247, 247, 0.3);\n  border-radius: 5px;\n  background: transparent;\n  color: var(--yl-paper);\n  font-size: 11.5px;\n  font-weight: 600;\n  pointer-events: auto;\n}\n\n.yl-toast-action:hover {\n  border-color: var(--yl-paper);\n}\n\n.yl-spin {\n  width: 13px;\n  height: 13px;\n  border: 1.5px solid var(--yl-line);\n  border-top-color: var(--yl-ink);\n  border-radius: 50%;\n  animation: yl-rotate 0.8s linear infinite;\n}\n\n@keyframes yl-rotate {\n  to {\n    transform: rotate(360deg);\n  }\n}\n\n/* Author display rules would otherwise override the hidden attribute. */\n.yl-layer [hidden] {\n  display: none !important;\n}\n\n@media (prefers-color-scheme: dark) {\n  :host {\n    --yl-ink: #f7f7f7;\n    --yl-card: #171717;\n    --yl-line: rgba(247, 247, 247, 0.18);\n    --yl-line-strong: rgba(247, 247, 247, 0.42);\n    --yl-muted: rgba(247, 247, 247, 0.72);\n    --yl-hover: rgba(247, 247, 247, 0.08);\n    --yl-shadow: 0 8px 28px rgba(0, 0, 0, 0.30);\n  }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .yl-trigger,\n  .yl-bubble,\n  .yl-toast {\n    transition: none;\n  }\n\n  .yl-dots i,\n  .yl-spin {\n    animation: none;\n  }\n}\n';

  // assets/icons/brand-small.png
  var brand_small_default = "data:image/png;base64,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";

  // assets/remix-icon/close-line.svg
  var close_line_default = '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M11.9997 10.5865L16.9495 5.63672L18.3637 7.05093L13.4139 12.0007L18.3637 16.9504L16.9495 18.3646L11.9997 13.4149L7.04996 18.3646L5.63574 16.9504L10.5855 12.0007L5.63574 7.05093L7.04996 5.63672L11.9997 10.5865Z"/></svg>';

  // assets/remix-icon/file-copy-line.svg
  var file_copy_line_default = '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M6.9998 6V3C6.9998 2.44772 7.44752 2 7.9998 2H19.9998C20.5521 2 20.9998 2.44772 20.9998 3V17C20.9998 17.5523 20.5521 18 19.9998 18H16.9998V20.9991C16.9998 21.5519 16.5499 22 15.993 22H4.00666C3.45059 22 3 21.5554 3 20.9991L3.0026 7.00087C3.0027 6.44811 3.45264 6 4.00942 6H6.9998ZM5.00242 8L5.00019 20H14.9998V8H5.00242ZM8.9998 6H16.9998V16H18.9998V4H8.9998V6Z"/></svg>';

  // assets/remix-icon/volume-up-line.svg
  var volume_up_line_default = '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M6.60282 10.0001L10 7.22056V16.7796L6.60282 14.0001H3V10.0001H6.60282ZM2 16.0001H5.88889L11.1834 20.3319C11.2727 20.405 11.3846 20.4449 11.5 20.4449C11.7761 20.4449 12 20.2211 12 19.9449V4.05519C12 3.93977 11.9601 3.8279 11.887 3.73857C11.7121 3.52485 11.3971 3.49335 11.1834 3.66821L5.88889 8.00007H2C1.44772 8.00007 1 8.44778 1 9.00007V15.0001C1 15.5524 1.44772 16.0001 2 16.0001ZM23 12C23 15.292 21.5539 18.2463 19.2622 20.2622L17.8445 18.8444C19.7758 17.1937 21 14.7398 21 12C21 9.26016 19.7758 6.80629 17.8445 5.15557L19.2622 3.73779C21.5539 5.75368 23 8.70795 23 12ZM18 12C18 10.0883 17.106 8.38548 15.7133 7.28673L14.2842 8.71584C15.3213 9.43855 16 10.64 16 12C16 13.36 15.3213 14.5614 14.2842 15.2841L15.7133 16.7132C17.106 15.6145 18 13.9116 18 12Z"/></svg>';

  // assets/remix-icon/refresh-line.svg
  var refresh_line_default = '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M5.46257 4.43262C7.21556 2.91688 9.5007 2 12 2C17.5228 2 22 6.47715 22 12C22 14.1361 21.3302 16.1158 20.1892 17.7406L17 12H20C20 7.58172 16.4183 4 12 4C9.84982 4 7.89777 4.84827 6.46023 6.22842L5.46257 4.43262ZM18.5374 19.5674C16.7844 21.0831 14.4993 22 12 22C6.47715 22 2 17.5228 2 12C2 9.86386 2.66979 7.88416 3.8108 6.25944L7 12H4C4 16.4183 7.58172 20 12 20C14.1502 20 16.1022 19.1517 17.5398 17.7716L18.5374 19.5674Z"/></svg>';

  // assets/remix-icon/text-snippet.svg
  var text_snippet_default = '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M2 4C2 3.44772 2.44772 3 3 3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4ZM4 5V19H20V5H4ZM7 8H17V11H15V10H13V14H14.5V16H9.5V14H11V10H9V11H7V8Z"/></svg>';

  // assets/remix-icon/settings-3-line.svg
  var settings_3_line_default = '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M3.33946 17.0002C2.90721 16.2515 2.58277 15.4702 2.36133 14.6741C3.3338 14.1779 3.99972 13.1668 3.99972 12.0002C3.99972 10.8345 3.3348 9.824 2.36353 9.32741C2.81025 7.71651 3.65857 6.21627 4.86474 4.99001C5.7807 5.58416 6.98935 5.65534 7.99972 5.072C9.01009 4.48866 9.55277 3.40635 9.4962 2.31604C11.1613 1.8846 12.8847 1.90004 14.5031 2.31862C14.4475 3.40806 14.9901 4.48912 15.9997 5.072C17.0101 5.65532 18.2187 5.58416 19.1346 4.99007C19.7133 5.57986 20.2277 6.25151 20.66 7.00021C21.0922 7.7489 21.4167 8.53025 21.6381 9.32628C20.6656 9.82247 19.9997 10.8336 19.9997 12.0002C19.9997 13.166 20.6646 14.1764 21.6359 14.673C21.1892 16.2839 20.3409 17.7841 19.1347 19.0104C18.2187 18.4163 17.0101 18.3451 15.9997 18.9284C14.9893 19.5117 14.4467 20.5941 14.5032 21.6844C12.8382 22.1158 11.1148 22.1004 9.49633 21.6818C9.55191 20.5923 9.00929 19.5113 7.99972 18.9284C6.98938 18.3451 5.78079 18.4162 4.86484 19.0103C4.28617 18.4205 3.77172 17.7489 3.33946 17.0002ZM8.99972 17.1964C10.0911 17.8265 10.8749 18.8227 11.2503 19.9659C11.7486 20.0133 12.2502 20.014 12.7486 19.9675C13.1238 18.8237 13.9078 17.8268 14.9997 17.1964C16.0916 16.5659 17.347 16.3855 18.5252 16.6324C18.8146 16.224 19.0648 15.7892 19.2729 15.334C18.4706 14.4373 17.9997 13.2604 17.9997 12.0002C17.9997 10.74 18.4706 9.5632 19.2729 8.6665C19.1688 8.4405 19.0538 8.21822 18.9279 8.00021C18.802 7.78219 18.667 7.57148 18.5233 7.36842C17.3457 7.61476 16.0911 7.43414 14.9997 6.80405C13.9083 6.17395 13.1246 5.17768 12.7491 4.03455C12.2509 3.98714 11.7492 3.98646 11.2509 4.03292C10.8756 5.17671 10.0916 6.17364 8.99972 6.80405C7.9078 7.43447 6.65245 7.61494 5.47428 7.36803C5.18485 7.77641 4.93463 8.21117 4.72656 8.66637C5.52881 9.56311 5.99972 10.74 5.99972 12.0002C5.99972 13.2604 5.52883 14.4372 4.72656 15.3339C4.83067 15.5599 4.94564 15.7822 5.07152 16.0002C5.19739 16.2182 5.3324 16.4289 5.47612 16.632C6.65377 16.3857 7.90838 16.5663 8.99972 17.1964ZM11.9997 15.0002C10.3429 15.0002 8.99972 13.6571 8.99972 12.0002C8.99972 10.3434 10.3429 9.00021 11.9997 9.00021C13.6566 9.00021 14.9997 10.3434 14.9997 12.0002C14.9997 13.6571 13.6566 15.0002 11.9997 15.0002ZM11.9997 13.0002C12.552 13.0002 12.9997 12.5525 12.9997 12.0002C12.9997 11.4479 12.552 11.0002 11.9997 11.0002C11.4474 11.0002 10.9997 11.4479 10.9997 12.0002C10.9997 12.5525 11.4474 13.0002 11.9997 13.0002Z"/></svg>';

  // src/content/overlay.js
  var MARK = `<img class="yl-mark" src="${brand_small_default}" alt="" />`;
  function decorativeIcon(svg) {
    return svg.replace("<svg ", '<svg aria-hidden="true" focusable="false" ');
  }
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
      this.shadow = this.host.attachShadow({ mode: "open" });
      const style = document.createElement("style");
      style.textContent = overlay_default;
      this.shadow.appendChild(style);
      this.layer = document.createElement("div");
      this.layer.className = "yl-layer";
      this.layer.innerHTML = `
      <button class="yl-trigger" type="button" aria-label="\u7FFB\u8BD1\u9009\u4E2D\u6587\u5B57" hidden>${MARK}</button>

      <section class="yl-bubble" role="dialog" aria-label="\u5212\u8BCD\u7FFB\u8BD1" aria-hidden="true">
        <header class="yl-bubble-head">
          <div class="yl-bubble-title">${decorativeIcon(text_snippet_default)}<strong>\u5212\u8BCD\u7FFB\u8BD1</strong></div>
          <button class="yl-icon-btn" data-act="close" title="\u5173\u95ED" aria-label="\u5173\u95ED">
            ${decorativeIcon(close_line_default)}
          </button>
        </header>
        <div class="yl-bubble-body">
          <div class="yl-source" data-role="source"></div>
          <div class="yl-divider"></div>
          <div class="yl-result" data-role="result" aria-live="polite"></div>
        </div>
        <footer class="yl-bubble-foot">
          <button class="yl-action" data-act="copy" type="button">
            ${decorativeIcon(file_copy_line_default)}<span>\u590D\u5236</span>
          </button>
          <button class="yl-action" data-act="speak" type="button">
            ${decorativeIcon(volume_up_line_default)}<span>\u6717\u8BFB</span>
          </button>
          <button class="yl-action" data-act="retry" type="button" hidden>
            ${decorativeIcon(refresh_line_default)}<span>\u91CD\u8BD5</span>
          </button>
        </footer>
      </section>

      <div class="yl-toast" role="status" aria-live="polite"></div>
    `;
      this.shadow.appendChild(this.layer);
      this.trigger = this.shadow.querySelector(".yl-trigger");
      this.bubble = this.shadow.querySelector(".yl-bubble");
      this.source = this.shadow.querySelector('[data-role="source"]');
      this.result = this.shadow.querySelector('[data-role="result"]');
      this.copyButton = this.shadow.querySelector('[data-act="copy"]');
      this.speakButton = this.shadow.querySelector('[data-act="speak"]');
      this.bubbleFooter = this.shadow.querySelector(".yl-bubble-foot");
      this.retryButton = this.shadow.querySelector('[data-act="retry"]');
      this.toastNode = this.shadow.querySelector(".yl-toast");
      this.currentText = "";
      this.currentTranslation = "";
      this.currentLang = "";
      this.anchorRect = null;
      this.toastTimer = 0;
      this.onTrigger = null;
      this.onRetry = null;
      this.onSettings = null;
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
      this.shadow.querySelector('[data-act="close"]').addEventListener("click", () => this.hideBubble());
      this.copyButton.addEventListener("click", () => this.copyTranslation());
      this.speakButton.addEventListener("click", () => this.speakTranslation());
      this.retryButton.addEventListener("click", () => this.onRetry?.());
      this.bubble.addEventListener("pointerdown", (event) => event.stopPropagation());
      this.bubble.addEventListener("click", (event) => event.stopPropagation());
      this.shadow.addEventListener("keydown", (event) => {
        if (event.key === "Escape") this.hideBubble();
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
      const left = clamp2(rect.right - width / 2, 10, (window.innerWidth || 1024) - width - 10);
      this.trigger.style.left = `${left}px`;
      this.trigger.style.top = `${top}px`;
      this.trigger.classList.toggle("is-below", below);
      this.trigger.hidden = false;
      this.trigger.tabIndex = 0;
      this.trigger.setAttribute("aria-hidden", "false");
      this.trigger.classList.add("is-visible");
    }
    hideTrigger() {
      this.trigger.classList.remove("is-visible");
      this.trigger.tabIndex = -1;
      this.trigger.setAttribute("aria-hidden", "true");
      clearTimeout(this.triggerHideTimer);
      this.triggerHideTimer = setTimeout(() => {
        if (!this.trigger.classList.contains("is-visible")) this.trigger.hidden = true;
      }, 150);
    }
    showBubble({ rect, source = "", loading = true } = {}) {
      if (!this.host.isConnected) document.documentElement.appendChild(this.host);
      this.anchorRect = rect || {
        left: (window.innerWidth || 1024) - 430,
        right: (window.innerWidth || 1024) - 30,
        top: 70,
        bottom: 70
      };
      this.currentText = source;
      this.currentTranslation = "";
      this.source.textContent = source;
      this.copyButton.querySelector("span").textContent = "\u590D\u5236";
      this.copyButton.classList.remove("is-done");
      this.retryButton.hidden = true;
      this.bubble.classList.remove("is-visible");
      this.bubble.setAttribute("aria-hidden", "false");
      if (loading) this.setBubbleLoading();
      else this.positionBubble(this.anchorRect);
      this.bubble.classList.add("is-visible");
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
    setBubbleLoading(message = "\u6B63\u5728\u7FFB\u8BD1\u2026") {
      this.result.innerHTML = `<div class="yl-loading"><span class="yl-spin"></span><span>${message}</span></div>`;
      this.retryButton.hidden = true;
      this.copyButton.hidden = true;
      this.speakButton.hidden = true;
      this.bubbleFooter.hidden = true;
      this.positionBubble(this.anchorRect);
    }
    setBubbleText(text, lang = "") {
      this.currentTranslation = text;
      this.currentLang = lang;
      this.result.textContent = text;
      this.bubbleFooter.hidden = !text;
      this.copyButton.hidden = !text;
      this.speakButton.hidden = !("speechSynthesis" in window) || !text;
      this.retryButton.hidden = true;
      this.positionBubble(this.anchorRect);
    }
    setBubbleError(payload = {}) {
      this.currentTranslation = "";
      const message = payload.message || "\u7FFB\u8BD1\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5";
      const needsSettings = ["NO_API_KEY", "AUTH", "CONFIG", "NOT_FOUND", "INSUFFICIENT_BALANCE"].includes(payload.code);
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
        button.innerHTML = `${decorativeIcon(settings_3_line_default)}<span>\u6253\u5F00\u98DE\u8BD1\u8BBE\u7F6E</span>`;
        button.addEventListener("click", () => this.onSettings?.());
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
      this.bubble.classList.remove("is-visible");
      this.bubble.setAttribute("aria-hidden", "true");
      this.onClose?.();
    }
    async copyTranslation() {
      if (!this.currentTranslation) return;
      const ok = await copyText(this.currentTranslation);
      const span = this.copyButton.querySelector("span");
      span.textContent = ok ? "\u5DF2\u590D\u5236" : "\u590D\u5236\u5931\u8D25";
      this.copyButton.classList.toggle("is-done", ok);
      setTimeout(() => {
        span.textContent = "\u590D\u5236";
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
    toast(message, { type = "info", duration = 3600, action = null } = {}) {
      if (!this.host.isConnected) document.documentElement.appendChild(this.host);
      clearTimeout(this.toastTimer);
      this.toastNode.className = `yl-toast${type === "error" ? " is-error" : ""}`;
      this.toastNode.innerHTML = "";
      const text = document.createElement("span");
      text.textContent = message;
      this.toastNode.appendChild(text);
      if (action?.label) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "yl-toast-action";
        button.textContent = action.label;
        button.addEventListener("click", () => {
          action.onClick?.();
          this.hideToast();
        });
        this.toastNode.appendChild(button);
        this.toastNode.style.pointerEvents = "auto";
      } else {
        this.toastNode.style.pointerEvents = "none";
      }
      this.toastNode.classList.add("is-visible");
      this.toastTimer = setTimeout(() => this.hideToast(), duration);
    }
    hideToast() {
      this.toastNode.classList.remove("is-visible");
      clearTimeout(this.toastTimer);
    }
    destroy() {
      this.host.remove();
    }
  };

  // src/shared/text-slots.js
  function splitTextSlots(text, count) {
    if (typeof text !== "string") return null;
    if (count === 1) return text.trim() && !/<\/?x\d+>/i.test(text) ? [text.trim()] : null;
    const slots = [];
    const pattern = /\s*<x(\d+)>([\s\S]*?)<\/x\1>/gy;
    let offset = 0;
    for (let index = 0; index < count; index += 1) {
      const match = pattern.exec(text);
      if (!match || match[1] !== String(index) || !match[2].trim() || /<\/?x\d+>/i.test(match[2])) return null;
      slots.push(match[2].trim());
      offset = pattern.lastIndex;
    }
    return text.slice(offset).trim() ? null : slots;
  }

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
    "CODE",
    "KBD",
    "SAMP",
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
    '[contenteditable]:not([contenteditable="false" i])',
    '[aria-hidden="true"]',
    "[data-yiliu-block]",
    "[data-yiliu-translation]",
    "[data-ee-bilingual]",
    "[data-yiliu-skip]",
    '[role="button"]',
    '[role="tab"]',
    '[role="menuitem"]',
    '[role="tooltip"]',
    '[role="img"]'
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
      if (style.display === "contents") return true;
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
  function isTranslatableText(text) {
    return !/^(?:https?:\/\/|www\.)\S+$/i.test(text) && new RegExp("\\p{L}", "u").test(text);
  }
  function collectBlocks(root, { limit = LIMITS.maxPageBlocks, maxChars = LIMITS.maxBlockChars, skipNode, includeBlock } = {}) {
    const view = root?.ownerDocument?.defaultView || globalThis.window;
    const blocks = [];
    let parts = [];
    let chars = 0;
    let separator = "";
    let element;
    let language;
    function flush() {
      if (parts.length && (!includeBlock || includeBlock(parts))) {
        const text = parts.length === 1 ? parts[0].source.trim() : parts.map((part, index) => `${part.separator}<x${index}>${part.source.trim()}</x${index}>`).join("");
        blocks.push({ id: uid("b"), element, language, parts, text });
      }
      parts = [];
      chars = 0;
      separator = "";
    }
    function visit(node, container, lang) {
      if (blocks.length >= limit) return;
      if (isText(node)) {
        const source = node.data;
        const trimmed = source.trim();
        if (!trimmed) {
          if (parts.length) separator = " ";
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
        parts.push({ node, parent: node.parentNode, source, separator: separator || (/^\s/.test(source) && parts.length ? " " : "") });
        chars += size;
        separator = /\s$/.test(source) ? " " : "";
        return;
      }
      if (!isElement(node)) return;
      if (node.tagName === "BR" || isSkippedElement(node) || !isVisible(node, view)) {
        flush();
        return;
      }
      const boundary = BLOCK_TAGS.has(node.tagName) || node.tagName.includes("-");
      if (boundary) flush();
      const nextContainer = boundary ? node : container;
      const nextLang = node.getAttribute("lang") || lang;
      for (const child of node.childNodes) visit(child, nextContainer, nextLang);
      if (boundary) flush();
    }
    if (root) visit(root, root, root.closest("[lang]")?.getAttribute("lang") || "");
    flush();
    return blocks;
  }
  function visibleTextFilter(doc) {
    const view = doc.defaultView;
    const range = doc.createRange();
    if (!view?.innerHeight || typeof range.getClientRects !== "function") return () => true;
    const bounds = /* @__PURE__ */ new WeakMap();
    const viewport = { top: 0, left: 0, bottom: view.innerHeight, right: view.innerWidth };
    function visibleBounds(element) {
      if (!element || element === doc.body || element === doc.documentElement) return viewport;
      if (bounds.has(element)) return bounds.get(element);
      let area = visibleBounds(element.parentElement);
      const style = view.getComputedStyle(element);
      const clipX = /^(auto|scroll|hidden|clip|overlay)$/.test(style.overflowX);
      const clipY = /^(auto|scroll|hidden|clip|overlay)$/.test(style.overflowY);
      if ((clipX || clipY) && style.display !== "inline" && style.display !== "contents") {
        const rect = element.getBoundingClientRect();
        area = {
          top: clipY ? Math.max(area.top, rect.top) : area.top,
          bottom: clipY ? Math.min(area.bottom, rect.bottom) : area.bottom,
          left: clipX ? Math.max(area.left, rect.left) : area.left,
          right: clipX ? Math.min(area.right, rect.right) : area.right
        };
      }
      bounds.set(element, area);
      return area;
    }
    return (parts) => parts.some(({ node }) => {
      const area = visibleBounds(node.parentElement);
      range.selectNodeContents(node);
      return Array.from(range.getClientRects()).some((rect) => rect.height > 0 && rect.width > 0 && area.top < area.bottom && area.left < area.right && rect.top < area.bottom && rect.bottom > area.top && rect.left < area.right && rect.right > area.left);
    });
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
      if (declared === "zh") return false;
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

  // src/content/page.js
  var PageTranslator = class {
    constructor(deps) {
      this.deps = deps;
      this.settings = deps.getSettings();
      this.active = false;
      this.runId = 0;
      this.following = false;
      this.stopped = false;
      this.error = "";
      this.done = 0;
      this.total = 0;
      this.errorCount = 0;
      this.failedBlocks = /* @__PURE__ */ new Map();
      this.replacements = /* @__PURE__ */ new Map();
      this.bilingualBlocks = /* @__PURE__ */ new Set();
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
      return pathname + search + (hash.startsWith("#/") || hash.startsWith("#!") ? hash : "");
    }
    shouldAutoTranslate() {
      return (this.settings.configured || this.settings.targetLang === "zh-TW") && !this.isExcluded() && autoTranslatesHost(location.hostname, this.settings);
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
        this.deps.report("restored");
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
      const displayed = this.settings.displayMode === "bilingual" ? replacement.source : replacement.text;
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
        if (this.settings.displayMode === "bilingual") {
          for (const { node } of block.parts) this.replacements.delete(node);
        }
        return;
      }
      if (this.settings.displayMode !== "bilingual" || block.translation?.isConnected) return;
      let anchor = block.parts.at(-1).node;
      while (anchor.parentElement && anchor.parentElement !== block.element) anchor = anchor.parentElement;
      const translation = document.createElement("span");
      translation.setAttribute("data-ee-bilingual", "");
      translation.lang = block.targetLang;
      translation.dir = "auto";
      translation.style.display = "block";
      translation.style.marginBlockStart = "0.25em";
      translation.textContent = block.parts.map(({ node }) => this.replacements.get(node).text).join("").trim();
      anchor.parentNode.insertBefore(translation, anchor.nextSibling);
      block.translation = translation;
    }
    setDisplayMode(next) {
      if (this.settings.displayMode === next.displayMode) return;
      for (const [node, { source, text }] of this.replacements) {
        if (this.isReplaced(node) && source !== text) node.data = next.displayMode === "bilingual" ? source : text;
      }
      this.settings = next;
      for (const block of this.bilingualBlocks) {
        if (next.displayMode === "bilingual") this.renderBilingual(block);
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
        excluded: this.isExcluded()
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
      this.error = "";
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
      const failedNodes = /* @__PURE__ */ new Set();
      for (const [id, block] of this.failedBlocks) {
        if (retry || !this.isCurrent(block)) {
          this.failedBlocks.delete(id);
        } else {
          for (const { node } of block.parts) failedNodes.add(node);
        }
      }
      this.errorCount = this.failedBlocks.size;
      if (!this.errorCount) this.error = "";
      const blocks = collectBlocks(document.body, {
        skipNode: (node) => this.isReplaced(node) || failedNodes.has(node),
        includeBlock: visibleTextFilter(document)
      });
      if (!blocks.length) {
        this.total = this.done + this.errorCount;
        this.reportStatus();
        return;
      }
      const runId = ++this.runId;
      this.active = true;
      this.total = this.done + this.errorCount + blocks.length;
      this.deps.report("translating");
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
      if (this.active) this.deps.report("translating", status);
      else if (this.error || this.errorCount) this.deps.report("error", status);
      else if (this.done || status.hasTranslation) this.deps.report("done", status);
      else this.deps.report("restored", status);
    }
    isCurrent(block) {
      return block.parts.every(({ node, parent, source }) => node.isConnected && node.parentNode === parent && node.data === source);
    }
    async translateBlocks(blocks, runId) {
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
          while (runId === this.runId && cursor < batches.length) {
            const index = cursor;
            cursor += 1;
            await this.runBatch(batches[index], runId);
          }
        }
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
        response = { error: error?.message || "\u65E0\u6CD5\u8FDE\u63A5\u98DE\u8BD1\uFF0C\u8BF7\u5237\u65B0\u9875\u9762\u540E\u91CD\u8BD5" };
      }
      if (runId !== this.runId || this.checkNavigation()) return;
      if (!response?.ok || response.warning) {
        const error = response?.error || response?.warning;
        this.error ||= (typeof error === "string" ? error : error?.message) || "\u7FFB\u8BD1\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5";
      }
      for (const block of current) {
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
          if (source !== text && this.settings.displayMode !== "bilingual") node.data = text;
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
      this.error = (typeof error === "string" ? error : error?.message) || "\u7FFB\u8BD1\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5";
      this.deps.report("error");
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
      this.stopped = true;
      this.deps.report("restored");
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
      if (languageChanged || autoBefore && !autoNow || this.isExcluded()) {
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
          if (type === "characterData") return !this.isReplaced(target);
          if (type === "attributes") return true;
          return addedNodes.length || removedNodes.length;
        });
        if (relevant) this.scheduleRefresh();
      });
      this.observer.observe(document.documentElement, {
        characterData: true,
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["class", "style", "hidden", "open", "aria-hidden"]
      });
      view?.addEventListener("scroll", this.onViewportChange, { capture: true, passive: true });
      view?.addEventListener("resize", this.onViewportChange);
      view?.addEventListener("popstate", this.scheduleRefresh);
      view?.addEventListener("hashchange", this.scheduleRefresh);
      view?.navigation?.addEventListener("currententrychange", this.scheduleRefresh);
      document.addEventListener("visibilitychange", this.scheduleRefresh);
    }
    stopObserver() {
      this.suspended = true;
      this.observer?.disconnect();
      this.observer = null;
      this.clearRefresh();
      const view = document.defaultView;
      view?.removeEventListener("scroll", this.onViewportChange, true);
      view?.removeEventListener("resize", this.onViewportChange);
      view?.removeEventListener("popstate", this.scheduleRefresh);
      view?.removeEventListener("hashchange", this.scheduleRefresh);
      view?.navigation?.removeEventListener("currententrychange", this.scheduleRefresh);
      document.removeEventListener("visibilitychange", this.scheduleRefresh);
    }
    clearRefresh() {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = 0;
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
        this.overlay.toast(`\u9009\u4E2D\u6587\u5B57\u8FC7\u957F\uFF0C\u6700\u591A\u652F\u6301 ${LIMITS.maxSelectionChars} \u5B57\u7B26`, {
          type: "error"
        });
        return;
      }
      const element = elementFromSelection(selection2);
      if (isEditable(element)) return;
      if (element?.closest?.("#yiliu-overlay-host")) return;
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
      if (this.loading || !this.deps.getSettings()?.selection?.enabled) return;
      if (!this.current?.text) {
        this.captureSelection(null, true);
      }
      if (!this.current?.text) return;
      const requestId = ++this.requestId;
      const targetLang = this.deps.getSettings()?.targetLang || "";
      this.loading = true;
      this.overlay.hideTrigger();
      this.overlay.showBubble({ rect: this.current.rect, source: this.current.text });
      try {
        const response = await this.deps.requestSelection(this.current.text, this.current.context);
        if (requestId !== this.requestId) return;
        if (!response?.ok) {
          this.loading = false;
          this.overlay.setBubbleError(response?.error || { message: "\u7FFB\u8BD1\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5" });
          return;
        }
        this.loading = false;
        this.overlay.setBubbleText(
          response.translation,
          targetLang
        );
        if (retry) this.overlay.toast("\u5DF2\u91CD\u65B0\u7FFB\u8BD1");
      } catch (error) {
        if (requestId !== this.requestId) return;
        this.loading = false;
        this.overlay.setBubbleError({
          message: error?.message || "\u7FFB\u8BD1\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5\u7F51\u7EDC\u6216 API \u8BBE\u7F6E",
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
  function report(state, status = page?.status()) {
    send({ type: "page.report", state, status, url: location.href }).catch(() => {
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
      const response = await sendRuntimeMessage({ type: "settings.get" }, 5e3);
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
    if (isTopFrame) page?.applySettings(settings);
    selection?.updateSettings();
  }
  var completedRequests = /* @__PURE__ */ new Set();
  function handlePageMessage(message) {
    if (message.type === "page.ping") return { ok: true, pong: true, viewportTranslation: true };
    if (!page || !initialized) return { ok: false, error: "\u98DE\u8BD1\u6B63\u5728\u8FDE\u63A5\u7F51\u9875\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002" };
    if (message.type === "page.status") return page.status();
    if (completedRequests.has(message.requestId)) {
      return { ok: true, status: page.status() };
    }
    switch (message.type) {
      case "page.translate":
        page.start().catch((error) => page.handleFatal(error));
        break;
      case "page.toggle":
        page.toggle();
        break;
      case "page.stop":
        page.cancel();
        break;
      case "page.retry":
        page.retryFailed().catch((error) => page.handleFatal(error));
        break;
      case "page.restore":
        page.restore();
        break;
      case "page.display":
        applySettings({ ...settings, displayMode: message.displayMode });
        break;
      case "page.navigate":
        page.scheduleRefresh();
        break;
      default:
        return { ok: false, error: "\u672A\u77E5\u9875\u9762\u6D88\u606F" };
    }
    if (message.requestId) {
      completedRequests.add(message.requestId);
      if (completedRequests.size > 32) completedRequests.delete(completedRequests.values().next().value);
    }
    return { ok: true, status: page.status() };
  }
  function installMessageBridge() {
    if (isTopFrame) globalThis.__EE_PAGE_REQUEST__ = handlePageMessage;
    api.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      const type = message?.type;
      if (type === "page.ping" || type === "page.status") {
        if (isTopFrame) {
          try {
            sendResponse(handlePageMessage(message));
          } catch (error) {
            sendResponse({ ok: false, error: error.message });
          }
        }
        return false;
      }
      if (type?.startsWith("page.") && !isTopFrame) return false;
      ready.then(() => {
        if (type?.startsWith("page.")) return handlePageMessage(message);
        switch (type) {
          case "settings.changed":
            applySettings(message.settings);
            return { ok: true };
          case "selection.translate":
            selection.translateSuppliedText(message.text);
            return { ok: true };
          case "selection.translate-current":
            selection.translateCurrent();
            return { ok: true };
          default:
            return { ok: false, error: "\u672A\u77E5\u9875\u9762\u6D88\u606F" };
        }
      }).then(sendResponse, (error) => {
        sendResponse({ ok: false, error: { message: error?.message || "\u9875\u9762\u811A\u672C\u9519\u8BEF" } });
      });
      return true;
    });
  }
  async function initialize() {
    if (initialized) return;
    page = new PageTranslator({
      getSettings: () => settings,
      requestBatch: (items, context) => send({ type: "translate.batch", items, context }),
      report
    });
    selection = new SelectionController(new OverlayUI(), {
      getSettings: () => settings,
      requestSelection: (text, context) => send({ type: "translate.selection", text, context }),
      openOptions
    });
    selection.start();
    initialized = true;
    await fetchSettings();
    if (isTopFrame) {
      page.startObserver();
      page.applySettings(settings);
      page.startAuto();
    }
    resolveReady();
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
    page?.suspend();
  });
  window.addEventListener("pageshow", (event) => {
    if (!event.persisted) return;
    selection?.start();
    if (isTopFrame) {
      page?.startObserver();
      sendRuntimeMessage({ type: "settings.get" }, 5e3).then((response) => {
        if (response?.ok) applySettings(response.settings);
      }).catch(() => {
      }).finally(() => page?.scheduleRefresh());
    }
  });
})();
