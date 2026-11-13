import {
  buildBatchMessages,
  buildConnectionMessages,
  buildSelectionMessages,
  parseBatchResponse,
  parseSelectionResponse,
} from './prompt.js';
import {
  isLikelyLocalUrl,
  sleep,
  truncate,
} from '../shared/utils.js';
import {
  isProviderConfigured,
  providerConfigFromForm,
  providerRequiresKey,
} from '../shared/settings.js';

export class ApiError extends Error {
  /**
   * @param {string} message
   * @param {string} code
   * @param {{status?: number, retryable?: boolean, details?: string}} [options]
   */
  constructor(message, code = 'API_ERROR', options = {}) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = options.status;
    this.retryable = Boolean(options.retryable);
    this.details = options.details || '';
  }
}

const RETRYABLE_STATUS = new Set([408, 409, 425, 429, 500, 502, 503, 504]);

function normalizeBaseUrl(baseUrl) {
  return String(baseUrl || '').trim().replace(/\/+$/, '');
}

export function endpointFor(provider) {
  const base = normalizeBaseUrl(provider.baseUrl);
  if (!base) throw new ApiError('请填写 API 地址', 'CONFIG', {});
  if (provider.type === 'anthropic') {
    return /\/messages$/i.test(base) ? base : `${base}/messages`;
  }
  return /\/chat\/completions$/i.test(base) ? base : `${base}/chat/completions`;
}

function parseExtraHeaders(raw) {
  const headers = {};
  for (const line of String(raw || '').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const colon = trimmed.indexOf(':');
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
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (provider.type === 'anthropic') {
    if (provider.apiKey) headers['x-api-key'] = provider.apiKey;
    headers['anthropic-version'] = '2023-06-01';
    // Required by Anthropic when the request originates in a browser.
    headers['anthropic-dangerous-direct-browser-access'] = 'true';
  } else if (provider.apiKey) {
    headers.Authorization = `Bearer ${provider.apiKey}`;
  }
  return { ...headers, ...parseExtraHeaders(provider.extraHeaders) };
}

function bodyFor(provider, messages, { jsonMode, maxTokens, temperature }) {
  if (provider.type === 'anthropic') {
    const system = messages
      .filter((message) => message.role === 'system')
      .map((message) => message.content)
      .join('\n\n');
    return {
      model: provider.model,
      max_tokens: maxTokens,
      temperature,
      system,
      messages: messages
        .filter((message) => message.role !== 'system')
        .map((message) => ({ role: message.role, content: message.content })),
    };
  }

  const body = {
    model: provider.model,
    messages,
    temperature,
    max_tokens: maxTokens,
    stream: false,
  };
  if (jsonMode) body.response_format = { type: 'json_object' };
  return body;
}

function extractText(data, type) {
  if (!data || typeof data !== 'object') return '';
  if (type === 'anthropic') {
    if (Array.isArray(data.content)) {
      return data.content
        .filter((part) => part && part.type === 'text' && typeof part.text === 'string')
        .map((part) => part.text)
        .join('\n')
        .trim();
    }
    return '';
  }
  const choice = data.choices?.[0];
  const content = choice?.message?.content ?? choice?.text;
  if (typeof content === 'string') return content.trim();
  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part === 'string' ? part : part?.text || ''))
      .join('')
      .trim();
  }
  return '';
}

function errorFromResponse(status, data, rawText) {
  const providerMessage =
    data?.error?.message ||
    data?.message ||
    data?.error ||
    (typeof rawText === 'string' ? truncate(rawText, 300) : '');
  const suffix = providerMessage ? `：${providerMessage}` : '';
  if (status === 401 || status === 403) {
    return new ApiError(`API Key 无效或没有权限${suffix}`, 'AUTH', {
      status,
      retryable: false,
    });
  }
  if (status === 404) {
    return new ApiError(`接口或模型不存在，请检查 API 地址和模型名${suffix}`, 'NOT_FOUND', {
      status,
      retryable: false,
    });
  }
  if (status === 429) {
    return new ApiError(`请求过于频繁或额度不足${suffix}`, 'RATE_LIMIT', {
      status,
      retryable: true,
    });
  }
  if (status === 400 || status === 422) {
    return new ApiError(`请求参数被服务商拒绝${suffix}`, 'BAD_REQUEST', {
      status,
      retryable: false,
      details: providerMessage,
    });
  }
  if (RETRYABLE_STATUS.has(status)) {
    return new ApiError(`翻译服务暂时不可用（HTTP ${status}）${suffix}`, 'SERVER', {
      status,
      retryable: true,
    });
  }
  return new ApiError(`翻译服务返回错误（HTTP ${status}）${suffix}`, 'HTTP_ERROR', {
    status,
    retryable: false,
  });
}

function retryAfterMs(response) {
  const value = response.headers.get('retry-after');
  if (!value) return 0;
  const seconds = Number(value);
  if (Number.isFinite(seconds)) return Math.max(0, Math.min(seconds * 1000, 10000));
  const date = Date.parse(value);
  return Number.isFinite(date) ? Math.max(0, Math.min(date - Date.now(), 10000)) : 0;
}

async function requestOnce(provider, messages, options) {
  const endpoint = endpointFor(provider);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs);
  const started = Date.now();

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: headersFor(provider),
      body: JSON.stringify(bodyFor(provider, messages, options)),
      signal: controller.signal,
      credentials: 'omit',
      cache: 'no-store',
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
      throw new ApiError('翻译服务返回了空响应或非 JSON 内容', 'BAD_RESPONSE', {
        retryable: true,
      });
    }
    const text = extractText(data, provider.type);
    if (!text) {
      throw new ApiError('模型返回了空译文，请检查模型名或降低参数', 'EMPTY', {
        retryable: true,
      });
    }
    return {
      text,
      usage: data.usage || null,
      latencyMs: Date.now() - started,
      response: data,
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error?.name === 'AbortError') {
      throw new ApiError(`请求超时（${Math.round(options.timeoutMs / 1000)} 秒）`, 'TIMEOUT', {
        retryable: true,
      });
    }
    throw new ApiError(
      `无法连接翻译服务：${truncate(error?.message || '网络错误', 240)}。请检查 API 地址、网络或代理设置。`,
      'NETWORK',
      { retryable: true },
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
    timeoutMs: options.timeoutMs || 60000,
  };
  let lastError = null;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await requestOnce(provider, messages, merged);
    } catch (error) {
      lastError = error;
      // A number of OpenAI-compatible servers reject response_format even when
      // they otherwise speak the API. Retry once without it instead of making
      // the user discover a toggle.
      if (
        merged.jsonMode &&
        error.code === 'BAD_REQUEST' &&
        /response_format|json mode|json_object/i.test(error.details || error.message)
      ) {
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

export function getProviderValidationError(provider) {
  if (!provider) return '缺少翻译服务配置';
  if (!provider.baseUrl) return '请填写 API 地址';
  try {
    const url = new URL(provider.baseUrl);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return 'API 地址必须以 http:// 或 https:// 开头';
    }
  } catch {
    return 'API 地址格式不正确';
  }
  if (!provider.model) return '请填写模型名称';
  if (providerRequiresKey(provider) && !provider.apiKey) {
    return '请填写 API Key（本地模型可留空）';
  }
  return '';
}

function assertProvider(provider) {
  const error = getProviderValidationError(provider);
  if (error) {
    throw new ApiError(error, error.includes('API Key') ? 'NO_API_KEY' : 'CONFIG');
  }
}

/**
 * Translate a batch and return a partial result. Missing items are reported in
 * `errors` rather than failing the whole batch.
 */
export async function translateBatch({ items, settings, context = {} }) {
  const provider = providerConfigFromForm(settings.provider);
  assertProvider(provider);
  if (!items.length) return { translations: {}, errors: [], usage: null };

  const messages = buildBatchMessages(items, settings, context);
  const result = await callModel(provider, messages, {
    jsonMode: provider.type === 'openai' && provider.jsonMode,
    maxTokens: provider.maxTokens,
    temperature: provider.temperature,
    timeoutMs: settings.advanced.timeoutMs,
  });

  const parsed = parseBatchResponse(
    result.text,
    items.map((item) => item.id),
  );
  const translations = Object.fromEntries(parsed.translations);

  // One cheap repair pass for partially formatted responses. This happens with
  // smaller local models that occasionally skip the last array entry.
  let missing = items.filter((item) => !translations[item.id]);
  if (missing.length && missing.length < items.length && missing.length <= 6) {
    try {
      const repairMessages = buildBatchMessages(missing, settings, context);
      const repaired = await callModel(provider, repairMessages, {
        jsonMode: provider.type === 'openai' && provider.jsonMode,
        maxTokens: provider.maxTokens,
        temperature: provider.temperature,
        timeoutMs: settings.advanced.timeoutMs,
      });
      const repairedParsed = parseBatchResponse(
        repaired.text,
        missing.map((item) => item.id),
      );
      for (const [id, text] of repairedParsed.translations) translations[id] = text;
      missing = items.filter((item) => !translations[item.id]);
    } catch {
      // Keep the original partial result; the UI exposes a retry action.
    }
  }

  const errors = missing.map((item) => ({
    id: item.id,
    code: 'PARSE',
    message: '模型没有返回这一段的译文，可单独重试',
  }));

  return {
    translations,
    errors,
    usage: result.usage,
    latencyMs: result.latencyMs,
  };
}

export async function translateSelection({ text, settings, context = {} }) {
  const provider = providerConfigFromForm(settings.provider);
  assertProvider(provider);
  const messages = buildSelectionMessages(text, settings, context);
  const result = await callModel(provider, messages, {
    jsonMode: false,
    maxTokens: Math.min(provider.maxTokens, 2048),
    temperature: provider.temperature,
    timeoutMs: settings.advanced.timeoutMs,
  });
  const translation = parseSelectionResponse(result.text);
  if (!translation) {
    throw new ApiError('模型没有返回译文，请重试', 'EMPTY', { retryable: true });
  }
  return {
    translation,
    usage: result.usage,
    latencyMs: result.latencyMs,
  };
}

export async function testProvider(providerInput, targetLang = 'zh-CN') {
  const provider = providerConfigFromForm(providerInput);
  assertProvider(provider);
  const started = Date.now();
  const messages = buildConnectionMessages(targetLang);
  const result = await callModel(provider, messages, {
    jsonMode: false,
    maxTokens: 64,
    temperature: 0,
    timeoutMs: 30000,
  });
  return {
    ok: true,
    latencyMs: Date.now() - started,
    sample: truncate(result.text.replace(/\s+/g, ' ').trim(), 80),
    model: provider.model,
    endpoint: endpointFor(provider),
    local: isLikelyLocalUrl(provider.baseUrl),
  };
}

export function apiErrorPayload(error) {
  if (error instanceof ApiError) {
    return {
      code: error.code,
      message: error.message,
      status: error.status || null,
      retryable: error.retryable,
    };
  }
  return {
    code: 'UNKNOWN',
    message: error?.message || '翻译失败',
    status: null,
    retryable: false,
  };
}

export function ensureConfigured(settings) {
  if (!isProviderConfigured(settings)) {
    throw new ApiError('请先在译流设置中配置翻译服务', 'NO_API_KEY');
  }
}
