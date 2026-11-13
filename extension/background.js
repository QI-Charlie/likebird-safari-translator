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
  var CACHE_STORAGE_KEY = "yiliuTranslationCacheV1";
  var SETTINGS_STORAGE_KEY = "yiliuSettingsV1";
  function languageName(code) {
    if (!code) return "the target language";
    const target = TARGET_LANGUAGES.find((item) => item.code === code);
    if (target) return target.english;
    const source = SOURCE_LANGUAGES.find((item) => item.code === code);
    if (source) return source.label;
    return code;
  }

  // src/shared/utils.js
  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  function hashText(value) {
    const text = String(value);
    let h1 = 2166136261;
    let h2 = 16777619;
    for (let index = 0; index < text.length; index += 1) {
      const code = text.charCodeAt(index);
      h1 ^= code;
      h1 = Math.imul(h1, 16777619);
      h2 = Math.imul(h2 ^ code, 2246822507);
    }
    return `${(h1 >>> 0).toString(36)}${(h2 >>> 0).toString(36)}${text.length.toString(36)}`;
  }
  function normalizeSpace(value) {
    return String(value ?? "").replace(/\u00a0/g, " ").replace(/[\t\f\v ]+/g, " ").replace(/ *\n */g, " ").replace(/\s{2,}/g, " ").trim();
  }
  function squish(value, max = 200) {
    const text = normalizeSpace(value);
    if (text.length <= max) return text;
    return `${text.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
  }
  function stripCodeFence(value) {
    let text = String(value ?? "").trim();
    text = text.replace(/^```[a-zA-Z0-9_-]*\s*\n?/, "").replace(/\n?```\s*$/, "");
    return text.trim();
  }
  function truncate(value, max) {
    const text = String(value ?? "");
    return text.length > max ? `${text.slice(0, max - 1)}…` : text;
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
  function publicSettings(settings) {
    const full = mergeSettings(settings);
    const { apiKey, ...safeProvider } = full.provider;
    return {
      ...full,
      provider: {
        ...safeProvider,
        apiKeySet: Boolean(apiKey),
        requiresKey: providerRequiresKey(full.provider)
      },
      configured: isProviderConfigured(full)
    };
  }
  function providerConfigFromForm(input) {
    return {
      preset: String(input.preset || "custom"),
      type: PROVIDER_TYPES.has(input.type) ? input.type : "openai",
      baseUrl: String(input.baseUrl || "").trim(),
      apiKey: String(input.apiKey || "").trim(),
      model: String(input.model || "").trim(),
      temperature: clamp(Number(input.temperature) || 0.2, 0, 1.5),
      maxTokens: Math.round(clamp(Number(input.maxTokens) || 4096, 128, 32e3)),
      jsonMode: Boolean(input.jsonMode),
      extraHeaders: String(input.extraHeaders || "")
    };
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
  async function storageGet(keys) {
    const api2 = extensionApi();
    if (!api2?.storage?.local) throw new Error("扩展存储不可用");
    return callApi(api2.storage.local, "get", [keys], { timeoutMs: 15e3 });
  }
  async function storageSet(values) {
    const api2 = extensionApi();
    if (!api2?.storage?.local) throw new Error("扩展存储不可用");
    return callApi(api2.storage.local, "set", [values], { timeoutMs: 15e3 });
  }
  async function storageRemove(keys) {
    const api2 = extensionApi();
    if (!api2?.storage?.local) throw new Error("扩展存储不可用");
    return callApi(api2.storage.local, "remove", [keys], { timeoutMs: 15e3 });
  }
  async function loadSettings() {
    const data = await storageGet(SETTINGS_STORAGE_KEY);
    return mergeSettings(data?.[SETTINGS_STORAGE_KEY]);
  }
  async function saveSettings(settings) {
    const clean = mergeSettings(settings);
    await storageSet({ [SETTINGS_STORAGE_KEY]: clean });
    return clean;
  }

  // src/background/prompt.js
  var TOKEN_RULE = [
    "Inline markers such as <x0> and </x0> are placeholders for links, emphasis, or code.",
    "Preserve every marker exactly, including its number, and keep pairs balanced.",
    "Never translate, renumber, drop, or duplicate a marker. Move a marker pair around the corresponding translated phrase when word order changes.",
    "Do not output any other HTML tags."
  ].join(" ");
  function stylePrompt(settings) {
    return STYLE_OPTIONS.find((item) => item.value === settings.style)?.prompt || STYLE_OPTIONS[0].prompt;
  }
  function parseGlossary(raw) {
    return String(raw || "").split(/\r?\n/).map((line) => line.trim()).filter((line) => line && !line.startsWith("#")).map((line) => {
      const match = line.match(/^(.+?)\s*(?:=>|=|＝|→)\s*(.+)$/);
      if (!match) return null;
      const source = match[1].trim();
      const target = match[2].trim();
      if (!source || !target) return null;
      return { source, target };
    }).filter(Boolean).slice(0, 200);
  }
  function glossaryBlock(settings) {
    const entries = parseGlossary(settings.glossary);
    if (!entries.length) return "";
    return `
Glossary (use these exact translations when the term appears):
${entries.map((entry) => `- ${entry.source} => ${entry.target}`).join("\n")}`;
  }
  function customInstruction(settings) {
    const prompt = String(settings.customPrompt || "").trim();
    if (!prompt) return "";
    return `
Additional user instruction (follow it unless it conflicts with the output format):
${truncate(prompt, 2e3)}`;
  }
  function pageContext(settings, context) {
    if (!settings.advanced?.sendPageContext) return null;
    let host = "";
    try {
      host = context?.url ? new URL(context.url).hostname : "";
    } catch {
      host = "";
    }
    return {
      title: truncate(context?.title || "", 200),
      site: host
    };
  }
  function buildBatchMessages(items, settings, context = {}) {
    const target = languageName(settings.targetLang);
    const source = settings.sourceLang && settings.sourceLang !== "auto" ? languageName(settings.sourceLang) : "the source language, detected automatically";
    const system = `You are the translation engine inside a browser extension called 译流 (YiLiu). You translate web pages from ${source} into ${target}.

Translation requirements:
- ${stylePrompt(settings)}
- Translate meaning, not words. Produce fluent ${target} prose with natural punctuation.
- Keep numbers, URLs, email addresses, code identifiers, and product names intact.
- Do not summarize, explain, answer, or censor the content. Translate it.
- ${TOKEN_RULE}
- Return valid JSON only, with this exact shape: {"translations":[{"id":"<item id>","text":"<translated text>"}]}
- Include one object for every input item, in the same order. Do not wrap the JSON in Markdown fences and do not add commentary.${glossaryBlock(settings)}${customInstruction(settings)}`;
    const payload = {
      task: "translate_blocks",
      target_language: target,
      ...pageContext(settings, context) ? { page: pageContext(settings, context) } : {},
      items: items.map((item) => ({ id: item.id, text: item.text }))
    };
    return [
      { role: "system", content: system },
      { role: "user", content: JSON.stringify(payload) }
    ];
  }
  function buildSelectionMessages(text, settings, context = {}) {
    const target = languageName(settings.targetLang);
    const source = settings.sourceLang && settings.sourceLang !== "auto" ? languageName(settings.sourceLang) : "the source language, detected automatically";
    const system = `You are a precise translator inside a browser reading assistant. Translate the selected passage from ${source} into ${target}.

Rules:
- ${stylePrompt(settings)}
- Preserve paragraph breaks, numbers, names, code, and punctuation conventions of ${target}.
- If the selection is already in ${target}, return it unchanged.
- Output ONLY the translation. No labels, quotes, Markdown, explanations, or notes.${glossaryBlock(settings)}${customInstruction(settings)}`;
    const contextBefore = squish(context.before || "", 500);
    const contextAfter = squish(context.after || "", 500);
    const contextPayload = {
      ...context.title ? { page_title: truncate(context.title, 180) } : {},
      ...contextBefore ? { text_before_selection: contextBefore } : {},
      ...contextAfter ? { text_after_selection: contextAfter } : {}
    };
    const user = {
      selected_text: text,
      ...Object.keys(contextPayload).length ? { context: contextPayload } : {}
    };
    return [
      { role: "system", content: system },
      { role: "user", content: JSON.stringify(user) }
    ];
  }
  function buildConnectionMessages(targetLang = "zh-CN") {
    return [
      {
        role: "system",
        content: `You are a translation API health check. Translate the word "Hello" into ${languageName(
          targetLang
        )}. Output only the translation, with no quotes or explanation.`
      },
      { role: "user", content: "Hello" }
    ];
  }
  function extractBalancedJson(input) {
    const text = stripCodeFence(input);
    for (let start = 0; start < text.length; start += 1) {
      const first = text[start];
      if (first !== "{" && first !== "[") continue;
      const open = first;
      const close = first === "{" ? "}" : "]";
      let depth = 0;
      let inString = false;
      let escaped = false;
      for (let index = start; index < text.length; index += 1) {
        const char = text[index];
        if (inString) {
          if (escaped) escaped = false;
          else if (char === "\\") escaped = true;
          else if (char === '"') inString = false;
          continue;
        }
        if (char === '"') {
          inString = true;
          continue;
        }
        if (char === open) depth += 1;
        else if (char === close) {
          depth -= 1;
          if (depth === 0) {
            const candidate = text.slice(start, index + 1);
            try {
              return JSON.parse(candidate);
            } catch {
              break;
            }
          }
        }
      }
    }
    return null;
  }
  function normalizeEntry(entry) {
    if (!entry || typeof entry !== "object") return null;
    const id = String(entry.id ?? entry.item_id ?? entry.key ?? "").trim();
    const text = entry.text ?? entry.translation ?? entry.translated ?? entry.translated_text ?? entry.content ?? entry.value;
    if (!id || typeof text !== "string") return null;
    return { id, text: text.trim() };
  }
  function entriesFromParsed(parsed) {
    if (!parsed) return [];
    let list = [];
    if (Array.isArray(parsed)) list = parsed;
    else if (Array.isArray(parsed.translations)) list = parsed.translations;
    else if (Array.isArray(parsed.items)) list = parsed.items;
    else if (Array.isArray(parsed.results)) list = parsed.results;
    else if (parsed.translations && typeof parsed.translations === "object") {
      list = Object.entries(parsed.translations).map(([id, text]) => ({ id, text }));
    } else if (typeof parsed === "object") {
      const keys = Object.keys(parsed);
      if (keys.length && keys.every((key) => typeof parsed[key] === "string")) {
        list = keys.map((key) => ({ id: key, text: parsed[key] }));
      }
    }
    return list.map(normalizeEntry).filter(Boolean);
  }
  function cleanPlainTranslation(value) {
    return stripCodeFence(value).replace(/^(?:翻译|译文|translation|translated text)\s*[:：]\s*/i, "").trim().replace(/^["“](.*)["”]$/s, "$1").trim();
  }
  function parseLineFormat(text, expectedIds) {
    const map = /* @__PURE__ */ new Map();
    for (const id of expectedIds) {
      const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const pattern = new RegExp(
        `(?:^|\\n)\\s*(?:【|\\[)?${escaped}(?:】|\\])?\\s*[:：\\-]\\s*([^\\n]+)`,
        "i"
      );
      const match = text.match(pattern);
      if (match?.[1]?.trim()) map.set(id, match[1].trim());
    }
    return map;
  }
  function parseBatchResponse(raw, expectedIds = []) {
    const text = stripCodeFence(String(raw ?? "").trim());
    const expected = [...new Set(expectedIds.map(String))];
    const translations = /* @__PURE__ */ new Map();
    const parsed = extractBalancedJson(text);
    const entries = entriesFromParsed(parsed);
    for (const entry of entries) {
      if (!entry.text) continue;
      if (!expected.length || expected.includes(entry.id)) {
        translations.set(entry.id, entry.text);
      }
    }
    if (!translations.size && Array.isArray(parsed) && parsed.every((item) => typeof item === "string")) {
      parsed.forEach((value, index) => {
        const id = expected[index];
        if (id && value.trim()) translations.set(id, value.trim());
      });
    }
    if (!translations.size && expected.length) {
      for (const [id, value] of parseLineFormat(text, expected)) translations.set(id, value);
    }
    if (!translations.size && expected.length === 1) {
      const plain = cleanPlainTranslation(text);
      if (plain && !/^[{[]/.test(plain)) translations.set(expected[0], plain);
    }
    const missing = expected.filter((id) => !translations.has(id));
    return { translations, missing, raw: text };
  }
  function parseSelectionResponse(raw) {
    const text = stripCodeFence(String(raw ?? "").trim());
    const withoutLabel = text.replace(/^(?:翻译|译文|translation|translated text)\s*[:：]\s*/i, "").trim();
    return withoutLabel.replace(/^["“](.*)["”]$/s, "$1").trim();
  }

  // src/background/api.js
  var ApiError = class extends Error {
    /**
     * @param {string} message
     * @param {string} code
     * @param {{status?: number, retryable?: boolean, details?: string}} [options]
     */
    constructor(message, code = "API_ERROR", options = {}) {
      super(message);
      this.name = "ApiError";
      this.code = code;
      this.status = options.status;
      this.retryable = Boolean(options.retryable);
      this.details = options.details || "";
    }
  };
  var RETRYABLE_STATUS = /* @__PURE__ */ new Set([408, 409, 425, 429, 500, 502, 503, 504]);
  function normalizeBaseUrl(baseUrl) {
    return String(baseUrl || "").trim().replace(/\/+$/, "");
  }
  function endpointFor(provider) {
    const base = normalizeBaseUrl(provider.baseUrl);
    if (!base) throw new ApiError("请填写 API 地址", "CONFIG", {});
    if (provider.type === "anthropic") {
      return /\/messages$/i.test(base) ? base : `${base}/messages`;
    }
    return /\/chat\/completions$/i.test(base) ? base : `${base}/chat/completions`;
  }
  function parseExtraHeaders(raw) {
    const headers = {};
    for (const line of String(raw || "").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const colon = trimmed.indexOf(":");
      if (colon <= 0) continue;
      const name = trimmed.slice(0, colon).trim();
      const value = trimmed.slice(colon + 1).trim();
      if (!/^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/.test(name)) continue;
      headers[name] = value;
    }
    return headers;
  }
  function headersFor(provider) {
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json"
    };
    if (provider.type === "anthropic") {
      if (provider.apiKey) headers["x-api-key"] = provider.apiKey;
      headers["anthropic-version"] = "2023-06-01";
      headers["anthropic-dangerous-direct-browser-access"] = "true";
    } else if (provider.apiKey) {
      headers.Authorization = `Bearer ${provider.apiKey}`;
    }
    return { ...headers, ...parseExtraHeaders(provider.extraHeaders) };
  }
  function bodyFor(provider, messages, { jsonMode, maxTokens, temperature }) {
    if (provider.type === "anthropic") {
      const system = messages.filter((message) => message.role === "system").map((message) => message.content).join("\n\n");
      return {
        model: provider.model,
        max_tokens: maxTokens,
        temperature,
        system,
        messages: messages.filter((message) => message.role !== "system").map((message) => ({ role: message.role, content: message.content }))
      };
    }
    const body = {
      model: provider.model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: false
    };
    if (jsonMode) body.response_format = { type: "json_object" };
    return body;
  }
  function extractText(data, type) {
    if (!data || typeof data !== "object") return "";
    if (type === "anthropic") {
      if (Array.isArray(data.content)) {
        return data.content.filter((part) => part && part.type === "text" && typeof part.text === "string").map((part) => part.text).join("\n").trim();
      }
      return "";
    }
    const choice = data.choices?.[0];
    const content = choice?.message?.content ?? choice?.text;
    if (typeof content === "string") return content.trim();
    if (Array.isArray(content)) {
      return content.map((part) => typeof part === "string" ? part : part?.text || "").join("").trim();
    }
    return "";
  }
  function errorFromResponse(status, data, rawText) {
    const providerMessage = data?.error?.message || data?.message || data?.error || (typeof rawText === "string" ? truncate(rawText, 300) : "");
    const suffix = providerMessage ? `：${providerMessage}` : "";
    if (status === 401 || status === 403) {
      return new ApiError(`API Key 无效或没有权限${suffix}`, "AUTH", {
        status,
        retryable: false
      });
    }
    if (status === 404) {
      return new ApiError(`接口或模型不存在，请检查 API 地址和模型名${suffix}`, "NOT_FOUND", {
        status,
        retryable: false
      });
    }
    if (status === 429) {
      return new ApiError(`请求过于频繁或额度不足${suffix}`, "RATE_LIMIT", {
        status,
        retryable: true
      });
    }
    if (status === 400 || status === 422) {
      return new ApiError(`请求参数被服务商拒绝${suffix}`, "BAD_REQUEST", {
        status,
        retryable: false,
        details: providerMessage
      });
    }
    if (RETRYABLE_STATUS.has(status)) {
      return new ApiError(`翻译服务暂时不可用（HTTP ${status}）${suffix}`, "SERVER", {
        status,
        retryable: true
      });
    }
    return new ApiError(`翻译服务返回错误（HTTP ${status}）${suffix}`, "HTTP_ERROR", {
      status,
      retryable: false
    });
  }
  function retryAfterMs(response) {
    const value = response.headers.get("retry-after");
    if (!value) return 0;
    const seconds = Number(value);
    if (Number.isFinite(seconds)) return Math.max(0, Math.min(seconds * 1e3, 1e4));
    const date = Date.parse(value);
    return Number.isFinite(date) ? Math.max(0, Math.min(date - Date.now(), 1e4)) : 0;
  }
  async function requestOnce(provider, messages, options) {
    const endpoint = endpointFor(provider);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs);
    const started = Date.now();
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: headersFor(provider),
        body: JSON.stringify(bodyFor(provider, messages, options)),
        signal: controller.signal,
        credentials: "omit",
        cache: "no-store"
      });
      const rawText = await response.text();
      let data = null;
      try {
        data = rawText ? JSON.parse(rawText) : null;
      } catch {
        data = null;
      }
      if (!response.ok) {
        const error = errorFromResponse(response.status, data, rawText);
        error.retryAfter = retryAfterMs(response);
        throw error;
      }
      if (!data) {
        throw new ApiError("翻译服务返回了空响应或非 JSON 内容", "BAD_RESPONSE", {
          retryable: true
        });
      }
      const text = extractText(data, provider.type);
      if (!text) {
        throw new ApiError("模型返回了空译文，请检查模型名或降低参数", "EMPTY", {
          retryable: true
        });
      }
      return {
        text,
        usage: data.usage || null,
        latencyMs: Date.now() - started,
        response: data
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (error?.name === "AbortError") {
        throw new ApiError(`请求超时（${Math.round(options.timeoutMs / 1e3)} 秒）`, "TIMEOUT", {
          retryable: true
        });
      }
      throw new ApiError(
        `无法连接翻译服务：${truncate(error?.message || "网络错误", 240)}。请检查 API 地址、网络或代理设置。`,
        "NETWORK",
        { retryable: true }
      );
    } finally {
      clearTimeout(timeout);
    }
  }
  async function callModel(provider, messages, options) {
    const merged = {
      jsonMode: Boolean(options.jsonMode),
      maxTokens: options.maxTokens || 2048,
      temperature: Number.isFinite(options.temperature) ? options.temperature : 0.2,
      timeoutMs: options.timeoutMs || 6e4
    };
    let lastError = null;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        return await requestOnce(provider, messages, merged);
      } catch (error) {
        lastError = error;
        if (merged.jsonMode && error.code === "BAD_REQUEST" && /response_format|json mode|json_object/i.test(error.details || error.message)) {
          merged.jsonMode = false;
          attempt -= 1;
          continue;
        }
        if (!error.retryable || attempt >= 2) break;
        const wait = error.retryAfter || 600 * 2 ** attempt + Math.random() * 250;
        await sleep(wait);
      }
    }
    throw lastError;
  }
  function getProviderValidationError(provider) {
    if (!provider) return "缺少翻译服务配置";
    if (!provider.baseUrl) return "请填写 API 地址";
    try {
      const url = new URL(provider.baseUrl);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        return "API 地址必须以 http:// 或 https:// 开头";
      }
    } catch {
      return "API 地址格式不正确";
    }
    if (!provider.model) return "请填写模型名称";
    if (providerRequiresKey(provider) && !provider.apiKey) {
      return "请填写 API Key（本地模型可留空）";
    }
    return "";
  }
  function assertProvider(provider) {
    const error = getProviderValidationError(provider);
    if (error) {
      throw new ApiError(error, error.includes("API Key") ? "NO_API_KEY" : "CONFIG");
    }
  }
  async function translateBatch({ items, settings, context = {} }) {
    const provider = providerConfigFromForm(settings.provider);
    assertProvider(provider);
    if (!items.length) return { translations: {}, errors: [], usage: null };
    const messages = buildBatchMessages(items, settings, context);
    const result = await callModel(provider, messages, {
      jsonMode: provider.type === "openai" && provider.jsonMode,
      maxTokens: provider.maxTokens,
      temperature: provider.temperature,
      timeoutMs: settings.advanced.timeoutMs
    });
    const parsed = parseBatchResponse(
      result.text,
      items.map((item) => item.id)
    );
    const translations = Object.fromEntries(parsed.translations);
    let missing = items.filter((item) => !translations[item.id]);
    if (missing.length && missing.length < items.length && missing.length <= 6) {
      try {
        const repairMessages = buildBatchMessages(missing, settings, context);
        const repaired = await callModel(provider, repairMessages, {
          jsonMode: provider.type === "openai" && provider.jsonMode,
          maxTokens: provider.maxTokens,
          temperature: provider.temperature,
          timeoutMs: settings.advanced.timeoutMs
        });
        const repairedParsed = parseBatchResponse(
          repaired.text,
          missing.map((item) => item.id)
        );
        for (const [id, text] of repairedParsed.translations) translations[id] = text;
        missing = items.filter((item) => !translations[item.id]);
      } catch {
      }
    }
    const errors = missing.map((item) => ({
      id: item.id,
      code: "PARSE",
      message: "模型没有返回这一段的译文，可单独重试"
    }));
    return {
      translations,
      errors,
      usage: result.usage,
      latencyMs: result.latencyMs
    };
  }
  async function translateSelection({ text, settings, context = {} }) {
    const provider = providerConfigFromForm(settings.provider);
    assertProvider(provider);
    const messages = buildSelectionMessages(text, settings, context);
    const result = await callModel(provider, messages, {
      jsonMode: false,
      maxTokens: Math.min(provider.maxTokens, 2048),
      temperature: provider.temperature,
      timeoutMs: settings.advanced.timeoutMs
    });
    const translation = parseSelectionResponse(result.text);
    if (!translation) {
      throw new ApiError("模型没有返回译文，请重试", "EMPTY", { retryable: true });
    }
    return {
      translation,
      usage: result.usage,
      latencyMs: result.latencyMs
    };
  }
  async function testProvider(providerInput, targetLang = "zh-CN") {
    const provider = providerConfigFromForm(providerInput);
    assertProvider(provider);
    const started = Date.now();
    const messages = buildConnectionMessages(targetLang);
    const result = await callModel(provider, messages, {
      jsonMode: false,
      maxTokens: 64,
      temperature: 0,
      timeoutMs: 3e4
    });
    return {
      ok: true,
      latencyMs: Date.now() - started,
      sample: truncate(result.text.replace(/\s+/g, " ").trim(), 80),
      model: provider.model,
      endpoint: endpointFor(provider),
      local: isLikelyLocalUrl(provider.baseUrl)
    };
  }
  function apiErrorPayload(error) {
    if (error instanceof ApiError) {
      return {
        code: error.code,
        message: error.message,
        status: error.status || null,
        retryable: error.retryable
      };
    }
    return {
      code: "UNKNOWN",
      message: error?.message || "翻译失败",
      status: null,
      retryable: false
    };
  }

  // src/background/cache.js
  function cacheKey(text, settings) {
    return hashText(
      [
        text,
        settings.targetLang,
        settings.sourceLang,
        settings.style,
        settings.provider.baseUrl,
        settings.provider.model,
        settings.glossary,
        settings.customPrompt
      ].join("\0")
    );
  }
  var TranslationCache = class {
    constructor() {
      this.entries = /* @__PURE__ */ new Map();
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
        if (stored?.entries && typeof stored.entries === "object") {
          for (const [key, value] of Object.entries(stored.entries)) {
            if (value && typeof value.text === "string" && Number.isFinite(value.at)) {
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
    get(text, settings) {
      if (!settings.cache.enabled) return null;
      const key = cacheKey(text, settings);
      const entry = this.entries.get(key);
      if (!entry) return null;
      entry.at = Date.now();
      return entry.text;
    }
    set(text, translation, settings) {
      if (!settings.cache.enabled || !translation) return;
      const key = cacheKey(text, settings);
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
            savedAt: Date.now()
          }
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
      }
    }
    get size() {
      return this.entries.size;
    }
  };

  // src/background/index.js
  var api = extensionApi();
  var cache = new TranslationCache();
  var cachedSettings = null;
  var MENU_PAGE = "yiliu-translate-page";
  var MENU_SELECTION = "yiliu-translate-selection";
  var MENU_RESTORE = "yiliu-restore-page";
  function log(...args) {
    console.info("[译流]", ...args);
  }
  function isExtensionPage(sender) {
    if (!sender) return true;
    const urls = [sender.url, sender.tab?.url].filter(Boolean).map(String);
    if (!urls.length) return true;
    return urls.some((url) => {
      if (/^(?:safari-web-extension|chrome-extension|moz-extension|safari-extension):/i.test(url)) {
        return true;
      }
      try {
        return url.startsWith(api.runtime.getURL(""));
      } catch {
        return false;
      }
    });
  }
  async function getSettings() {
    if (!cachedSettings) cachedSettings = await loadSettings();
    return cachedSettings;
  }
  function mergePatch(current, patch) {
    const next = JSON.parse(JSON.stringify(current));
    if (!patch || typeof patch !== "object") return next;
    for (const key of Object.keys(patch)) {
      if (!(key in next)) continue;
      const value = patch[key];
      if (key === "provider" || key === "selection" || key === "cache" || key === "batch" || key === "ui" || key === "advanced") {
        if (value && typeof value === "object") next[key] = { ...next[key], ...value };
      } else {
        next[key] = value;
      }
    }
    return next;
  }
  async function broadcastSettings(settings) {
    const safe = publicSettings(settings);
    try {
      const tabs = await callApi(api.tabs, "query", [{}], { timeoutMs: 1e4 });
      await Promise.all(
        tabs.map(async (tab) => {
          if (!tab.id) return;
          try {
            await callApi(
              api.tabs,
              "sendMessage",
              [tab.id, { type: "settings.changed", settings: safe }],
              { timeoutMs: 1e4 }
            );
          } catch {
          }
        })
      );
    } catch {
    }
  }
  function setBadge(tabId, text, color = "#a060f0") {
    if (!tabId || !api.browserAction) return;
    try {
      const promise = api.browserAction.setBadgeText({ tabId, text });
      if (promise?.catch) promise.catch(() => {
      });
      const colorPromise = api.browserAction.setBadgeBackgroundColor({ tabId, color });
      if (colorPromise?.catch) colorPromise.catch(() => {
      });
    } catch {
    }
  }
  async function getActiveTab() {
    const tabs = await callApi(api.tabs, "query", [{ active: true, currentWindow: true }]);
    return tabs?.[0] || null;
  }
  async function sendToTab(tabId, message, frameId = 0) {
    try {
      return await callApi(api.tabs, "sendMessage", [tabId, message, { frameId }], {
        timeoutMs: 3e4
      });
    } catch (error) {
      if (frameId !== void 0) {
        return callApi(api.tabs, "sendMessage", [tabId, message], { timeoutMs: 3e4 });
      }
      throw error;
    }
  }
  async function ensureContentScript(tabId) {
    for (let attempt = 0; attempt < 4; attempt += 1) {
      try {
        await sendToTab(tabId, { type: "page.ping" });
        return;
      } catch {
        await sleep(60);
      }
    }
    try {
      await callApi(api.tabs, "insertCSS", [tabId, { file: "content.css" }], {
        timeoutMs: 15e3
      });
    } catch {
    }
    await callApi(
      api.tabs,
      "executeScript",
      [tabId, { file: "content.js", runAt: "document_idle" }],
      { timeoutMs: 15e3 }
    );
    for (let attempt = 0; attempt < 10; attempt += 1) {
      await sleep(70);
      try {
        await sendToTab(tabId, { type: "page.ping" });
        return;
      } catch {
      }
    }
  }
  async function dispatchPageCommand(command, tabId, payload = {}) {
    const tab = tabId ? await callApi(api.tabs, "get", [tabId]) : await getActiveTab();
    if (!tab?.id) throw new Error("找不到当前标签页");
    await ensureContentScript(tab.id);
    await sendToTab(tab.id, { type: `page.${command}`, ...payload }, 0);
    return { ok: true, tabId: tab.id };
  }
  async function translateBatchMessage(message) {
    const settings = await getSettings();
    if (!isProviderConfigured(settings)) {
      throw new ApiError("请先在译流设置中配置翻译服务", "NO_API_KEY");
    }
    cache.configure(settings);
    await cache.load();
    const rawItems = Array.isArray(message.items) ? message.items : [];
    if (!rawItems.length) return { ok: true, translations: {}, errors: [], cached: 0 };
    if (rawItems.length > LIMITS.maxBatchItems) {
      throw new ApiError(`一次最多翻译 ${LIMITS.maxBatchItems} 段`, "BAD_REQUEST");
    }
    const items = [];
    for (const raw of rawItems) {
      const id = String(raw?.id || "").trim();
      const text = String(raw?.text || "").trim();
      if (!id || !text) continue;
      if (text.length > LIMITS.maxBlockChars) {
        throw new ApiError(`单段文本超过 ${LIMITS.maxBlockChars} 字符`, "TOO_LONG");
      }
      items.push({ id, text });
    }
    const translations = {};
    const errors = [];
    const misses = [];
    for (const item of items) {
      const hit = cache.get(item.text, settings);
      if (hit) translations[item.id] = hit;
      else misses.push(item);
    }
    let usage = null;
    let latencyMs = 0;
    if (misses.length) {
      const result = await translateBatch({
        items: misses,
        settings,
        context: message.context || {}
      });
      Object.assign(translations, result.translations);
      errors.push(...result.errors);
      usage = result.usage || null;
      latencyMs = result.latencyMs || 0;
      for (const item of misses) {
        if (result.translations[item.id]) cache.set(item.text, result.translations[item.id], settings);
      }
      await cache.persist();
    }
    return {
      ok: true,
      translations,
      errors,
      cached: items.length - misses.length,
      usage,
      latencyMs
    };
  }
  async function translateSelectionMessage(message) {
    const settings = await getSettings();
    if (!isProviderConfigured(settings)) {
      throw new ApiError("请先在译流设置中配置翻译服务", "NO_API_KEY");
    }
    const text = String(message.text || "").trim();
    if (!text) throw new ApiError("没有选中文字", "EMPTY_SELECTION");
    if (text.length > LIMITS.maxSelectionChars) {
      throw new ApiError(`选中文字过长，最多 ${LIMITS.maxSelectionChars} 字符`, "TOO_LONG");
    }
    cache.configure(settings);
    await cache.load();
    const hit = cache.get(text, settings);
    if (hit) {
      return { ok: true, translation: hit, cached: true, latencyMs: 0 };
    }
    const result = await translateSelection({
      text,
      settings,
      context: message.context || {}
    });
    cache.set(text, result.translation, settings);
    await cache.persist();
    return {
      ok: true,
      translation: result.translation,
      cached: false,
      usage: result.usage,
      latencyMs: result.latencyMs
    };
  }
  async function handleSettingsUpdate(message, sender) {
    if (!isExtensionPage(sender)) throw new ApiError("网页不能修改扩展设置", "FORBIDDEN");
    const current = await getSettings();
    const next = mergeSettings(mergePatch(current, message.patch || message.settings || {}));
    cachedSettings = await saveSettings(next);
    await broadcastSettings(cachedSettings);
    return { ok: true, settings: publicSettings(cachedSettings) };
  }
  async function handleMessage(message, sender) {
    switch (message?.type) {
      case "settings.get":
        return { ok: true, settings: publicSettings(await getSettings()) };
      case "settings.full": {
        if (!isExtensionPage(sender)) throw new ApiError("网页不能读取完整设置", "FORBIDDEN");
        return { ok: true, settings: await getSettings() };
      }
      case "settings.update":
        return handleSettingsUpdate(message, sender);
      case "translate.batch":
        return translateBatchMessage(message);
      case "translate.selection":
        return translateSelectionMessage(message);
      case "api.test": {
        if (!isExtensionPage(sender)) throw new ApiError("网页不能测试 API", "FORBIDDEN");
        const provider = message.provider || (await getSettings()).provider;
        const targetLang = message.targetLang || (await getSettings()).targetLang;
        const result = await testProvider(provider, targetLang);
        return { ok: true, result };
      }
      case "cache.clear":
        await cache.load();
        await cache.clear();
        return { ok: true };
      case "cache.stats":
        await cache.load();
        return { ok: true, size: cache.size };
      case "options.open":
        if (api.runtime.openOptionsPage) {
          const opened = api.runtime.openOptionsPage();
          if (opened?.then) await opened;
        } else {
          await callApi(api.tabs, "create", [{ url: api.runtime.getURL("options.html") }]);
        }
        return { ok: true };
      case "page.command":
        return dispatchPageCommand(message.command, message.tabId, message.payload || {});
      case "page.status": {
        const tab = message.tabId ? await callApi(api.tabs, "get", [message.tabId]) : await getActiveTab();
        if (!tab?.id) return { ok: false, error: "找不到当前标签页" };
        try {
          const status = await sendToTab(tab.id, { type: "page.status" }, 0);
          return { ok: true, status };
        } catch {
          return { ok: false, unsupported: true, error: "此页面无法使用译流" };
        }
      }
      case "page.report":
        if (sender?.tab?.id && (!sender.frameId || sender.frameId === 0)) {
          if (message.state === "translating") setBadge(sender.tab.id, "…", "#111111");
          else if (message.state === "done") setBadge(sender.tab.id, "译", "#a060f0");
          else if (message.state === "error") setBadge(sender.tab.id, "!", "#b42318");
          else if (message.state === "restored") setBadge(sender.tab.id, "");
        }
        return { ok: true };
      case "page.ping":
        return { ok: true, pong: true };
      case "diagnostics": {
        const settings = await getSettings();
        return {
          ok: true,
          configured: isProviderConfigured(settings),
          cacheSize: cache.size,
          version: api.runtime.getManifest().version
        };
      }
      default:
        return { ok: false, error: `未知消息：${message?.type || ""}` };
    }
  }
  async function createContextMenus() {
    if (!api.contextMenus) return;
    try {
      const removal = api.contextMenus.removeAll();
      if (removal?.then) await removal;
    } catch {
    }
    api.contextMenus.create({
      id: MENU_PAGE,
      title: "译流：翻译此页面",
      contexts: ["page", "frame"]
    });
    api.contextMenus.create({
      id: MENU_SELECTION,
      title: "译流：翻译选中文字",
      contexts: ["selection"]
    });
    api.contextMenus.create({
      id: MENU_RESTORE,
      title: "译流：显示原文",
      contexts: ["page", "frame"]
    });
  }
  async function openOptionsWithRetry() {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        if (api.runtime.openOptionsPage) {
          const opened = api.runtime.openOptionsPage();
          if (opened?.then) await opened;
          return;
        }
        await callApi(api.tabs, "create", [{ url: api.runtime.getURL("options.html") }]);
        return;
      } catch {
        await sleep(400);
      }
    }
  }
  api.runtime.onInstalled.addListener((details) => {
    cachedSettings = null;
    createContextMenus().catch(() => {
    });
    if (details.reason === "install") {
      setTimeout(() => openOptionsWithRetry(), 500);
    }
  });
  if (api.runtime.onStartup) {
    api.runtime.onStartup.addListener(() => {
      cachedSettings = null;
      createContextMenus().catch(() => {
      });
    });
  }
  api.runtime.onMessage.addListener((message, sender, sendResponse) => {
    handleMessage(message, sender).then((response) => sendResponse(response)).catch((error) => {
      if (!(error instanceof ApiError)) log("message failed", message?.type, error);
      sendResponse({ ok: false, error: apiErrorPayload(error) });
    });
    return true;
  });
  if (api.contextMenus) {
    api.contextMenus.onClicked.addListener(async (info, tab) => {
      try {
        if (!tab?.id) return;
        if (info.menuItemId === MENU_SELECTION) {
          await ensureContentScript(tab.id);
          const text = String(info.selectionText || "").trim();
          await sendToTab(
            tab.id,
            { type: "selection.translate", text, fromContextMenu: true },
            info.frameId ?? 0
          );
          return;
        }
        if (info.menuItemId === MENU_PAGE) {
          await dispatchPageCommand("translate", tab.id, { force: true });
          return;
        }
        if (info.menuItemId === MENU_RESTORE) {
          await dispatchPageCommand("restore", tab.id);
        }
      } catch (error) {
        log("context menu failed", error);
        setBadge(tab?.id, "!", "#b42318");
      }
    });
  }
  if (api.commands) {
    api.commands.onCommand.addListener(async (command) => {
      try {
        if (command === "toggle-page") await dispatchPageCommand("toggle");
        else if (command === "translate-page") await dispatchPageCommand("translate", null, { force: true });
        else if (command === "restore-page") await dispatchPageCommand("restore");
        else if (command === "translate-selection") {
          const tab = await getActiveTab();
          if (!tab?.id) return;
          await ensureContentScript(tab.id);
          await sendToTab(tab.id, { type: "selection.translate-current" }, 0);
        }
      } catch (error) {
        log("command failed", command, error);
      }
    });
  }
  if (api.tabs?.onUpdated) {
    api.tabs.onUpdated.addListener((tabId, changeInfo) => {
      if (changeInfo.status === "loading") setBadge(tabId, "");
    });
  }
  if (api.storage?.onChanged) {
    api.storage.onChanged.addListener((changes, area) => {
      if (area === "local" && changes[SETTINGS_STORAGE_KEY]) cachedSettings = null;
      if (area === "local" && changes[CACHE_STORAGE_KEY] && !changes[CACHE_STORAGE_KEY].newValue) {
        cache.entries.clear();
      }
    });
  }
  cache.load().catch(() => {
  });
  log(`background ready · v${api.runtime.getManifest().version}`);
})();
