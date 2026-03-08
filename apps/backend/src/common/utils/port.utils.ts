import { execSync } from 'child_process';

/**
 * 强制关闭占用指定端口的进程
 * 只关闭非台前进程的端口占用
 */
export function killPortProcess(port: number, currentPid: number): boolean {
  try {
    // 查找占用端口的进程 PID
    const pids = execSync(`lsof -ti:${port}`, { encoding: 'utf-8' })
      .trim()
      .split('\n')
      .filter(Boolean)
      .map((pid) => parseInt(pid, 10));

    if (pids.length === 0) {
      return false;
    }

    // 过滤掉当前进程（避免自杀）
    const otherPids = pids.filter((pid) => pid !== currentPid);

    if (otherPids.length === 0) {
      // eslint-disable-next-line no-console
      console.log(`[端口重试] 端口 ${port} 被当前进程占用，继续等待...`);
      return false;
    }

    // 强制关闭其他占用端口的进程
    // eslint-disable-next-line no-console
    console.log(`[端口重试] 发现 ${otherPids.length} 个旧进程占用端口 ${port}，正在关闭...`);
    for (const pid of otherPids) {
      try {
        execSync(`kill -9 ${pid}`, { encoding: 'utf-8' });
        // eslint-disable-next-line no-console
        console.log(`[端口重试] 已关闭进程 PID: ${pid}`);
      } catch (_err) {
        // eslint-disable-next-line no-console
        console.warn(`[端口重试] 关闭进程 ${pid} 失败`);
      }
    }

    // 等待端口释放
    execSync(`sleep 0.5`, { encoding: 'utf-8' });
    return true;
  } catch (err) {
    console.error('❌ killPortProcess error:', err);
    // lsof 失败说明端口没被占用
    return false;
  }
}

/**
 * 带重试机制的端口监听
 * 解决热更新时端口占用问题
 */
export async function listenWithRetry(
  app: any,
  port: number,
  maxRetries = 5,
  retryDelay = 1000,
): Promise<void> {
  const currentPid = process.pid;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await app.listen(port);
      // eslint-disable-next-line no-console
      console.log(`[端口重试] ✅ 成功绑定端口 ${port} (尝试 ${attempt}/${maxRetries})`);
      return;
    } catch (err: any) {
      if (err.code === 'EADDRINUSE' && attempt < maxRetries) {
        // eslint-disable-next-line no-console
        console.warn(
          `[端口重试] 端口 ${port} 被占用，第 ${attempt} 次重试... (${retryDelay}ms 后重试)`,
        );

        // 尝试强制关闭占用端口的旧进程
        const killed = killPortProcess(port, currentPid);
        if (killed) {
          // eslint-disable-next-line no-console
          console.log(`[端口重试] 已清理旧进程，等待端口释放...`);
        }

        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        retryDelay *= 1.5; // 递增延迟
      } else {
        throw err;
      }
    }
  }
}
