import * as fs from 'fs';
import * as path from 'path';
import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
/**
 * 生成OpenAPI规范文件
 */
export function generateOpenApiSpec(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('背书记忆 API')
    .setDescription('Agent 背书记忆项目接口文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  const outputPath = path.join(__dirname, '../../../../../packages/api-client/specs/openapi.json');

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(document, null, 2));
}
