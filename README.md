# LikeBird 飞译

**Like a Bird.** 用母语，自由读设计。

LikeBird 飞译是一款开源的 Safari 翻译扩展，可接入你选择的大模型 API。

- **整页翻译**支持双语对照和仅译文。默认译为简体中文，先翻译可见内容，滚动时继续。仅译文原位替换文字，沿用原网页的样式和交互。随时可显示原文。
- **划词翻译**在所选文字旁显示译文，可复制或朗读。
- **站点自动翻译**允许在同一网站内跳转后继续翻译。可通过 Safari 工具栏弹窗按网站启停。

## 安装

需要 macOS 12、Safari 15 或更新版本。安装包包含 Apple 芯片和 Intel 两种架构。

1. 从 [v1.2.0 发布页](https://github.com/QI-Charlie/likebird-safari-translator/releases/tag/v1.2.0) 下载 `LikeBird-1.2.0.dmg`。
2. 打开映像，将 LikeBird 拖到「应用程序」，然后打开 LikeBird。
3. 通过 App 打开 Safari 扩展设置，启用「LikeBird 飞译」并为需要翻译的网站授予访问权限。
4. 点击工具栏图标里的设置按钮，选择服务商并填写 API Key。

当前安装包使用临时签名，适合开发测试。若 macOS 或 Safari 拦截应用，可按系统提示在「隐私与安全」中确认打开，并在 Safari「设置 → 高级」启用网页开发者功能，再在「开发」菜单开启「允许未签名的扩展」。重启 Safari 后可能需要重新开启。如果 Safari 同时列出旧版，先停用旧扩展，再确认新版能正常工作。可在旧版卸载前导出设置，导入后重新填写 API Key。

## 连接与使用

选择服务商即可预填 API 地址、协议和模型。「推荐 API」提供密钥、计费和接入文档入口。「高级连接参数」可配置兼容服务，本机服务需先启动其 API。

本版新增千问（阿里云百炼北京地域的按量付费 API）、智谱 GLM（标准 API）和 Kimi（月之暗面开放平台按量付费 API）的推荐入口与默认模型。

快捷键 `⌥ A` 启动整页翻译，翻译中可停止，翻译后可显示原文。划词翻译快捷键为 `⌥ S`。部分 Safari 内部页面、PDF、图片和 Canvas 无法提取正文。

## 隐私与安全

API Key 与翻译缓存保存在本机 Safari 扩展存储中。在线翻译时，待译文字与用于认证的 API Key 随请求直接发给你配置的服务商。网页正文若含私人信息，参与在线翻译时也可能随请求发送。飞译跳过密码框等表单输入，可在「更多阅读设置」关闭页面标题和上下文发送、清除缓存或排除站点。服务商的数据政策适用于其收到的请求。

导出设置会省略 API Key 与自定义请求头。简体转繁体可由随扩展打包的 OpenCC 字典在本机完成。完整说明见扩展内的「隐私与安全」。

## 开发与打包

需要 Node.js 20+、Xcode Command Line Tools 和 Python 3。

```sh
npm ci
npm test
python3 -m venv .tools/installer-venv
source .tools/installer-venv/bin/activate
python3 -m pip install ds_store
npm run dmg
```

`src/` 是扩展源码，`native/` 是 macOS 宿主及扩展桥接，`extension/` 由 `npm run build` 生成。构建产物位于 `dist/`。`MACOS_ARCHS` 可指定目标架构，`CODESIGN_IDENTITY` 可指定签名身份。公开分发时需要按所选渠道完成 Apple 签名和公证。

项目沿用原 bundle ID、存储键与服务商标识，兼容已有设置。版本历史见 [更新日志](CHANGELOG.md)。

## 作者与许可

微信 `YAXIONG2026`，邮箱 [yaxiongqi@gmail.com](mailto:yaxiongqi@gmail.com)。

项目采用 [MIT](LICENSE) 许可证。界面图标来自 [Remix Icon v4.8.0](https://github.com/Remix-Design/RemixIcon/tree/v4.8.0)，许可见 [Remix Icon LICENSE](assets/remix-icon/LICENSE)。
