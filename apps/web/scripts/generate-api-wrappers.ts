/**
 * 自动生成 web 端 API 包装函数脚本
 * 从 @memorize/api-client 生成的 API 函数中创建预配置的版本
 */

import * as fs from 'fs';
import * as path from 'path';

const GENERATED_API_FILE = path.join(__dirname, '../../../packages/api-client/src/generated/sdk.gen.ts');
const OUTPUT_FILE = path.join(__dirname, '../lib/generated-api.ts');

/**
 * 从 SDK 文件中提取所有导出的 API 函数
 */
function extractApiFunctions(content: string): string[] {
  const functions: string[] = [];

  // 匹配 export const functionName 的模式
  const functionRegex = /export\s+const\s+(\w+)\s*=/g;
  let match;

  while ((match = functionRegex.exec(content)) !== null) {
    const functionName = match[1];
    // 排除非控制器函数
    if (functionName.startsWith('Controller') ||
        functionName.startsWith('health') ||
        functionName.startsWith('auth') ||
        functionName.startsWith('knowledge')) {
      functions.push(functionName);
    }
  }

  return functions;
}

/**
 * 生成 API 包装函数代码
 */
function generateWrapperCode(functions: string[]): string {
  const functionExports = functions.map(name => `  ${name}`).join(',\n');

  return `/**
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
${functionExports.split(', ').join(',\n  ')}
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
`;
}

/**
 * 主函数
 */
function main() {
  console.log('🚀 开始生成 web 端 API 包装函数...');

  // 检查 SDK 文件是否存在
  if (!fs.existsSync(GENERATED_API_FILE)) {
    console.error('❌ 找不到生成的 SDK 文件:', GENERATED_API_FILE);
    console.log('💡 请先运行 pnpm --filter @memorize/api-client generate');
    process.exit(1);
  }

  // 读取 SDK 文件内容
  const sdkContent = fs.readFileSync(GENERATED_API_FILE, 'utf-8');

  // 提取 API 函数
  const apiFunctions = extractApiFunctions(sdkContent);

  if (apiFunctions.length === 0) {
    console.warn('⚠️  未找到任何 API 函数');
    return;
  }

  console.log(`✅ 找到 ${apiFunctions.length} 个 API 函数:`);
  apiFunctions.forEach(fn => console.log(`   - ${fn}`));

  // 生成包装代码
  const wrapperCode = generateWrapperCode(apiFunctions);

  // 确保输出目录存在
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 写入文件
  fs.writeFileSync(OUTPUT_FILE, wrapperCode, 'utf-8');

  console.log(`✅ 已生成 API 包装函数: ${OUTPUT_FILE}`);
  console.log('📝 现在可以从 @/lib/generated-api 导入所有 API 函数');
}

// 运行脚本
main();
