# thinking 标签正文开头注入

酒馆助手脚本：每次生成请求前，在发送给模型的正文开头注入 `<thinking>`。

## 文件说明

- `manifest.json`：SillyTavern 第三方扩展安装信息。
- `index.js`：扩展加载时执行的构建产物。
- `source/index.ts`：原始 TypeScript 源码备份。

## 按扩展安装

在 SillyTavern 的第三方扩展安装窗口中输入：

```text
https://github.com/rocholin/1
```

分支可填 `main`，也可以留空。

## 酒馆助手脚本库用法

```ts
import 'https://testingcf.jsdelivr.net/gh/rocholin/1/index.js';
```

如果 jsDelivr 缓存未刷新，可以临时使用 GitHub Raw：

```ts
import 'https://raw.githubusercontent.com/rocholin/1/main/index.js';
```
