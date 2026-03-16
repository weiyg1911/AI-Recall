import { createAppClient } from '@memorize/api-client';
import { getToken } from './auth';

export const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002';

export const apiClient = createAppClient(apiBaseUrl);

/**
 * 获取带认证 token 的请求 headers
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
