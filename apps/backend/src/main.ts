import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { listenWithRetry } from './common/utils/port.utils';
import { setupSwagger, generateOpenApiSpec } from './common/swagger';
import { generateApiClient } from './common/api-client';

async function bootstrap() {
  let app;
  try {
    app = await NestFactory.create(AppModule);
  } catch (err) {
    console.error('NestFactory.create failed:', err);
    throw err;
  }

  // 启用CORS
  app.enableCors({
    origin: ['http://localhost:3001', 'http://127.0.0.1:3001'],
  });

  // 设置Swagger文档
  setupSwagger(app);

  // 生成OpenAPI规范文件
  generateOpenApiSpec(app);

  // 生成API客户端代码
  generateApiClient();

  // 启动服务器
  const port = 3002;
  await listenWithRetry(app, port);
  console.log(`Backend running at http://localhost:${port}`);
  console.log(`Swagger UI at http://localhost:${port}/api-docs`);
}

bootstrap().catch((err) => {
  console.error('Bootstrap failed:', err);
  process.exit(1);
});
