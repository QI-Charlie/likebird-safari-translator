import { PROVIDER_PRESETS } from '../shared/constants.js';

const providerDocs = {
  deepseek: ['https://platform.deepseek.com/api_keys', 'https://platform.deepseek.com/top_up', 'https://api-docs.deepseek.com/zh-cn/'],
  qwen: ['https://help.aliyun.com/zh/model-studio/get-api-key', 'https://help.aliyun.com/zh/model-studio/model-pricing', 'https://help.aliyun.com/zh/model-studio/compatibility-of-openai-with-dashscope'],
  zhipu: ['https://bigmodel.cn/usercenter/proj-mgmt/apikeys', 'https://bigmodel.cn/pricing', 'https://docs.bigmodel.cn/cn/guide/models/free/glm-4.7-flash'],
  moonshot: ['https://platform.kimi.com/console/api-keys', 'https://platform.kimi.com/docs/pricing/chat', 'https://platform.kimi.com/docs/guide/kimi-k3-quickstart'],
  openai: ['https://platform.openai.com/api-keys', 'https://platform.openai.com/settings/organization/billing/overview', 'https://developers.openai.com/api/docs/models/gpt-4.1-mini'],
  anthropic: ['https://platform.claude.com/settings/keys', 'https://platform.claude.com/settings/billing', 'https://platform.claude.com/docs/en/models/overview'],
  openrouter: ['https://openrouter.ai/settings/keys', 'https://openrouter.ai/settings/credits', 'https://openrouter.ai/docs/quickstart'],
};

const el = (id) => document.getElementById(id);
const pages = ['home', 'privacy', 'about', 'updates'];
const anchors = { settings: 'home', service: 'home', api: 'home', source: 'about', contact: 'about', support: 'about' };

const releases = [
  ['1.2.0', '2026-11-14', ['新增｜LikeBird 飞译品牌、设置主页、隐私与安全和更新日志。', '新增｜千问、智谱 GLM 和 Kimi API 预设及官方接入入口。', '改进｜Safari 弹窗、整页与划词示例，以及 macOS 拖拽安装体验。']],
  ['1.1.6', '2026-11-14', ['改进｜划词入口换成白底绿标，常用操作采用 Remix Icon。', '修复｜余额不足时显示明确提示。划词可以复用已有整页译文。']],
  ['1.1.5', '2026-11-14', ['新增｜双语对照与仅译文可随时切换。', '修复｜网页已有译文时，弹窗偶发报错且「显示原文」消失。']],
  ['1.1.4', '2026-11-13', ['新增｜当前网站自动翻译开关，站内跳转后继续翻译。', '改进｜优先翻译可见内容，滚动时继续。默认目标改为简体中文。']],
  ['1.1.3', '2026-11-13', ['改进｜译文写回原来的文字位置，保留网页样式和交互。', '新增｜本地简体转繁体，该版本默认译为繁体中文。']],
  ['1.1.2', '2026-11-13', ['修复｜部分旧标签点击翻译无反馈，弹窗增加启动进度和连接错误提示。']],
  ['1.1.1', '2026-11-13', ['修复｜Safari 扩展后台加载异常，影响弹窗和服务配置。']],
  ['1.1.0', '2026-11-13', ['改进｜服务商预设和扩展界面。', '新增｜macOS 拖拽安装包。']],
  ['1.0.0', '2026-11-13', ['初版｜支持 Safari 整页翻译、划词翻译和自带模型 API。']],
];

function element(tag, text) {
  const node = document.createElement(tag);
  node.textContent = text;
  return node;
}

function renderProviders() {
  const labels = ['获取 Key', 'API 计费', '接入文档'];
  for (const [id, urls] of Object.entries(providerDocs)) {
    const { label, model } = PROVIDER_PRESETS[id];
    const row = element('article', '');
    const links = element('p', '');
    for (const [index, url] of urls.entries()) {
      const link = element('a', labels[index]);
      link.href = url;
      link.target = '_blank';
      link.rel = 'noreferrer';
      links.append(link);
    }
    row.append(element('h3', label), element('code', model), links);
    el('providerList').append(row);
  }
}

function renderReleases() {
  for (const [version, date, changes] of releases) {
    const release = element('article', '');
    release.className = 'release';
    release.id = `v${version}`;
    const title = element('h2', '');
    const link = element('a', version);
    link.href = `#updates/${version}`;
    const time = element('time', date.replaceAll('-', '.'));
    time.dateTime = date;
    title.append(link, time);
    const list = element('ul', '');
    for (const change of changes) {
      const [label, description] = change.split('｜');
      const item = element('li', '');
      item.append(element('b', label), description);
      list.append(item);
    }
    release.append(title, list);
    el('timeline').append(release);
  }
}

function route() {
  const [destination, version] = location.hash.slice(1).split('/');
  const anchor = Object.prototype.hasOwnProperty.call(anchors, destination) ? destination : '';
  const active = anchor ? anchors[anchor] : pages.includes(destination) ? destination : 'home';
  for (const id of pages) el(id).hidden = id !== active;
  for (const link of document.querySelectorAll('.rail a')) {
    if (link.hash === `#${active}`) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
  const section = el(anchor || (active === 'updates' && version ? `v${version}` : ''));
  if (section) section.scrollIntoView();
  else window.scrollTo(0, 0);
}

export function initSite() {
  renderProviders();
  renderReleases();
  el('previewMode').addEventListener('change', (event) => {
    el('previewPaper').dataset.display = event.target.value;
  });
  window.addEventListener('hashchange', route);
  route();
}
