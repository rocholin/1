/**
 * 思维链标签修复脚本
 *
 * 监听 MESSAGE_RECEIVED 事件，在 AI 生成完成后自动修复正文中的 <thinking> 标签：
 * - 补全缺失的 <thinking> 或 </thinking>
 * - 移除多余的重复标签
 * - 修正标签位置使其位于 <content> 之前
 * - 清除 <thinking> 块内的 <UpdateVariable> 残留
 */

const THINKING_TAG = '<thinking>';
const THINKING_CLOSE = '</thinking>';
const CONTENT_TAG = '<content>';

/**
 * 修复 thinking 标签的数量和位置。
 * 保证最终结构为: <thinking>...</thinking>\n<content>...
 * 如果修复失败，返回原字符串。
 */
function fixThinkingTags(text: string): string {
  if (!text.includes(CONTENT_TAG)) return text;

  let result = text;

  // ---- 处理 <thinking> 开标签 ----
  const openCount = (result.match(/<thinking>/g) || []).length;

  if (openCount === 0) {
    // 完全没有 <thinking>：补到正文最开头
    result = `${THINKING_TAG}\n${result}`;
  } else if (openCount === 1) {
    // 只有一个，但可能不在开头：把它挪到开头
    if (!result.trimStart().startsWith(THINKING_TAG)) {
      const idx = result.indexOf(THINKING_TAG);
      const prefix = result.slice(0, idx).trimStart();
      const suffix = result.slice(idx);
      result = suffix + (prefix ? `\n${prefix}` : '');
    }
  } else if (result.trimStart().startsWith(THINKING_TAG)) {
    // 多个 <thinking>：第一个已经在开头，去掉后面多余的
    const idx = result.indexOf(THINKING_TAG);
    const head = result.slice(0, idx + 10);
    const tail = result.slice(idx + 10);
    result = head + tail.replace(/<thinking>/g, '');
  } else {
    // 多个 <thinking> 但不在开头：全删，在开头补一个
    result = result.replace(/<thinking>/g, '');
    result = `${THINKING_TAG}\n${result}`;
  }

  // ---- 处理 </thinking> 闭标签 ----
  const closeCount = (result.match(/<\/thinking>/g) || []).length;
  const contentIdx = result.indexOf(CONTENT_TAG);

  if (closeCount === 0) {
    // 没有闭标签：在 <content> 前插入
    result = result.slice(0, contentIdx) + `${THINKING_CLOSE}\n${result.slice(contentIdx)}`;
  } else if (closeCount === 1) {
    // 只有一个，但如果它在 <content> 后面，移到前面
    if (result.indexOf(THINKING_CLOSE) > contentIdx) {
      result = result.replace(THINKING_CLOSE, '');
      const newContentIdx = result.indexOf(CONTENT_TAG);
      result = `${result.slice(0, newContentIdx)}${THINKING_CLOSE}\n${result.slice(newContentIdx)}`;
    }
  } else {
    // 多个 </thinking>：只保留第一个正确位置的
    const firstClose = result.indexOf(THINKING_CLOSE);
    if (firstClose < contentIdx) {
      // 第一个在 <content> 前：保留它，删掉后面的
      const head = result.slice(0, firstClose + 12);
      const tail = result.slice(firstClose + 12);
      result = head + tail.replace(/<\/thinking>/g, '');
    } else {
      // 第一个在 <content> 后：全删，在 <content> 前插入一个
      result = result.replace(/<\/thinking>/g, '');
      const newContentIdx = result.indexOf(CONTENT_TAG);
      result = `${result.slice(0, newContentIdx)}${THINKING_CLOSE}\n${result.slice(newContentIdx)}`;
    }
  }

  // ---- 最终验证 ----
  const finalOpen = (result.match(/<thinking>/g) || []).length;
  const finalClose = (result.match(/<\/thinking>/g) || []).length;
  if (finalOpen !== 1 || finalClose !== 1) {
    console.warn('[思维链标签修复] 修复后 thinking 标签数量不正确，保持原内容');
    return text;
  }

  const openIdx = result.indexOf(THINKING_TAG);
  const closeIdx = result.indexOf(THINKING_CLOSE);
  const finalContentIdx = result.indexOf(CONTENT_TAG);
  if (openIdx > closeIdx || closeIdx > finalContentIdx) {
    console.warn('[思维链标签修复] 修复后标签顺序不正确，保持原内容');
    return text;
  }

  return result;
}

/**
 * 移除 <thinking>...</thinking> 块内残留的 <UpdateVariable> 标签。
 */
function removeUpdateVariableInThinking(text: string): string {
  const openIdx = text.indexOf(THINKING_TAG);
  const closeIdx = text.indexOf(THINKING_CLOSE);
  if (openIdx === -1 || closeIdx === -1) return text;

  const before = text.slice(0, openIdx + 10);
  const thinking = text.slice(openIdx + 10, closeIdx);
  const after = text.slice(closeIdx);

  const cleaned = thinking.replace(/<\/?UpdateVariable\/?>/gi, '');
  return before + cleaned + after;
}

/**
 * 收到 AI 回复后修复思维链标签。
 */
async function ensureThinkingTag(message_id: number): Promise<void> {
  const messages = getChatMessages(message_id);
  if (messages.length === 0) return;

  const msg = messages[0];
  if (msg.role !== 'assistant') return;

  const original = msg.message;
  let fixed = fixThinkingTags(original);
  fixed = removeUpdateVariableInThinking(fixed);

  if (fixed !== original) {
    await setChatMessages([{ message_id, message: fixed }], { refresh: 'affected' });
    console.log(`[思维链标签修复] 已修复第 ${message_id} 楼的标签`);
  }
}

function init(): void {
  eventOn(tavern_events.MESSAGE_RECEIVED, (message_id: number) => {
    errorCatched(ensureThinkingTag)(message_id);
  });
  console.log('[思维链标签修复] 脚本初始化完成');
}

$(() => {
  toastr.success('思维链标签修复脚本已加载');
  errorCatched(init)();
});

$(window).on('pagehide', () => {
  console.log('[思维链标签修复] 脚本已卸载');
});
