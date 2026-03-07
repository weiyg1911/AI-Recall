// redis.module.ts
import { Global, Module } from '@nestjs/common';
import { redisProvider } from './redis.provider';

@Global()
@Module({
  providers: [redisProvider],
  exports: [redisProvider], // 导出，让导入本模块的其他模块可以使用它
})
export class RedisModule {}
