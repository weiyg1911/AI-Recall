// redis.provider.ts
import { Provider } from '@nestjs/common';
import Redis from 'ioredis';
import configuration from 'src/common/config/configuration';

// 1. 定义一个 Injection Token，方便后续注入
export const REDIS_CLIENT = 'REDIS_CLIENT';

// 2. 定义一个类型，方便使用
export type RedisClient = Redis;

// 3. 创建自定义提供者
export const redisProvider: Provider = {
  provide: REDIS_CLIENT, // 使用我们定义的 Token
  useFactory: () => {
    // 这里是实际的 Redis 客户端创建逻辑
    const client = new Redis({
      host: configuration().redis.host, // Redis 服务器地址，建议从环境变量读取
      port: configuration().redis.port, // Redis 服务器端口
      // 其他配置选项，例如密码、数据库索引等
      // password: 'your-password',
      // db: 0,
    });

    client.on('connect', () => {
      console.log('Redis 连接成功');
    });

    client.on('error', (err) => {
      console.error('Redis 连接错误:', err);
    });

    return client;
  },
  // 因为 Redis 客户端需要在我们使用时已经就绪，所以这里的作用域是默认的单例即可
};
