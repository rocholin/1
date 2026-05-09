# thinking 标签正文开头注入

酒馆助手脚本：每次生成请求前，在发送给模型的正文开头注入 `<thinking>`。

## 文件说明

- `index.js`：酒馆助手可直接远程导入的构建产物。
- `source/index.ts`：原始 TypeScript 源码备份。

## 酒馆助手脚本库用法

```ts
import 'https://testingcf.jsdelivr.net/gh/rocholin/1/index.js';
```

如果 jsDelivr 缓存未刷新，可以临时使用 GitHub Raw：

```ts
import 'https://raw.githubusercontent.com/rocholin/1/main/index.js';
```
