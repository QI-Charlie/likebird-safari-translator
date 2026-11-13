import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

/**
 * End-to-end test of the generated background bundle. It exercises the same
 * message router Safari uses, with an in-memory version of the browser API and
 * a real local HTTP provider.
 */

let server;
let baseUrl;
let requestCount = 0;
let messageListener;
const store = {};
const sentToTabs = [];

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
    const body = JSON.parse(await readBody(request));
    requestCount += 1;
    response.setHeader('content-type', 'application/json');
    const user = JSON.parse(body.messages?.[1]?.content || '{}');
    if (Array.isArray(user.items)) {
      const translations = user.items.map((item) => ({
        id: item.id,
        text: `译文-${item.id}`,
      }));
      response.end(
        JSON.stringify({
          choices: [
            { message: { content: JSON.stringify({ translations }) } },
          ],
        }),
      );
      return;
    }
    response.end(
      JSON.stringify({
        choices: [{ message: { content: `译文：${user.selected_text || 'Hello'}` } }],
      }),
    );
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}/v1`;

  const browser = {
    runtime: {
      id: 'mock',
      getManifest: () => ({ version: '1.0.0' }),
      getURL: (path) => `safari-web-extension://mock/${path}`,
      openOptionsPage: async () => {},
      onInstalled: { addListener: () => {} },
      onStartup: { addListener: () => {} },
      onMessage: {
        addListener: (listener) => {
          messageListener = listener;
        },
      },
    },
    storage: {
      local: {
        async get(keys) {
          if (typeof keys === 'string') return { [keys]: store[keys] };
          if (Array.isArray(keys)) {
            return Object.fromEntries(keys.map((key) => [key, store[key]]));
          }
          return { ...store };
        },
        async set(values) {
          Object.assign(store, values);
        },
        async remove(keys) {
          for (const key of Array.isArray(keys) ? keys : [keys]) delete store[key];
        },
      },
      onChanged: { addListener: () => {} },
    },
    tabs: {
      query: async () => [{ id: 1, url: 'https://example.com' }],
      get: async (id) => ({ id, url: 'https://example.com' }),
      sendMessage: async (tabId, message, options) => {
        sentToTabs.push({ tabId, message, options });
        if (message.type === 'page.status') {
          return {
            active: false,
            translated: 2,
            total: 2,
            errors: 0,
            hasTranslation: true,
          };
        }
        return { ok: true, pong: true };
      },
      insertCSS: async () => {},
      executeScript: async () => {},
      onUpdated: { addListener: () => {} },
    },
    browserAction: {
      setBadgeText: async () => {},
      setBadgeBackgroundColor: async () => {},
    },
    contextMenus: {
      removeAll: async () => {},
      create: () => {},
      onClicked: { addListener: () => {} },
    },
    commands: { onCommand: { addListener: () => {} } },
  };

  const context = vm.createContext({
    browser,
    chrome: undefined,
    fetch,
    console,
    setTimeout,
    clearTimeout,
    AbortController,
    URL,
    Headers,
    Request,
    Response,
    Math,
    Date,
    JSON,
    Promise,
  });
  const code = readFileSync(new URL('../extension/background.js', import.meta.url), 'utf8');
  vm.runInContext(code, context, { filename: 'background.js' });
  await new Promise((resolve) => setTimeout(resolve, 40));
});

after(() => new Promise((resolve) => server.close(resolve)));

function send(message, sender = { url: 'safari-web-extension://mock/options.html' }) {
  return new Promise((resolve, reject) => {
    try {
      const returned = messageListener(message, sender, resolve);
      if (returned !== true) reject(new Error('message listener must keep the channel open'));
    } catch (error) {
      reject(error);
    }
  });
}

const contentSender = {
  tab: { id: 1, url: 'https://example.com/article' },
  url: 'https://example.com/article',
  frameId: 0,
};

test('background message router: settings, batch cache, selection and page commands', async () => {
  const initial = await send({ type: 'settings.get' });
  assert.equal(initial.ok, true);
  assert.equal(initial.settings.configured, false);

  const provider = {
    preset: 'custom',
    type: 'openai',
    baseUrl,
    apiKey: 'test-key',
    model: 'mock-model',
    temperature: 0.2,
    maxTokens: 1024,
    jsonMode: true,
    extraHeaders: '',
  };
  const updated = await send({
    type: 'settings.update',
    patch: { provider, targetLang: 'zh-CN', cache: { enabled: true, maxEntries: 50 } },
  });
  assert.equal(updated.ok, true);
  assert.equal(updated.settings.configured, true);

  const batch = await send(
    {
      type: 'translate.batch',
      items: [
        { id: 'a', text: 'Hello' },
        { id: 'b', text: 'World' },
      ],
      context: { title: 'Article', url: 'https://example.com/article' },
    },
    contentSender,
  );
  assert.equal(batch.ok, true);
  assert.equal(batch.translations.a, '译文-a');
  assert.equal(batch.translations.b, '译文-b');
  assert.equal(batch.cached, 0);
  assert.equal(requestCount, 1);

  const cached = await send(
    {
      type: 'translate.batch',
      items: [
        { id: 'a', text: 'Hello' },
        { id: 'b', text: 'World' },
      ],
    },
    contentSender,
  );
  assert.equal(cached.cached, 2);
  assert.equal(requestCount, 1);

  const selection = await send(
    { type: 'translate.selection', text: 'Hello world', context: {} },
    contentSender,
  );
  assert.equal(selection.ok, true);
  assert.match(selection.translation, /Hello world/);

  const status = await send(
    { type: 'page.status', tabId: 1 },
    { url: 'safari-web-extension://mock/popup.html' },
  );
  assert.equal(status.ok, true);
  assert.equal(status.status.hasTranslation, true);

  const command = await send(
    { type: 'page.command', command: 'translate', tabId: 1 },
    { url: 'safari-web-extension://mock/popup.html' },
  );
  assert.equal(command.ok, true);
  assert.equal(sentToTabs.at(-1).message.type, 'page.translate');

  const cleared = await send({ type: 'cache.clear' });
  assert.equal(cleared.ok, true);
  await send(
    {
      type: 'translate.batch',
      items: [{ id: 'c', text: 'Hello' }],
    },
    contentSender,
  );
  // One batch request, one selection request, one post-clear batch request.
  assert.equal(requestCount, 3);
});
