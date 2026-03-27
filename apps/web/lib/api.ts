import { createAppClient } from '@memorize/api-client';
import { getToken } from './auth';
import { generateTraceId, generateRequestId } from './trace';

export const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002';

export const apiClient = createAppClient(apiBaseUrl);

// Add request interceptor for automatic traceId and token injection
apiClient.interceptors.request.use(async (request) => {
  const traceId = generateTraceId();
  const requestId = generateRequestId();
  const token = getToken();

  // 自动注入 traceId 和 requestId
  request.headers.set('X-Trace-Id', traceId);
  request.headers.set('X-Request-Id', requestId);

  // 自动注入认证 token
  if (token) {
    request.headers.set('Authorization', `Bearer ${token}`);
  }

  return request;
});

/**
 * 获取带认证 token 的请求 headers
 * @deprecated 拦截器已自动处理，此函数已过时
 */
export function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  if (!token) {
    return {};
  }
  return {
    Authorization: `Bearer ${token}`,
  };
}

/**
 * 从生成的 API 包装函数中重新导出所有内容
 * 由 scripts/generate-api-wrappers.ts 自动生成
 */
export * from './generated-api';
