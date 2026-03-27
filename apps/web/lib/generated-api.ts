/**
 * 自动生成的 API 包装函数
 * 由 apps/web/scripts/generate-api-wrappers.ts 生成
 * 请勿手动编辑此文件
 *
 * 所有函数已自动注入预配置的 apiClient，包含：
 * - 自动 traceId 和 requestId 注入
 * - 自动认证 token 注入
 * - 无需手动传递 client 参数
 */

import { apiClient } from './api';
import * as ApiSDK from '@memorize/api-client';

export type * from '@memorize/api-client';

/**
 * 预配置的 API 函数集合
 * 所有函数已自动注入 client，无需手动传递 client 参数
 */
export const {
  healthControllerCheckHealth,
  healthControllerPing,
  healthControllerGetServerTime,
  authControllerSendOtp,
  authControllerVerifyOtp,
  knowledgeControllerGetKnowledgeList,
  knowledgeControllerCreateKnowledge
} = Object.fromEntries(
  Object.entries(ApiSDK).map(([name, fn]) => {
    if (typeof fn !== 'function') return [name, fn];

    // 返回包装后的函数，自动注入 client
    return [
      name,
      (options: any) => {
        // 如果用户已经提供了 client，使用用户的；否则使用默认的 apiClient
        return fn({
          client: apiClient,
          ...options,
        });
      },
    ];
  }),
) as typeof ApiSDK;
