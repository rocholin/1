# thinking 标签正文开头注入

酒馆助手脚本：每次生成请求前，用 `injectPrompts` API 在聊天末尾预填 `<thinking>` 作为助手回复 prefill，让模型从 `<thinking>` 开始续写。

## 文件说明

- `index.js`：构建产物，在酒馆助手脚本库中通过 `import` 加载。
- `source/index.ts`：原始 TypeScript 源码备份。
- `manifest.json`：SillyTavern 原生扩展安装信息（**仅作为参考，请勿使用此方式安装，因为原生扩展沙箱中不支持酒馆助手 API**）。

## 安装方式（唯一推荐）

在酒馆助手的脚本库中新建一个脚本，内容写：

```ts
import 'https://testingcf.jsdelivr.net/gh/rocholin/1/index.js';
```

如果 jsDelivr 缓存未刷新，可以临时使用 GitHub Raw：

```ts
import 'https://raw.githubusercontent.com/rocholin/1/main/index.js';
```

## 原理

使用酒馆助手的 `injectPrompts` API，注册一条 `role: 'assistant'` 的提示词注入到聊天末尾（`depth: 0`），内容就是 `<thinking>\n`。每次 AI 生成回复时，这条 prefill 会被拼接到消息末尾，模型会从 `<thinking>` 开头自然续写。
