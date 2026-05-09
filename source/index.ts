const THINKING_TAG = '<thinking>';

/**
 * 收到 AI 回复后检查正文是否以 <thinking> 开头；
 * 如果模型漏掉了，则自动补写到正文开头。
 */
async function ensureThinkingTag(message_id: number): Promise<void> {
  const [msg] = getChatMessages(message_id);
  if (!msg || msg.role !== 'assistant') return;

  const text = msg.message.trimStart();
  if (text.startsWith(THINKING_TAG)) return;

  // 模型漏掉了 <thinking> 标签，补写到正文开头
  await setChatMessages([{ message_id, message: `${THINKING_TAG}\n${msg.message}` }]);
  console.info(`[thinking-start-injector] 已为第 ${message_id} 楼补写 <thinking> 标签。`);
}

function init(): void {
  eventOn(tavern_events.MESSAGE_RECEIVED, (message_id: number) => {
    errorCatched(ensureThinkingTag)(message_id);
  });
  console.info('[thinking-start-injector] 已启用：每次收到消息后检查并补全 <thinking> 标签。');
}

$(() => {
  errorCatched(init)();
});
