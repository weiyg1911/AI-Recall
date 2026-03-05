import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  let app;
  try {
    app = await NestFactory.create(AppModule);
  } catch (err) {
    console.error('NestFactory.create failed:', err);
    throw err;
  }

  app.enableCors({ origin: ['http://localhost:3001', 'http://127.0.0.1:3001'] });

  const config = new DocumentBuilder()
    .setTitle('背书记忆 API')
    .setDescription('健康检查及业务接口 · Agent 背书记忆项目')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const outputPath = path.join(
    __dirname,
    '../../../packages/api-client/specs/openapi.json',
  );
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(document, null, 2));

  const port = 3002;
  await app.listen(port);
  console.log(`Backend running at http://localhost:${port}`);
  console.log(`Swagger UI at http://localhost:${port}/api-docs`);
}

bootstrap().catch((err) => {
  console.error('Bootstrap failed:', err);
  process.exit(1);
});
