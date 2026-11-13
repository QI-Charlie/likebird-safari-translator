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
  var STYLE_VALUES = new Set(STYLE_OPTIONS.map((item) => item.value));

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

  // src/popup/popup.js
  var api = extensionApi();
  var el = (id) => document.getElementById(id);
  var modeInputs = document.querySelectorAll("[name=displayMode]");
  var tab;
  var settings;
  var status;
  var restricted = false;
  var busy = false;
  var pendingCommand = "";
  var statusError = "";
  var pollTimer;
  var statusRequest = 0;
  var popupClosed = false;
  async function send(message, timeout = 6e4) {
    const response = await sendRuntimeMessage(message, timeout);
    if (!response?.ok) {
      throw new Error(response?.error?.message || response?.error || "\u8BF7\u91CD\u8BD5");
    }
    return response;
  }
  function notice(message = "", error = false) {
    const node = el("notice");
    node.textContent = message;
    node.hidden = !message;
    node.toggleAttribute("data-error", error);
  }
  function render() {
    const host = hostFromUrl(tab?.url || "");
    const excluded = hostMatchesAny(host, settings?.excludeSites || []);
    const available = !restricted && !excluded;
    const configured = Boolean(settings?.configured);
    const localConversion = settings?.targetLang === "zh-TW";
    const active = Boolean(status?.active);
    const following = Boolean(status?.following);
    const translated = Boolean(status?.hasTranslation);
    const stopped = Boolean(status?.stopped);
    const errors = status?.errors || 0;
    const failure = status?.error;
    const label = el("pageStatus");
    label.textContent = active ? "\u7FFB\u8BD1\u4E2D" : stopped ? "\u5DF2\u505C\u6B62" : translated ? failure || errors ? "\u90E8\u5206\u5B8C\u6210" : "\u5DF2\u7FFB\u8BD1\u53EF\u89C1\u5185\u5BB9" : "";
    label.toggleAttribute("data-translated", translated && !active && !stopped && !failure);
    el("pageControls").hidden = !available || !settings;
    el("siteAutoRow").hidden = !host || !/^https?:/i.test(tab?.url || "");
    el("siteAuto").checked = autoTranslatesHost(host, settings);
    el("siteAuto").disabled = busy;
    el("openSettings").hidden = !available || configured || !settings;
    el("selectionNote").hidden = !available || !configured && !localConversion || !settings?.selection.enabled;
    el("restoreBtn").hidden = !translated && (!following || active);
    el("retranslateBtn").hidden = !translated || active || stopped || Boolean(errors || failure);
    el("translateLabel").textContent = active ? "\u505C\u6B62\u7FFB\u8BD1" : (stopped || failure) && translated ? "\u91CD\u65B0\u7FFB\u8BD1" : errors && translated ? "\u91CD\u8BD5\u672A\u5B8C\u6210\u6BB5\u843D" : "\u7FFB\u8BD1\u6B64\u9875";
    el("translateIcon").classList.toggle("icon-stop", active);
    el("translateIcon").classList.toggle("icon-refresh", !active && translated && Boolean(stopped || failure || errors));
    el("translateBtn").hidden = !active && (!configured && !localConversion || (translated || following) && !errors && !stopped && !failure);
    el("restoreBtn").classList.toggle("primary", !errors && !stopped && !failure);
    el("restoreBtn").classList.toggle("secondary", Boolean(errors || failure) || stopped);
    el("translateShortcut").hidden = !active && (translated || Boolean(errors));
    el("targetLang").disabled = active || busy;
    for (const input of modeInputs) {
      input.checked = input.value === (settings?.displayMode || "translation");
      input.disabled = busy;
    }
    for (const id of ["translateBtn", "restoreBtn", "retranslateBtn"]) el(id).disabled = busy;
    if (restricted) notice("\u6B64\u9875\u9762\u65E0\u6CD5\u4F7F\u7528\u6269\u5C55\u3002\u8BF7\u6253\u5F00\u666E\u901A\u7F51\u9875\uFF0C\u5E76\u5728 Safari \u4E2D\u5141\u8BB8\u98DE\u8BD1 \u8BBF\u95EE\u3002");
    else if (excluded) notice("\u6B64\u7AD9\u70B9\u5DF2\u6392\u9664\uFF0C\u53EF\u5728\u66F4\u591A\u9605\u8BFB\u8BBE\u7F6E\u4E2D\u66F4\u6539\u3002");
    else if (pendingCommand === "translate" || pendingCommand === "retry") notice("\u6B63\u5728\u542F\u52A8\u7FFB\u8BD1\u2026");
    else if (statusError || failure) notice(statusError || failure, true);
    else if (active) notice("\u6B63\u5728\u7FFB\u8BD1\u5F53\u524D\u53EF\u89C1\u5185\u5BB9\u2026");
    else if (stopped && translated) notice("\u5DF2\u4FDD\u7559\u5B8C\u6210\u7684\u6BB5\u843D\u3002");
    else if (errors) notice(`${errors} \u6BB5\u672A\u5B8C\u6210\u3002`);
    else if (!configured) notice(localConversion ? "\u7B80\u4F53\u53EF\u76F4\u63A5\u8F6C\u4E3A\u7E41\u9AD4\u3002\u7FFB\u8BD1\u5176\u4ED6\u8BED\u8A00\u9700\u8FDE\u63A5\u670D\u52A1\u3002" : "\u8FDE\u63A5\u670D\u52A1\u540E\u5373\u53EF\u7FFB\u8BD1\u3002");
    else if (following) notice("\u6EDA\u52A8\u65F6\u7EE7\u7EED\u7FFB\u8BD1\u3002");
    else notice();
  }
  async function refreshStatus() {
    clearTimeout(pollTimer);
    if (restricted || !tab?.id) return;
    const request = ++statusRequest;
    try {
      const response = await send({ type: "page.status", tabId: tab.id });
      if (request !== statusRequest || popupClosed) return;
      status = response.status;
      statusError = response.connectionWarning || "";
    } catch (error) {
      if (request !== statusRequest || popupClosed) return;
      statusError = error.message;
    }
    render();
    if (statusError || status?.active || status?.following) {
      pollTimer = setTimeout(refreshStatus, statusError ? 1600 : 800);
    }
  }
  async function runCommand(command) {
    if (busy) return;
    busy = true;
    statusRequest += 1;
    clearTimeout(pollTimer);
    pendingCommand = command;
    statusError = "";
    render();
    try {
      const response = await send({ type: "page.command", command, tabId: tab.id });
      if (response.status) status = response.status;
      await refreshStatus();
    } catch (failure) {
      statusError = failure.message;
    } finally {
      busy = false;
      pendingCommand = "";
      render();
    }
  }
  async function openSettings() {
    try {
      if (api.runtime.openOptionsPage) await api.runtime.openOptionsPage();
      else await send({ type: "options.open" }, 5e3);
      window.close();
    } catch (error) {
      notice(error.message, true);
    }
  }
  el("settingsBtn").addEventListener("click", openSettings);
  el("openSettings").addEventListener("click", openSettings);
  el("translateBtn").addEventListener("click", () => runCommand(
    status?.active ? "stop" : !status?.stopped && !status?.error && status?.errors && status?.hasTranslation ? "retry" : "translate"
  ));
  el("restoreBtn").addEventListener("click", () => runCommand("restore"));
  el("retranslateBtn").addEventListener("click", () => runCommand("translate"));
  async function updatePreference(patch) {
    if (busy) return;
    busy = true;
    render();
    let message = "";
    let failed = false;
    try {
      const response = await send({ type: "settings.update", patch });
      settings = response.settings;
      await refreshStatus();
      if (patch.targetLang && status?.hasTranslation && !autoTranslatesHost(hostFromUrl(tab.url), settings)) {
        message = "\u91CD\u65B0\u7FFB\u8BD1\u540E\u5E94\u7528\u65B0\u8BED\u8A00\u3002";
      }
    } catch (error) {
      message = error.message;
      failed = true;
      el("targetLang").value = settings.targetLang;
    } finally {
      busy = false;
      render();
      if (message) notice(message, failed);
    }
  }
  el("targetLang").addEventListener("change", (event) => {
    updatePreference({ targetLang: event.target.value });
  });
  el("siteAuto").addEventListener("change", async (event) => {
    if (busy) return;
    const enabled = event.target.checked;
    busy = true;
    statusError = "";
    render();
    el("siteAuto").checked = enabled;
    try {
      const response = await send({
        type: "settings.siteAuto",
        tabId: tab.id,
        host: hostFromUrl(tab.url),
        enabled
      });
      settings = response.settings;
      await refreshStatus();
    } catch (error) {
      statusError = error.message;
    } finally {
      busy = false;
      render();
    }
  });
  for (const input of modeInputs) {
    input.addEventListener("change", async () => {
      if (busy || !input.checked) return;
      const displayMode = input.value;
      busy = true;
      statusRequest += 1;
      clearTimeout(pollTimer);
      render();
      input.checked = true;
      try {
        const response = await send({ type: "settings.pageDisplay", tabId: tab.id, displayMode });
        settings = response.settings;
        if (response.status) status = response.status;
        await refreshStatus();
        if (response.connectionWarning && status?.displayMode !== settings.displayMode) {
          statusError = response.connectionWarning;
        }
      } catch (error) {
        statusError = error.message;
      } finally {
        busy = false;
        render();
      }
    });
  }
  window.addEventListener("pagehide", () => {
    popupClosed = true;
    clearTimeout(pollTimer);
  });
  async function init() {
    el("retryPopup").hidden = true;
    notice("\u6B63\u5728\u8BFB\u53D6 \u98DE\u8BD1\u8BBE\u7F6E\u2026");
    try {
      const [tabs, response] = await Promise.all([
        callApi(api.tabs, "query", [{ active: true, currentWindow: true }], { timeoutMs: 5e3 }),
        send({ type: "settings.get" }, 5e3)
      ]);
      tab = tabs?.[0];
      restricted = !tab?.id || !/^(https?|file):/i.test(tab.url || "");
      settings = response.settings;
      el("siteDomain").textContent = hostFromUrl(tab?.url || "") || tab?.title || "\u5F53\u524D\u9875\u9762";
      for (const { label, code } of TARGET_LANGUAGES) el("targetLang").add(new Option(label, code));
      el("targetLang").value = settings.targetLang;
      render();
      await refreshStatus();
    } catch {
      notice("\u65E0\u6CD5\u8BFB\u53D6 \u98DE\u8BD1\u72B6\u6001\u3002\u8BF7\u91CD\u8BD5\uFF0C\u6216\u5728 Safari \u7684\u6269\u5C55\u8BBE\u7F6E\u4E2D\u91CD\u65B0\u542F\u7528\u98DE\u8BD1\u3002", true);
      el("retryPopup").hidden = false;
    }
  }
  el("retryPopup").addEventListener("click", init);
  init();
})();
