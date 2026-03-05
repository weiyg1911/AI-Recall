export * from './generated';
export { createClient } from './generated/client';

import { createClient } from './generated/client';

/**
 * 创建带默认 baseUrl 和 responseStyle: 'data' 的应用级 client。
 * 前端在入口或 lib 中调用一次，后续所有接口传 { client: appClient } 即可，无需重复写 baseUrl。
 */
export function createAppClient(baseUrl: string) {
  return createClient({ baseUrl, responseStyle: 'data' });
}
