/**
 * Trace ID 生成工具，用于分布式追踪
 */

/**
 * 生成符合 UUID v4 格式的 trace ID
 * @returns 唯一的 trace ID 字符串
 */
export function generateTraceId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * 会话级别的 trace ID 存储
 * 用于关联同一用户会话中的多个请求
 */
let currentTraceId: string | null = null;

/**
 * 获取或创建会话级别的 trace ID
 * 该 ID 在多个请求之间保持不变，用于会话级别的关联
 * @returns 当前会话的 trace ID
 */
export function getTraceId(): string {
  if (!currentTraceId) {
    currentTraceId = generateTraceId();
  }
  return currentTraceId;
}

/**
 * 重置会话级别的 trace ID
 * 在开始新用户会话或登录/注销后调用此方法
 */
export function resetTraceId(): void {
  currentTraceId = null;
}

/**
 * 生成唯一的请求 ID
 * 每个请求都有自己唯一的标识符，用于细粒度追踪
 * @returns 唯一的请求 ID 字符串
 */
export function generateRequestId(): string {
  return generateTraceId();
}
