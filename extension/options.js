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

  // src/options/options.js
  var api = extensionApi();
  var el = (id) => document.getElementById(id);
  var currentSettings = mergeSettings(DEFAULT_SETTINGS);
  var loading = true;
  var saveTimer = 0;
  var toastTimer = 0;
  var testInFlight = false;
  function send(message) {
    return sendRuntimeMessage(message, 6e4);
  }
  function showToast(message, type = "info") {
    const toast = el("toast");
    toast.textContent = message;
    toast.className = `toast${type === "error" ? " is-error" : ""}`;
    requestAnimationFrame(() => toast.classList.add("is-visible"));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 3400);
  }
  function setSaveState(text, variant = "") {
    const state = el("saveState");
    state.textContent = text;
    state.className = `save-state${variant ? ` is-${variant}` : ""}`;
  }
  function populateStaticSelects() {
    const preset = el("preset");
    for (const [key, value] of Object.entries(PROVIDER_PRESETS)) {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = value.label;
      preset.appendChild(option);
    }
    const target = el("targetLang");
    for (const language of TARGET_LANGUAGES) {
      const option = document.createElement("option");
      option.value = language.code;
      option.textContent = language.label;
      target.appendChild(option);
    }
    const source = el("sourceLang");
    for (const language of SOURCE_LANGUAGES) {
      const option = document.createElement("option");
      option.value = language.code;
      option.textContent = language.label;
      source.appendChild(option);
    }
    const style = el("style");
    for (const option of STYLE_OPTIONS) {
      const node = document.createElement("option");
      node.value = option.value;
      node.textContent = option.label;
      style.appendChild(node);
    }
    const display = el("displayStyle");
    display.innerHTML = "";
    for (const option of DISPLAY_STYLES) {
      const node = document.createElement("option");
      node.value = option.value;
      node.textContent = option.label;
      display.appendChild(node);
    }
    el("sideVersion").textContent = api.runtime.getManifest().version;
    el("aboutVersion").textContent = api.runtime.getManifest().version;
    el("aboutShortcut").textContent = SHORTCUT.mac;
  }
  function fillForm(settings) {
    loading = true;
    const provider = settings.provider;
    el("preset").value = provider.preset || "custom";
    el("providerType").value = provider.type || "openai";
    el("baseUrl").value = provider.baseUrl || "";
    el("apiKey").value = provider.apiKey || "";
    el("model").value = provider.model || "";
    el("temperature").value = String(provider.temperature ?? 0.2);
    el("tempValue").textContent = Number(provider.temperature ?? 0.2).toFixed(1);
    el("maxTokens").value = String(provider.maxTokens ?? 4096);
    el("jsonMode").checked = Boolean(provider.jsonMode);
    el("extraHeaders").value = provider.extraHeaders || "";
    el("targetLang").value = settings.targetLang;
    el("sourceLang").value = settings.sourceLang;
    el("style").value = settings.style;
    el("displayStyle").value = settings.ui.displayStyle;
    el("fontSize").value = String(settings.ui.fontSize);
    el("fontSizeValue").textContent = `${settings.ui.fontSize}px`;
    el("color").value = settings.ui.color;
    el("colorText").value = settings.ui.color;
    const mode = document.querySelector(`input[name="mode"][value="${settings.mode}"]`);
    if (mode) mode.checked = true;
    for (const card of document.querySelectorAll(".mode-card")) {
      card.classList.toggle("is-selected", card.querySelector("input")?.checked || false);
    }
    el("autoSites").value = settings.autoTranslateSites.join("\n");
    el("excludeSites").value = settings.excludeSites.join("\n");
    el("skipTargetLanguage").checked = settings.skipTargetLanguagePages;
    el("selectionEnabled").checked = settings.selection.enabled;
    el("selectionAuto").checked = settings.selection.auto;
    el("glossary").value = settings.glossary;
    el("customPrompt").value = settings.customPrompt;
    el("cacheEnabled").checked = settings.cache.enabled;
    el("cacheMax").value = String(settings.cache.maxEntries);
    el("batchItems").value = String(settings.batch.maxItems);
    el("concurrency").value = String(settings.batch.concurrency);
    el("timeout").value = String(Math.round(settings.advanced.timeoutMs / 1e3));
    updatePresetHint();
    updateBaseUrlHelp();
    updatePreview();
    updateConfigBadge();
    loading = false;
  }
  function updatePresetHint() {
    const preset = PROVIDER_PRESETS[el("preset").value];
    el("presetHint").textContent = preset?.hint || "自定义兼容接口";
  }
  function updateBaseUrlHelp() {
    const value = el("baseUrl").value.trim();
    if (!value) {
      el("baseUrlHelp").textContent = "以 /v1 结尾的地址会自动补全请求路径。";
      el("baseUrlHelp").classList.remove("is-warning");
      return;
    }
    try {
      const url = new URL(value);
      if (url.protocol === "http:" && !isLikelyLocalUrl(value)) {
        el("baseUrlHelp").textContent = "⚠ 非 HTTPS 的远程地址可能被 Safari 阻止，建议使用 HTTPS。";
        el("baseUrlHelp").classList.add("is-warning");
        return;
      }
    } catch {
    }
    el("baseUrlHelp").textContent = "以 /v1 结尾的地址会自动补全请求路径。";
    el("baseUrlHelp").classList.remove("is-warning");
  }
  function updateConfigBadge() {
    const provider = currentSettings.provider;
    const configured = Boolean(
      provider.baseUrl && provider.model && (provider.apiKey || isLikelyLocalUrl(provider.baseUrl) || PROVIDER_PRESETS[provider.preset]?.keyless)
    );
    const badge = el("configBadge");
    badge.textContent = configured ? "已配置" : "未配置";
    badge.classList.toggle("is-ready", configured);
  }
  function updatePreview() {
    const size = Number(el("fontSize").value) || 15;
    const color = /^#[0-9a-f]{6}$/i.test(el("colorText").value) ? el("colorText").value : "#4a4842";
    const display = el("displayStyle").value;
    const mode = document.querySelector('input[name="mode"]:checked')?.value || "bilingual";
    const card = el("preview");
    card.dataset.display = display;
    card.dataset.mode = mode;
    const translation = el("previewTranslation");
    translation.style.fontSize = `${size}px`;
    translation.style.color = color;
    el("fontSizeValue").textContent = `${size}px`;
    document.querySelector(".preview-tag").textContent = mode === "replace" ? "仅看译文 · 自然流畅" : "双语 · 自然流畅";
  }
  function collectForm() {
    const provider = {
      preset: el("preset").value,
      type: el("providerType").value,
      baseUrl: el("baseUrl").value.trim(),
      apiKey: el("apiKey").value.trim(),
      model: el("model").value.trim(),
      temperature: Number(el("temperature").value),
      maxTokens: Number(el("maxTokens").value),
      jsonMode: el("jsonMode").checked,
      extraHeaders: el("extraHeaders").value
    };
    const mode = document.querySelector('input[name="mode"]:checked')?.value || "bilingual";
    const color = /^#[0-9a-f]{6}$/i.test(el("colorText").value) ? el("colorText").value : DEFAULT_SETTINGS.ui.color;
    return mergeSettings({
      ...currentSettings,
      provider,
      targetLang: el("targetLang").value,
      sourceLang: el("sourceLang").value,
      style: el("style").value,
      mode,
      autoTranslateSites: linesToArray(el("autoSites").value),
      excludeSites: linesToArray(el("excludeSites").value),
      skipTargetLanguagePages: el("skipTargetLanguage").checked,
      glossary: el("glossary").value,
      customPrompt: el("customPrompt").value,
      selection: {
        enabled: el("selectionEnabled").checked,
        auto: el("selectionAuto").checked
      },
      cache: {
        enabled: el("cacheEnabled").checked,
        maxEntries: Number(el("cacheMax").value)
      },
      batch: {
        maxItems: Number(el("batchItems").value),
        concurrency: Number(el("concurrency").value)
      },
      ui: {
        fontSize: Number(el("fontSize").value),
        color,
        displayStyle: el("displayStyle").value
      },
      advanced: {
        ...currentSettings.advanced,
        timeoutMs: Number(el("timeout").value) * 1e3
      }
    });
  }
  async function persist() {
    if (loading) return;
    const next = collectForm();
    currentSettings = next;
    setSaveState("保存中…", "saving");
    try {
      const response = await send({ type: "settings.update", patch: next });
      if (!response?.ok) throw new Error(response?.error?.message || response?.error || "保存失败");
      setSaveState("已保存");
      updateConfigBadge();
    } catch (error) {
      setSaveState("保存失败", "error");
      showToast(error.message || "保存设置失败", "error");
    }
  }
  function scheduleSave() {
    if (loading) return;
    clearTimeout(saveTimer);
    setSaveState("有未保存的更改…", "saving");
    saveTimer = setTimeout(() => persist(), 450);
  }
  function applyPreset() {
    const preset = PROVIDER_PRESETS[el("preset").value];
    if (!preset || el("preset").value === "custom") {
      updatePresetHint();
      return;
    }
    el("providerType").value = preset.type;
    el("baseUrl").value = preset.baseUrl;
    el("model").value = preset.model;
    el("jsonMode").checked = Boolean(preset.jsonMode);
    updatePresetHint();
    updateBaseUrlHelp();
    updateConfigBadge();
    scheduleSave();
  }
  async function testConnection() {
    if (testInFlight) return;
    testInFlight = true;
    const spinner = el("testSpinner");
    const result = el("testResult");
    spinner.hidden = false;
    el("testLabel").textContent = "测试中…";
    el("testConnection").disabled = true;
    result.className = "test-result";
    result.textContent = "正在向接口发送一条最小翻译请求…";
    const provider = collectForm().provider;
    try {
      const response = await send({
        type: "api.test",
        provider,
        targetLang: el("targetLang").value
      });
      if (!response?.ok) throw new Error(response?.error?.message || response?.error || "连接失败");
      const sample = response.result?.sample ? `，返回「${response.result.sample}」` : "";
      result.textContent = `连接成功 · ${response.result.latencyMs} ms${sample}`;
      result.className = "test-result is-ok";
      showToast("API 连接正常");
    } catch (error) {
      result.textContent = error.message || "连接失败，请检查地址、Key 和模型名";
      result.className = "test-result is-error";
    } finally {
      testInFlight = false;
      spinner.hidden = true;
      el("testLabel").textContent = "测试连接";
      el("testConnection").disabled = false;
    }
  }
  async function clearCache() {
    if (!window.confirm("清除本机保存的全部翻译缓存？")) return;
    try {
      const response = await send({ type: "cache.clear" });
      if (!response?.ok) throw new Error(response?.error?.message || "清除失败");
      showToast("翻译缓存已清除");
    } catch (error) {
      showToast(error.message || "清除缓存失败", "error");
    }
  }
  function exportSettings() {
    const copy = JSON.parse(JSON.stringify(currentSettings));
    delete copy.provider.apiKey;
    const payload = {
      app: "yiliu",
      exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
      settings: copy
    };
    const blob = new Blob([`${JSON.stringify(payload, null, 2)}
`], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `yiliu-settings-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1e3);
    showToast("设置已导出（不含 API Key）");
  }
  async function importSettings(file) {
    if (!file) return;
    try {
      const text = await file.text();
      const raw = JSON.parse(text);
      const imported = raw.settings || raw;
      const merged = mergeSettings({
        ...currentSettings,
        ...imported,
        provider: {
          ...currentSettings.provider,
          ...imported.provider || {},
          apiKey: imported.provider?.apiKey || currentSettings.provider.apiKey
        }
      });
      currentSettings = merged;
      fillForm(currentSettings);
      await persist();
      showToast("设置已导入");
    } catch (error) {
      showToast(error.message || "导入失败：不是有效的设置文件", "error");
    } finally {
      el("importFile").value = "";
    }
  }
  async function resetSettings() {
    if (!window.confirm("恢复所有默认设置？API Key 和站点规则也会清空。")) return;
    currentSettings = mergeSettings(DEFAULT_SETTINGS);
    currentSettings.provider.apiKey = "";
    fillForm(currentSettings);
    await persist();
    showToast("已恢复默认设置");
  }
  function bindEvents() {
    const autoSaveFields = [
      "preset",
      "providerType",
      "baseUrl",
      "apiKey",
      "model",
      "temperature",
      "maxTokens",
      "jsonMode",
      "extraHeaders",
      "targetLang",
      "sourceLang",
      "style",
      "displayStyle",
      "fontSize",
      "color",
      "colorText",
      "autoSites",
      "excludeSites",
      "skipTargetLanguage",
      "selectionEnabled",
      "selectionAuto",
      "glossary",
      "customPrompt",
      "cacheEnabled",
      "cacheMax",
      "batchItems",
      "concurrency",
      "timeout"
    ];
    for (const id of autoSaveFields) {
      const node = el(id);
      if (!node) continue;
      node.addEventListener("input", () => {
        updatePreview();
        updateBaseUrlHelp();
        scheduleSave();
      });
      node.addEventListener("change", () => {
        if (id === "preset") applyPreset();
        else scheduleSave();
      });
    }
    for (const radio of document.querySelectorAll('input[name="mode"]')) {
      radio.addEventListener("change", () => {
        for (const card of document.querySelectorAll(".mode-card")) {
          card.classList.toggle("is-selected", card.querySelector("input")?.checked || false);
        }
        updatePreview();
        scheduleSave();
      });
    }
    el("temperature").addEventListener("input", () => {
      el("tempValue").textContent = Number(el("temperature").value).toFixed(1);
    });
    el("fontSize").addEventListener("input", () => {
      el("fontSizeValue").textContent = `${el("fontSize").value}px`;
    });
    el("color").addEventListener("input", () => {
      el("colorText").value = el("color").value;
    });
    el("colorText").addEventListener("input", () => {
      if (/^#[0-9a-f]{6}$/i.test(el("colorText").value)) el("color").value = el("colorText").value;
    });
    el("resetColor").addEventListener("click", () => {
      el("color").value = DEFAULT_SETTINGS.ui.color;
      el("colorText").value = DEFAULT_SETTINGS.ui.color;
      updatePreview();
      scheduleSave();
    });
    el("toggleKey").addEventListener("click", () => {
      const input = el("apiKey");
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      el("toggleKey").textContent = show ? "隐藏" : "显示";
    });
    el("testConnection").addEventListener("click", testConnection);
    el("testTop").addEventListener("click", testConnection);
    el("clearCache").addEventListener("click", clearCache);
    el("exportSettings").addEventListener("click", exportSettings);
    el("importSettings").addEventListener("click", () => el("importFile").click());
    el("importFile").addEventListener(
      "change",
      (event) => importSettings(event.target.files?.[0] || null)
    );
    el("resetSettings").addEventListener("click", resetSettings);
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        const target = document.querySelector(link.getAttribute("href"));
        target?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }
  function observeSections() {
    if (!("IntersectionObserver" in window)) return;
    const links = new Map(
      [...document.querySelectorAll(".nav-link")].map((link) => [link.dataset.nav, link])
    );
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          for (const link of links.values()) link.classList.remove("is-active");
          links.get(entry.target.id)?.classList.add("is-active");
        }
      },
      { rootMargin: "-15% 0px -65% 0px", threshold: 0 }
    );
    document.querySelectorAll(".section").forEach((section) => observer.observe(section));
  }
  async function init() {
    populateStaticSelects();
    bindEvents();
    try {
      const response = await send({ type: "settings.full" });
      if (response?.ok && response.settings) {
        currentSettings = mergeSettings(response.settings);
      }
    } catch (error) {
      showToast(error.message || "无法读取设置，已使用默认值", "error");
    }
    fillForm(currentSettings);
    observeSections();
    setSaveState("所有更改已保存");
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
