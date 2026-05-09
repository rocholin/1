# thinking 标签正文开头注入

酒馆助手脚本：监听 `MESSAGE_RECEIVED` 事件，在每次 AI 回复生成后自动检查最新助手消息是否以 `<thinking>` 开头；如果模型漏掉了，就自动补写到正文开头，确保正则能稳定隐藏思维链。

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

监听酒馆事件 `tavern_events.MESSAGE_RECEIVED`。每当 AI 生成完成时：
1. 获取当前最新助手楼层的消息正文；
2. 如果正文不是以 `<thinking>` 开头（模型漏写了），则用 `setChatMessages` 将 `<thinking>\n` 补写到正文开头；
3. 如果已经以 `<thinking>` 开头，则不做任何操作。
