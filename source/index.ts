const THINKING_TAG = '<thinking>';

function init(): void {
  injectPrompts([
    {
      id: 'thinking-tag-prefill',
      /** 注入到聊天中，作为助手的 prefill（预填），让模型从 <thinking> 开始续写 */
      position: 'in_chat',
      /** depth=0 表示放在聊天末尾，紧贴模型即将生成的回复 */
      depth: 0,
      role: 'assistant',
      content: `${THINKING_TAG}\n`,
    },
  ]);
  console.info('[thinking-start-injector] 已启用：每次生成前预填 <thinking> 到助手回复开头。');
}

$(() => {
  errorCatched(init)();
});
