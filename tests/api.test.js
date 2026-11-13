import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';

import { translateBatch, translateSelection, testProvider, ApiError } from '../src/background/api.js';
import { mergeSettings } from '../src/shared/settings.js';
import { PROVIDER_PRESETS } from '../src/shared/constants.js';

let server;
let baseUrl;
let lastRequest = null;

function readBody(request) {
  return new Promise((resolve) => {
    let body = '';
    request.on('data', (chunk) => {
      body += chunk;
    });
    request.on('end', () => resolve(body));
  });
}

before(async () => {
  server = http.createServer(async (request, response) => {
    const bodyText = await readBody(request);
    const body = bodyText ? JSON.parse(bodyText) : {};
    lastRequest = {
      url: request.url,
      headers: request.headers,
      body,
    };
    response.setHeader('Content-Type', 'application/json');

    if (request.url.endsWith('/messages')) {
      response.end(
        JSON.stringify({
          content: [{ type: 'text', text: '{"translations":[{"id":"b1","text":"你好"}]}' }],
        }),
      );
      return;
    }

    if (request.url.includes('/unauthorized')) {
      response.statusCode = 401;
      response.end(JSON.stringify({ error: { message: 'bad key' } }));
      return;
    }

    if (request.url.includes('/unfunded')) {
      response.statusCode = 402;
      response.end(JSON.stringify({ error: { message: 'Insufficient Balance (request_id: fixture)' } }));
      return;
    }

    const userMessage = body.messages?.find((message) => message.role === 'user')?.content || '';
    if (userMessage.includes('Hello') && !userMessage.includes('items')) {
      response.end(JSON.stringify({ choices: [{ message: { content: '你好' } }] }));
      return;
    }

    let ids = ['b1', 'b2'];
    try {
      const payload = JSON.parse(userMessage);
      ids = payload.items.map((item) => item.id);
    } catch {
      // Keep defaults.
    }
    response.end(
      JSON.stringify({
        choices: [
          {
            message: {
              content: JSON.stringify({
                translations: ids.map((id) => ({ id, text: `译文-${id}` })),
              }),
            },
          },
        ],
        usage: { total_tokens: 42 },
      }),
    );
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}/v1`;
});

after(() => new Promise((resolve) => server.close(resolve)));

function settingsFor(overrides = {}) {
  return mergeSettings({
    provider: {
      preset: 'custom',
      type: 'openai',
      baseUrl,
      apiKey: 'test-key',
      model: 'mock-model',
      jsonMode: true,
      ...(overrides.provider || {}),
    },
    advanced: { timeoutMs: 5000 },
  });
}

test('translateBatch sends an OpenAI request and maps translations', async () => {
  lastRequest = null;
  const settings = settingsFor();
  const result = await translateBatch({
    items: [
      { id: 'b1', text: 'Hello' },
      { id: 'b2', text: 'World' },
    ],
    settings,
    context: { title: 'Example', url: 'https://example.com' },
  });
  assert.equal(result.translations.b1, '译文-b1');
  assert.equal(result.translations.b2, '译文-b2');
  assert.equal(result.errors.length, 0);
  assert.equal(lastRequest.url, '/v1/chat/completions');
  assert.equal(lastRequest.headers.authorization, 'Bearer test-key');
  assert.deepEqual(lastRequest.body.response_format, { type: 'json_object' });
});

test('translateBatch supports Anthropic messages shape', async () => {
  lastRequest = null;
  const settings = settingsFor({
    provider: { type: 'anthropic', baseUrl: `${baseUrl}/messages`, jsonMode: false },
  });
  const result = await translateBatch({
    items: [{ id: 'b1', text: 'Hello' }],
    settings,
  });
  assert.equal(result.translations.b1, '你好');
  assert.equal(lastRequest.url, '/v1/messages');
  assert.equal(lastRequest.headers['x-api-key'], 'test-key');
  assert.ok(lastRequest.headers['anthropic-version']);
  assert.ok(Array.isArray(lastRequest.body.system) || typeof lastRequest.body.system === 'string');
});

test('API errors are translated into actionable codes', async () => {
  const settings = settingsFor({
    provider: { baseUrl: `${baseUrl}/unauthorized` },
  });
  await assert.rejects(
    () =>
      translateBatch({
        items: [{ id: 'b1', text: 'Hello' }],
        settings,
      }),
    (error) => {
      assert.ok(error instanceof ApiError);
      assert.equal(error.code, 'AUTH');
      return true;
    },
  );
});

test('testProvider performs a tiny round trip', async () => {
  const settings = settingsFor();
  const result = await testProvider(settings.provider, 'zh-CN');
  assert.equal(result.ok, true);
  assert.equal(result.sample, '你好');
  assert.ok(result.latencyMs >= 0);
});

test('Kimi K3 uses a low reasoning budget and omits fixed sampling parameters', async (t) => {
  const fetch = t.mock.method(globalThis, 'fetch', async () =>
    Response.json({ choices: [{ message: { content: '你好' } }] }));
  const provider = { ...PROVIDER_PRESETS.moonshot, preset: 'moonshot', apiKey: 'test-key' };
  const result = await testProvider(provider);

  const [url, request] = fetch.mock.calls[0].arguments;
  const body = JSON.parse(request.body);
  assert.equal(url, 'https://api.moonshot.cn/v1/chat/completions');
  assert.equal(body.model, 'kimi-k3');
  assert.equal(body.reasoning_effort, 'low');
  assert.equal(body.max_completion_tokens, 4096);
  assert.equal(Object.hasOwn(body, 'temperature'), false);
  assert.equal(Object.hasOwn(body, 'max_tokens'), false);
  assert.equal(result.sample, '你好');
});

test('Qwen Plus uses the Beijing endpoint and disables thinking for translation', async (t) => {
  const fetch = t.mock.method(globalThis, 'fetch', async () =>
    Response.json({ choices: [{ message: { content: '你好' } }] }));
  const provider = { ...PROVIDER_PRESETS.qwen, preset: 'qwen', apiKey: 'test-key' };
  await testProvider(provider);
  const [url, request] = fetch.mock.calls[0].arguments;
  const body = JSON.parse(request.body);
  assert.equal(url, 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions');
  assert.equal(body.model, 'qwen-plus');
  assert.equal(body.enable_thinking, false);
});

test('selection surfaces a payment-required response as an actionable billing error', async () => {
  const settings = settingsFor({ provider: { baseUrl: `${baseUrl}/unfunded` } });
  await assert.rejects(() => translateSelection({ text: 'Ruben Gijselhart', settings }), {
    code: 'INSUFFICIENT_BALANCE',
    status: 402,
    retryable: false,
    message: /^翻译服务账户余额不足/,
  });
});
