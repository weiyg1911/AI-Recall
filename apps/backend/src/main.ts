import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import { spawnSync } from 'child_process';
import { AppModule } from './app.module';

async function bootstrap() {
  let app;
  try {
    app = await NestFactory.create(AppModule);
  } catch (err) {
    console.error('NestFactory.create failed:', err);
    throw err;
  }

  app.enableCors({
    origin: ['http://localhost:3001', 'http://127.0.0.1:3001'],
  });

  const config = new DocumentBuilder()
    .setTitle('背书记忆 API')
    .setDescription('Agent 背书记忆项目接口文档')
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

  // 非生产环境下自动执行 api-client 代码生成，使前端类型与接口同步
  if (process.env.NODE_ENV !== 'production') {
    const repoRoot = path.join(__dirname, '../../..');
    const result = spawnSync(
      'pnpm',
      ['--filter', '@memorize/api-client', 'run', 'generate'],
      { cwd: repoRoot, stdio: 'inherit', shell: true },
    );
    if (result.status !== 0) {
      console.warn(
        '[main] api-client generate 未成功，请手动执行: pnpm --filter @memorize/api-client run generate',
      );
    } else {
      const generatedDir = path.join(
        repoRoot,
        'packages/api-client/src/generated',
      );
      spawnSync('pnpm', ['exec', 'prettier', '--write', generatedDir], {
        cwd: repoRoot,
        stdio: 'inherit',
        shell: true,
      });
    }
  }

  const port = 3002;
  await app.listen(port);
  console.log(`Backend running at http://localhost:${port}`);
  console.log(`Swagger UI at http://localhost:${port}/api-docs`);
}

bootstrap().catch((err) => {
  console.error('Bootstrap failed:', err);
  process.exit(1);
});
