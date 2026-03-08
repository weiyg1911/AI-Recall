import { spawnSync } from 'child_process';
import * as path from 'path';

/**
 * 生成API客户端代码
 * 在非生产环境下自动执行，使前端类型与接口同步
 */
export function generateApiClient(): void {
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  const repoRoot = path.join(__dirname, '../../../../../');

  // 生成API客户端代码
  const result = spawnSync('pnpm', ['--filter', '@memorize/api-client', 'run', 'generate'], {
    cwd: repoRoot,
    stdio: 'inherit',
    shell: true,
  });

  if (result.status !== 0) {
    console.warn(
      '[main] api-client generate 未成功，请手动执行: pnpm --filter @memorize/api-client run generate',
    );
    return;
  }

  // 格式化生成的代码
  const generatedDir = path.join(repoRoot, 'packages/api-client/src/generated');
  spawnSync('pnpm', ['exec', 'prettier', '--write', generatedDir], {
    cwd: repoRoot,
    stdio: 'inherit',
    shell: true,
  });
}
