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

  // src/shared/utils.js
  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }
  function isLikelyLocalUrl(value) {
    try {
      const url = new URL(value);
      const host = url.hostname.toLowerCase();
      if (host === "localhost" || host === "::1" || host === "0.0.0.0") return true;
      if (host.endsWith(".local")) return true;
      if (/^127\./.test(host)) return true;
      if (/^10\./.test(host)) return true;
      if (/^192\.168\./.test(host)) return true;
      const private172 = host.match(/^172\.(\d{1,3})\./);
      if (private172) {
        const second = Number(private172[1]);
        return second >= 16 && second <= 31;
      }
      return false;
    } catch {
      return false;
    }
  }
  function linesToArray(value) {
    const seen = /* @__PURE__ */ new Set();
    return String(value ?? "").split(/\r?\n/).map((line) => line.trim()).filter((line) => {
      if (!line || seen.has(line)) return false;
      seen.add(line);
      return true;
    });
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
  function providerRequiresKey(provider) {
    if (!provider) return true;
    if (provider.type === "anthropic") return true;
    return !isLikelyLocalUrl(provider.baseUrl) && !PROVIDER_PRESETS[provider.preset]?.keyless;
  }
  function isProviderConfigured(settings) {
    const provider = settings?.provider;
    if (!provider?.baseUrl || !provider?.model) return false;
    if (providerRequiresKey(provider) && !provider.apiKey) return false;
    return true;
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
    const api = extensionApi();
    if (!api?.runtime?.sendMessage) throw new Error("\u6269\u5C55\u6D88\u606F\u901A\u9053\u4E0D\u53EF\u7528");
    return callApi(api.runtime, "sendMessage", [message], { timeoutMs });
  }

  // src/options/site.js
  var providerDocs = {
    deepseek: ["https://platform.deepseek.com/api_keys", "https://platform.deepseek.com/top_up", "https://api-docs.deepseek.com/zh-cn/"],
    qwen: ["https://help.aliyun.com/zh/model-studio/get-api-key", "https://help.aliyun.com/zh/model-studio/model-pricing", "https://help.aliyun.com/zh/model-studio/compatibility-of-openai-with-dashscope"],
    zhipu: ["https://bigmodel.cn/usercenter/proj-mgmt/apikeys", "https://bigmodel.cn/pricing", "https://docs.bigmodel.cn/cn/guide/models/free/glm-4.7-flash"],
    moonshot: ["https://platform.kimi.com/console/api-keys", "https://platform.kimi.com/docs/pricing/chat", "https://platform.kimi.com/docs/guide/kimi-k3-quickstart"],
    openai: ["https://platform.openai.com/api-keys", "https://platform.openai.com/settings/organization/billing/overview", "https://developers.openai.com/api/docs/models/gpt-4.1-mini"],
    anthropic: ["https://platform.claude.com/settings/keys", "https://platform.claude.com/settings/billing", "https://platform.claude.com/docs/en/models/overview"],
    openrouter: ["https://openrouter.ai/settings/keys", "https://openrouter.ai/settings/credits", "https://openrouter.ai/docs/quickstart"]
  };
  var el = (id) => document.getElementById(id);
  var pages = ["home", "privacy", "about", "updates"];
  var anchors = { settings: "home", service: "home", api: "home", source: "about", contact: "about", support: "about" };
  var releases = [
    ["1.2.0", "2026-11-14", ["\u65B0\u589E\uFF5CLikeBird \u98DE\u8BD1\u54C1\u724C\u3001\u8BBE\u7F6E\u4E3B\u9875\u3001\u9690\u79C1\u4E0E\u5B89\u5168\u548C\u66F4\u65B0\u65E5\u5FD7\u3002", "\u65B0\u589E\uFF5C\u5343\u95EE\u3001\u667A\u8C31 GLM \u548C Kimi API \u9884\u8BBE\u53CA\u5B98\u65B9\u63A5\u5165\u5165\u53E3\u3002", "\u6539\u8FDB\uFF5CSafari \u5F39\u7A97\u3001\u6574\u9875\u4E0E\u5212\u8BCD\u793A\u4F8B\uFF0C\u4EE5\u53CA macOS \u62D6\u62FD\u5B89\u88C5\u4F53\u9A8C\u3002"]],
    ["1.1.6", "2026-11-14", ["\u6539\u8FDB\uFF5C\u5212\u8BCD\u5165\u53E3\u6362\u6210\u767D\u5E95\u7EFF\u6807\uFF0C\u5E38\u7528\u64CD\u4F5C\u91C7\u7528 Remix Icon\u3002", "\u4FEE\u590D\uFF5C\u4F59\u989D\u4E0D\u8DB3\u65F6\u663E\u793A\u660E\u786E\u63D0\u793A\u3002\u5212\u8BCD\u53EF\u4EE5\u590D\u7528\u5DF2\u6709\u6574\u9875\u8BD1\u6587\u3002"]],
    ["1.1.5", "2026-11-14", ["\u65B0\u589E\uFF5C\u53CC\u8BED\u5BF9\u7167\u4E0E\u4EC5\u8BD1\u6587\u53EF\u968F\u65F6\u5207\u6362\u3002", "\u4FEE\u590D\uFF5C\u7F51\u9875\u5DF2\u6709\u8BD1\u6587\u65F6\uFF0C\u5F39\u7A97\u5076\u53D1\u62A5\u9519\u4E14\u300C\u663E\u793A\u539F\u6587\u300D\u6D88\u5931\u3002"]],
    ["1.1.4", "2026-11-13", ["\u65B0\u589E\uFF5C\u5F53\u524D\u7F51\u7AD9\u81EA\u52A8\u7FFB\u8BD1\u5F00\u5173\uFF0C\u7AD9\u5185\u8DF3\u8F6C\u540E\u7EE7\u7EED\u7FFB\u8BD1\u3002", "\u6539\u8FDB\uFF5C\u4F18\u5148\u7FFB\u8BD1\u53EF\u89C1\u5185\u5BB9\uFF0C\u6EDA\u52A8\u65F6\u7EE7\u7EED\u3002\u9ED8\u8BA4\u76EE\u6807\u6539\u4E3A\u7B80\u4F53\u4E2D\u6587\u3002"]],
    ["1.1.3", "2026-11-13", ["\u6539\u8FDB\uFF5C\u8BD1\u6587\u5199\u56DE\u539F\u6765\u7684\u6587\u5B57\u4F4D\u7F6E\uFF0C\u4FDD\u7559\u7F51\u9875\u6837\u5F0F\u548C\u4EA4\u4E92\u3002", "\u65B0\u589E\uFF5C\u672C\u5730\u7B80\u4F53\u8F6C\u7E41\u4F53\uFF0C\u8BE5\u7248\u672C\u9ED8\u8BA4\u8BD1\u4E3A\u7E41\u4F53\u4E2D\u6587\u3002"]],
    ["1.1.2", "2026-11-13", ["\u4FEE\u590D\uFF5C\u90E8\u5206\u65E7\u6807\u7B7E\u70B9\u51FB\u7FFB\u8BD1\u65E0\u53CD\u9988\uFF0C\u5F39\u7A97\u589E\u52A0\u542F\u52A8\u8FDB\u5EA6\u548C\u8FDE\u63A5\u9519\u8BEF\u63D0\u793A\u3002"]],
    ["1.1.1", "2026-11-13", ["\u4FEE\u590D\uFF5CSafari \u6269\u5C55\u540E\u53F0\u52A0\u8F7D\u5F02\u5E38\uFF0C\u5F71\u54CD\u5F39\u7A97\u548C\u670D\u52A1\u914D\u7F6E\u3002"]],
    ["1.1.0", "2026-11-13", ["\u6539\u8FDB\uFF5C\u670D\u52A1\u5546\u9884\u8BBE\u548C\u6269\u5C55\u754C\u9762\u3002", "\u65B0\u589E\uFF5CmacOS \u62D6\u62FD\u5B89\u88C5\u5305\u3002"]],
    ["1.0.0", "2026-11-13", ["\u521D\u7248\uFF5C\u652F\u6301 Safari \u6574\u9875\u7FFB\u8BD1\u3001\u5212\u8BCD\u7FFB\u8BD1\u548C\u81EA\u5E26\u6A21\u578B API\u3002"]]
  ];
  function element(tag, text) {
    const node = document.createElement(tag);
    node.textContent = text;
    return node;
  }
  function renderProviders() {
    const labels = ["\u83B7\u53D6 Key", "API \u8BA1\u8D39", "\u63A5\u5165\u6587\u6863"];
    for (const [id, urls] of Object.entries(providerDocs)) {
      const { label, model } = PROVIDER_PRESETS[id];
      const row = element("article", "");
      const links = element("p", "");
      for (const [index, url] of urls.entries()) {
        const link = element("a", labels[index]);
        link.href = url;
        link.target = "_blank";
        link.rel = "noreferrer";
        links.append(link);
      }
      row.append(element("h3", label), element("code", model), links);
      el("providerList").append(row);
    }
  }
  function renderReleases() {
    for (const [version, date, changes] of releases) {
      const release = element("article", "");
      release.className = "release";
      release.id = `v${version}`;
      const title = element("h2", "");
      const link = element("a", version);
      link.href = `#updates/${version}`;
      const time = element("time", date.replaceAll("-", "."));
      time.dateTime = date;
      title.append(link, time);
      const list = element("ul", "");
      for (const change of changes) {
        const [label, description] = change.split("\uFF5C");
        const item = element("li", "");
        item.append(element("b", label), description);
        list.append(item);
      }
      release.append(title, list);
      el("timeline").append(release);
    }
  }
  function route() {
    const [destination, version] = location.hash.slice(1).split("/");
    const anchor = Object.prototype.hasOwnProperty.call(anchors, destination) ? destination : "";
    const active = anchor ? anchors[anchor] : pages.includes(destination) ? destination : "home";
    for (const id of pages) el(id).hidden = id !== active;
    for (const link of document.querySelectorAll(".rail a")) {
      if (link.hash === `#${active}`) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    }
    const section = el(anchor || (active === "updates" && version ? `v${version}` : ""));
    if (section) section.scrollIntoView();
    else window.scrollTo(0, 0);
  }
  function initSite() {
    renderProviders();
    renderReleases();
    el("previewMode").addEventListener("change", (event) => {
      el("previewPaper").dataset.display = event.target.value;
    });
    window.addEventListener("hashchange", route);
    route();
  }

  // src/options/options.js
  var el2 = (id) => document.getElementById(id);
  var providerFields = {
    preset: "preset",
    type: "providerType",
    baseUrl: "baseUrl",
    apiKey: "apiKey",
    model: "model",
    temperature: "temperature",
    maxTokens: "maxTokens",
    jsonMode: "jsonMode",
    extraHeaders: "extraHeaders"
  };
  var preferenceFields = {
    targetLang: "targetLang",
    sourceLang: "sourceLang",
    style: "style",
    selectionEnabled: "selection.enabled",
    selectionAuto: "selection.auto",
    autoSites: "autoTranslateSites",
    excludeSites: "excludeSites",
    skipTargetLanguage: "skipTargetLanguagePages",
    sendPageContext: "advanced.sendPageContext",
    glossary: "glossary",
    customPrompt: "customPrompt",
    cacheEnabled: "cache.enabled"
  };
  var saved = mergeSettings({});
  var writes = Promise.resolve();
  var pendingPreferences = 0;
  var connecting = false;
  async function send(message, timeout = 6e4) {
    const response = await sendRuntimeMessage(message, timeout);
    if (!response?.ok) throw new Error(response?.error?.message || response?.error || "\u8BF7\u6C42\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5");
    return response;
  }
  function feedback(id, message, error = false) {
    const node = el2(id);
    node.textContent = message;
    node.toggleAttribute("data-error", error);
  }
  function fillSelect(id, choices) {
    for (const [value, label] of choices) {
      el2(id).add(new Option(label, value));
    }
  }
  function setField(id, value) {
    const field = el2(id);
    if (field.type === "checkbox") field.checked = Boolean(value);
    else field.value = Array.isArray(value) ? value.join("\n") : value;
  }
  function readField(id) {
    const field = el2(id);
    if (field.type === "checkbox") return field.checked;
    if (field.type === "number") return field.valueAsNumber;
    if (id === "autoSites" || id === "excludeSites") return linesToArray(field.value);
    return field.value;
  }
  function readProvider() {
    const provider = Object.fromEntries(
      Object.entries(providerFields).map(([key, id]) => [key, readField(id)])
    );
    return mergeSettings({ provider }).provider;
  }
  function updateConnectionView() {
    const draft = readProvider();
    const requiresKey = providerRequiresKey(draft);
    el2("keyField").hidden = !requiresKey && !draft.apiKey && draft.preset !== "custom";
    el2("providerHint").textContent = draft.preset === "custom" ? "\u8BF7\u5728\u9AD8\u7EA7\u8FDE\u63A5\u53C2\u6570\u4E2D\u586B\u5199\u63A5\u53E3\u534F\u8BAE\u3001API \u5730\u5740\u548C\u6A21\u578B\u540D\u79F0\u3002" : requiresKey ? [
      "API Key \u4FDD\u5B58\u5728\u672C\u673A\uFF0C\u8BF7\u6C42\u76F4\u63A5\u53D1\u7ED9\u6240\u9009\u670D\u52A1\u3002",
      ["qwen", "zhipu", "moonshot"].includes(draft.preset) && PROVIDER_PRESETS[draft.preset].hint
    ].filter(Boolean).join(" ") : "\u8BF7\u5148\u542F\u52A8\u672C\u5730\u6A21\u578B\u670D\u52A1\uFF0C\u518D\u8FDE\u63A5\u3002";
    el2("providerHelp").hidden = !requiresKey;
    const status = el2("providerStatus");
    const same = Object.keys(providerFields).every((key) => draft[key] === saved.provider[key]);
    const ready = same && isProviderConfigured(saved);
    status.textContent = ready ? "\u5DF2\u914D\u7F6E" : "";
    status.toggleAttribute("data-ready", ready);
    if (!connecting) el2("connectLabel").textContent = ready ? "\u91CD\u65B0\u8FDE\u63A5" : "\u8FDE\u63A5\u670D\u52A1";
  }
  function fillProvider(provider) {
    for (const [key, id] of Object.entries(providerFields)) setField(id, provider[key]);
    el2("apiKey").type = "password";
    el2("toggleKey").textContent = "\u663E\u793A";
    updateConnectionView();
  }
  function fillPreferences() {
    for (const [id, path] of Object.entries(preferenceFields)) {
      const [key, subkey] = path.split(".");
      setField(id, subkey ? saved[key][subkey] : saved[key]);
    }
    el2("selectionAuto").disabled = !saved.selection.enabled;
  }
  function selectProvider() {
    const preset = el2("preset").value;
    const { type, baseUrl, model, jsonMode } = PROVIDER_PRESETS[preset];
    const provider = preset === saved.provider.preset ? saved.provider : { ...DEFAULT_SETTINGS.provider, preset, type, baseUrl, model, jsonMode };
    fillProvider(provider);
    el2("apiDetails").open = preset === "custom";
    feedback("connectionResult", "");
  }
  function writeSettings(patch) {
    const request = writes.then(async () => {
      await send({ type: "settings.update", patch });
      const next = { ...saved, ...patch };
      for (const key of ["provider", "selection", "ui", "advanced"]) {
        if (patch[key]) next[key] = { ...saved[key], ...patch[key] };
      }
      saved = mergeSettings(next);
    });
    writes = request.catch(() => {
    });
    return request;
  }
  async function connect(event) {
    event.preventDefault();
    if (connecting) return;
    const provider = readProvider();
    if (providerRequiresKey(provider) && !provider.apiKey) {
      feedback("connectionResult", "\u8BF7\u586B\u5199 API Key\u3002", true);
      el2("apiKey").focus();
      return;
    }
    if (!provider.baseUrl || !provider.model) {
      el2("apiDetails").open = true;
      feedback("connectionResult", "\u8BF7\u586B\u5199 API \u5730\u5740\u548C\u6A21\u578B\u540D\u79F0\u3002", true);
      el2(provider.baseUrl ? "model" : "baseUrl").focus();
      return;
    }
    connecting = true;
    el2("connectionFields").disabled = true;
    el2("connectLabel").textContent = "\u6B63\u5728\u8FDE\u63A5\u2026";
    feedback("connectionResult", "");
    try {
      await send({ type: "api.test", provider, targetLang: el2("targetLang").value }, 1e5);
      await writeSettings({ provider });
      feedback("connectionResult", "\u8FDE\u63A5\u6210\u529F\uFF0C\u5DF2\u4FDD\u5B58\u3002");
    } catch (error) {
      feedback("connectionResult", error.message, true);
    } finally {
      connecting = false;
      el2("connectionFields").disabled = false;
      updateConnectionView();
    }
  }
  async function savePreference(id, path) {
    const [key, subkey] = path.split(".");
    const value = readField(id);
    if (id === "selectionEnabled") el2("selectionAuto").disabled = !value;
    const patch = subkey ? { [key]: { [subkey]: value } } : { [key]: value };
    pendingPreferences += 1;
    feedback("saveState", "\u6B63\u5728\u4FDD\u5B58\u2026");
    try {
      await writeSettings(patch);
      if (pendingPreferences === 1) feedback("saveState", "\u5DF2\u4FDD\u5B58");
    } catch (error) {
      feedback("saveState", error.message, true);
    } finally {
      pendingPreferences -= 1;
    }
  }
  function exportSettings() {
    const { apiKey, extraHeaders, ...provider } = saved.provider;
    const payload = { app: BRAND.english, settings: { ...saved, provider } };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "LikeBird-settings.json";
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1e3);
    feedback("saveState", "\u5DF2\u5BFC\u51FA\u8BBE\u7F6E\u3002");
  }
  async function importSettings(file) {
    if (!file) return;
    const raw = JSON.parse(await file.text());
    const imported = raw?.settings || raw;
    if (!imported || typeof imported !== "object" || Array.isArray(imported)) throw new Error("\u8BF7\u9009\u62E9\u6709\u6548\u7684\u8BBE\u7F6E\u6587\u4EF6\u3002");
    const provider = imported.provider;
    const sameService = provider?.preset === saved.provider.preset && provider?.baseUrl === saved.provider.baseUrl && provider?.type === saved.provider.type;
    const next = mergeSettings({
      ...saved,
      ...imported,
      provider: provider ? { ...provider, apiKey: sameService ? saved.provider.apiKey : "", extraHeaders: sameService ? saved.provider.extraHeaders : "" } : saved.provider
    });
    await writeSettings(next);
    fillProvider(saved.provider);
    fillPreferences();
    feedback("connectionResult", "");
    feedback("saveState", "\u5DF2\u5BFC\u5165\u8BBE\u7F6E\u3002");
  }
  async function runUtility(action) {
    try {
      await action();
    } catch (error) {
      feedback("saveState", error.message, true);
    }
  }
  async function loadForm() {
    el2("retrySettings").hidden = true;
    feedback("settingsLoadStatus", "\u6B63\u5728\u8BFB\u53D6\u8BBE\u7F6E\u2026");
    try {
      saved = mergeSettings((await send({ type: "settings.full" }, 5e3)).settings);
      fillProvider(saved.provider);
      fillPreferences();
      el2("connectionFields").disabled = false;
      el2("readingFields").disabled = false;
      el2("settingsLoad").hidden = true;
    } catch {
      feedback("settingsLoadStatus", "\u65E0\u6CD5\u8BFB\u53D6 \u98DE\u8BD1\u8BBE\u7F6E\u3002\u8BF7\u91CD\u8BD5\uFF0C\u6216\u5728 Safari \u7684\u6269\u5C55\u8BBE\u7F6E\u4E2D\u91CD\u65B0\u542F\u7528\u98DE\u8BD1\u3002", true);
      el2("retrySettings").hidden = false;
    }
  }
  function init() {
    fillSelect("preset", Object.entries(PROVIDER_PRESETS).map(([key, value]) => [key, value.label]));
    fillSelect("targetLang", TARGET_LANGUAGES.map(({ code, label }) => [code, label]));
    fillSelect("sourceLang", SOURCE_LANGUAGES.map(({ code, label }) => [code, label]));
    fillSelect("style", STYLE_OPTIONS.map(({ value, label }) => [value, label]));
    el2("version").textContent = BRAND.version;
    el2("retrySettings").addEventListener("click", loadForm);
    loadForm();
    el2("connection").addEventListener("submit", connect);
    el2("preset").addEventListener("change", selectProvider);
    for (const id of Object.values(providerFields).filter((id2) => id2 !== "preset")) {
      el2(id).addEventListener("input", () => {
        feedback("connectionResult", "");
        updateConnectionView();
      });
    }
    el2("toggleKey").addEventListener("click", () => {
      const show = el2("apiKey").type === "password";
      el2("apiKey").type = show ? "text" : "password";
      el2("toggleKey").textContent = show ? "\u9690\u85CF" : "\u663E\u793A";
    });
    for (const [id, path] of Object.entries(preferenceFields)) {
      el2(id).addEventListener("change", () => savePreference(id, path));
    }
    el2("clearCache").addEventListener("click", () => runUtility(async () => {
      if (!window.confirm("\u6E05\u9664\u672C\u673A\u7FFB\u8BD1\u7F13\u5B58\uFF1F")) return;
      await send({ type: "cache.clear" });
      feedback("saveState", "\u5DF2\u6E05\u9664\u7FFB\u8BD1\u7F13\u5B58\u3002");
    }));
    el2("exportSettings").addEventListener("click", exportSettings);
    el2("importSettings").addEventListener("click", () => el2("importFile").click());
    el2("importFile").addEventListener("change", (event) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      runUtility(() => importSettings(file));
    });
    el2("resetSettings").addEventListener("click", () => runUtility(async () => {
      if (!window.confirm("\u6062\u590D\u9ED8\u8BA4\u8BBE\u7F6E\u5E76\u79FB\u9664\u5DF2\u4FDD\u5B58\u7684 API Key\uFF1F")) return;
      await writeSettings(mergeSettings({}));
      fillProvider(saved.provider);
      fillPreferences();
      feedback("connectionResult", "");
      feedback("saveState", "\u5DF2\u6062\u590D\u9ED8\u8BA4\u8BBE\u7F6E\u3002");
    }));
  }
  initSite();
  init();
})();
