const THINKING_TAG = '<thinking>';

function prependThinkingTagToText(text: string): string {
  if (text.trimStart().startsWith(THINKING_TAG)) {
    return text;
  }
  return `${THINKING_TAG}\n${text}`;
}

function prependThinkingTagToMessage(message: SillyTavern.SendingMessage): void {
  if (typeof message.content === 'string') {
    message.content = prependThinkingTagToText(message.content);
    return;
  }

  const first_text_part = message.content.find(part => part.type === 'text');
  if (first_text_part) {
    first_text_part.text = prependThinkingTagToText(first_text_part.text);
    return;
  }

  message.content.unshift({ type: 'text', text: `${THINKING_TAG}\n` });
}

function prependThinkingTagToFirstPromptMessage(messages: SillyTavern.SendingMessage[]): void {
  const first_message = messages[0];
  if (!first_message) {
    return;
  }
  prependThinkingTagToMessage(first_message);
}

function init(): void {
  console.info('[thinking-start-injector] 已启用：每次生成前会在发送正文开头注入 <thinking>。');

  eventOn(tavern_events.GENERATE_AFTER_COMBINE_PROMPTS, result => {
    if (result.dryRun) {
      return;
    }
    result.prompt = prependThinkingTagToText(result.prompt);
  });

  eventOn(tavern_events.GENERATE_AFTER_DATA, (generate_data, dry_run) => {
    if (dry_run) {
      return;
    }
    prependThinkingTagToFirstPromptMessage(generate_data.prompt);
  });

  eventOn(tavern_events.CHAT_COMPLETION_PROMPT_READY, event_data => {
    if (event_data.dryRun) {
      return;
    }
    prependThinkingTagToFirstPromptMessage(event_data.chat);
  });
}

$(() => {
  errorCatched(init)();
});
