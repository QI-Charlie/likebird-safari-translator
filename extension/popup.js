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
  function truncate(value, max) {
    const text = String(value ?? "");
    return text.length > max ? `${text.slice(0, max - 1)}…` : text;
  }
  function hostFromUrl(value) {
    try {
      return new URL(value).hostname.replace(/^www\./i, "");
    } catch {
      return "";
    }
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
  var STYLE_VALUES = new Set(STYLE_OPTIONS.map((item) => item.value));
  var MODE_VALUES = new Set(MODE_OPTIONS.map((item) => item.value));
  var DISPLAY_VALUES = new Set(DISPLAY_STYLES.map((item) => item.value));

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

  // src/popup/popup.js
  var api = extensionApi();
  var el = (id) => document.getElementById(id);
  var state = {
    tab: null,
    settings: null,
    status: null,
    unsupported: false,
    excluded: false,
    polling: false,
    pollTimer: 0
  };
  function sendBackground(message) {
    return sendRuntimeMessage(message, 6e4);
  }
  async function activeTab() {
    const tabs = await callApi(api.tabs, "query", [{ active: true, currentWindow: true }]);
    return tabs?.[0] || null;
  }
  function isSupportedTab(tab) {
    if (!tab?.url) return false;
    try {
      const url = new URL(tab.url);
      return ["http:", "https:", "file:"].includes(url.protocol);
    } catch {
      return false;
    }
  }
  function hostOf(tab) {
    return hostFromUrl(tab?.url || "");
  }
  function showToast(message, type = "info") {
    const toast = el("toast");
    toast.textContent = message;
    toast.className = `toast${type === "error" ? " is-error" : ""}`;
    requestAnimationFrame(() => toast.classList.add("is-visible"));
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("is-visible"), 3200);
  }
  function shortcutLabel() {
    return /Mac|iPhone|iPad/.test(navigator.userAgent) ? "⌥ A" : "Alt + A";
  }
  function renderSite() {
    const tab = state.tab;
    const host = hostOf(tab);
    el("siteDomain").textContent = host || "当前标签页";
    el("siteTitle").textContent = truncate(tab?.title || "无标题页面", 64);
    el("shortcut").textContent = shortcutLabel();
    const icon = el("siteIcon");
    icon.textContent = (host || "Y").charAt(0).toUpperCase();
    if (tab?.favIconUrl && /^https?:/i.test(tab.favIconUrl)) {
      const image = document.createElement("img");
      image.alt = "";
      image.src = tab.favIconUrl;
      image.addEventListener("error", () => {
        image.remove();
        icon.textContent = (host || "Y").charAt(0).toUpperCase();
      });
      icon.textContent = "";
      icon.appendChild(image);
    }
  }
  function renderApiState() {
    const configured = Boolean(state.settings?.configured);
    el("apiBanner").hidden = configured || state.unsupported;
    el("excludedBanner").hidden = !state.excluded || state.unsupported;
  }
  function renderStatus() {
    const pill = el("statusPill");
    pill.className = "status-pill";
    const status = state.status;
    if (state.unsupported) {
      pill.textContent = "不可用";
      el("translateBtn").disabled = true;
      el("restoreBtn").disabled = true;
      el("autoSite").disabled = true;
      el("hint").textContent = "Safari 设置页、扩展商店等内部页面不支持翻译。";
      return;
    }
    if (state.excluded) {
      pill.textContent = "已排除";
      pill.classList.add("is-error");
      el("translateBtn").disabled = true;
      el("restoreBtn").disabled = true;
    } else if (status?.active) {
      pill.textContent = "翻译中";
      pill.classList.add("is-active");
      el("translateBtn").disabled = true;
      el("restoreBtn").disabled = false;
      const total = status.total || 0;
      const done = status.translated || 0;
      el("hint").textContent = total ? `正在翻译：${done} / ${total} 段，可在网页右下角停止。` : "正在准备翻译…";
    } else if (status?.hasTranslation) {
      pill.textContent = "已翻译";
      pill.classList.add("is-done");
      el("translateBtn").disabled = false;
      el("restoreBtn").disabled = false;
      el("hint").textContent = status.errors ? `${status.errors} 段未完成，可在网页右下角重试。` : "译文已插入页面，切换标签页后会保留。";
    } else if (status?.errors) {
      pill.textContent = "部分失败";
      pill.classList.add("is-error");
      el("translateBtn").disabled = false;
      el("restoreBtn").disabled = false;
      el("hint").textContent = "翻译未完成，请检查 API 设置或重试。";
    } else {
      pill.textContent = "待翻译";
      el("translateBtn").disabled = false;
      el("restoreBtn").disabled = true;
      el("hint").textContent = "选中网页文字，点击浮出的「译」即可划词翻译。";
    }
    if (status?.active) {
      el("translateBtn").querySelector(".btn-label").textContent = "正在翻译…";
    } else if (status?.hasTranslation) {
      el("translateBtn").querySelector(".btn-label").textContent = "重新翻译此页";
    } else {
      el("translateBtn").querySelector(".btn-label").textContent = "翻译此页";
    }
  }
  function renderAutoSwitch() {
    const host = hostOf(state.tab);
    const auto = Boolean(host && hostMatchesAny(host, state.settings?.autoTranslateSites || []));
    el("autoSite").checked = auto;
  }
  function populateLanguages() {
    const select = el("targetLang");
    select.innerHTML = "";
    for (const language of TARGET_LANGUAGES) {
      const option = document.createElement("option");
      option.value = language.code;
      option.textContent = `${language.label}`;
      select.appendChild(option);
    }
    select.value = state.settings?.targetLang || "zh-CN";
  }
  async function loadStatus() {
    if (state.unsupported || !state.tab?.id) return;
    try {
      const response = await sendBackground({ type: "page.status", tabId: state.tab.id });
      if (response?.ok && response.status) {
        state.status = response.status;
      } else if (response?.unsupported) {
        state.unsupported = true;
      }
    } catch {
    }
    renderStatus();
    schedulePolling();
  }
  function schedulePolling() {
    clearTimeout(state.pollTimer);
    if (!state.status?.active) return;
    state.pollTimer = setTimeout(async () => {
      await loadStatus();
    }, 900);
  }
  async function translatePage() {
    if (!state.settings?.configured) {
      showToast("请先配置翻译服务", "error");
      await sendBackground({ type: "options.open" }).catch(() => {
      });
      window.close();
      return;
    }
    if (state.excluded) {
      showToast("此站点在排除列表中，请先在设置中移除", "error");
      return;
    }
    el("translateBtn").disabled = true;
    try {
      const response = await sendBackground({
        type: "page.command",
        command: "translate",
        tabId: state.tab?.id
      });
      if (!response?.ok) {
        showToast(response?.error?.message || response?.error || "无法开始翻译", "error");
        el("translateBtn").disabled = false;
        return;
      }
      state.status = { ...state.status || {}, active: true, total: 0, translated: 0 };
      renderStatus();
      setTimeout(() => window.close(), 380);
    } catch (error) {
      showToast(error.message || "无法连接页面脚本", "error");
      el("translateBtn").disabled = false;
    }
  }
  async function restorePage() {
    try {
      await sendBackground({
        type: "page.command",
        command: "restore",
        tabId: state.tab?.id
      });
      state.status = { active: false, hasTranslation: false, translated: 0, total: 0, errors: 0 };
      renderStatus();
      showToast("已恢复原文");
    } catch (error) {
      showToast(error.message || "恢复原文失败", "error");
    }
  }
  async function updateSettings(patch) {
    const response = await sendBackground({ type: "settings.update", patch });
    if (response?.ok && response.settings) {
      state.settings = response.settings;
      state.excluded = hostMatchesAny(hostOf(state.tab), state.settings.excludeSites || []);
      renderApiState();
      renderAutoSwitch();
      renderStatus();
    }
    return response;
  }
  async function onTargetLanguageChange() {
    const targetLang = el("targetLang").value;
    const previous = state.settings?.targetLang;
    try {
      await updateSettings({ targetLang });
      if (previous !== targetLang && state.status?.hasTranslation) {
        showToast("目标语言已保存，重新翻译后生效");
      }
    } catch (error) {
      showToast(error.message || "保存语言设置失败", "error");
      el("targetLang").value = previous || "zh-CN";
    }
  }
  async function onAutoSiteChange() {
    const host = hostOf(state.tab);
    if (!host) {
      el("autoSite").checked = false;
      return;
    }
    const enabled = el("autoSite").checked;
    const auto = new Set(state.settings?.autoTranslateSites || []);
    const excluded = new Set(state.settings?.excludeSites || []);
    if (enabled) {
      auto.add(host);
      excluded.delete(host);
    } else {
      auto.delete(host);
    }
    try {
      await updateSettings({
        autoTranslateSites: [...auto],
        excludeSites: [...excluded]
      });
      showToast(enabled ? `已开启 ${host} 自动翻译` : `已关闭 ${host} 自动翻译`);
    } catch (error) {
      el("autoSite").checked = !enabled;
      showToast(error.message || "保存站点规则失败", "error");
    }
  }
  async function openOptions() {
    await sendBackground({ type: "options.open" }).catch(() => {
    });
    window.close();
  }
  async function clearCache() {
    try {
      await sendBackground({ type: "cache.clear" });
      showToast("本地翻译缓存已清除");
    } catch (error) {
      showToast(error.message || "清除缓存失败", "error");
    }
  }
  async function init() {
    state.tab = await activeTab();
    state.unsupported = !isSupportedTab(state.tab);
    const settingsResponse = await sendBackground({ type: "settings.get" }).catch(() => null);
    if (settingsResponse?.ok) state.settings = settingsResponse.settings;
    if (!state.settings) {
      showToast("无法读取译流设置，请重新打开扩展", "error");
      return;
    }
    state.excluded = hostMatchesAny(hostOf(state.tab), state.settings.excludeSites || []);
    populateLanguages();
    renderSite();
    renderApiState();
    renderAutoSwitch();
    el("version").textContent = `v${api.runtime.getManifest().version}`;
    if (state.unsupported) {
      renderStatus();
      return;
    }
    await loadStatus();
  }
  el("settingsBtn").addEventListener("click", openOptions);
  el("optionsBtn").addEventListener("click", openOptions);
  el("openSettings").addEventListener("click", openOptions);
  el("translateBtn").addEventListener("click", translatePage);
  el("restoreBtn").addEventListener("click", restorePage);
  el("clearCache").addEventListener("click", clearCache);
  el("targetLang").addEventListener("change", onTargetLanguageChange);
  el("autoSite").addEventListener("change", onAutoSiteChange);
  window.addEventListener("beforeunload", () => clearTimeout(state.pollTimer));
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
