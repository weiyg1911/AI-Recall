import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import path from 'path';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter'; // 引入模板引擎
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './common/config/configuration';
import { RedisModule } from './redis/redis.module'; // 导入 RedisModule
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { KnowledgeModule } from './knowledge/konowledge.module';
import { WinstonModule } from 'nest-winston';
import { WinstonLoggerModule } from './common/logger/winston-logger.module';
import * as winston from 'winston';

import { HttpLoggingInterceptor } from './common/interceptors/http-logging.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerName } from './common/logger/constants';
import { HttpWarpperInterceptor } from './common/interceptors/http-warpper.interceptor';

@Module({
  imports: [
    // 替换原有的日志配置
    WinstonModule.forRoot({
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      transports: [
        new winston.transports.Console({
          format: winston.format.simple(),
        }),
      ],
    }),
    // 导入自己的日志模块
    WinstonLoggerModule.register(LoggerName.app),
    RedisModule,
    AuthModule,
    KnowledgeModule,
    ConfigModule.forRoot({
      load: [configuration], // 加载自定义配置
      isGlobal: true, // 可选，设为全局后无需在每个模块重复导入
    }),
    MailerModule.forRoot({
      transport: {
        host: configuration().mailer.host,
        port: configuration().mailer.port,
        secure: true, // 是否使用 TLS。对于 587 端口通常为 false，对于 465 端口为 true
        auth: {
          user: configuration().mailer.user,
          pass: configuration().mailer.pass,
        },
      },
      defaults: {
        from: configuration().mailer.user,
      },
      template: {
        dir: path.join(__dirname, './email/templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true, // 启用严格模式
        },
      },
    }),
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: configuration().database.uri,
      }),
    }),
    // 配置Jwt的Module
    JwtModule.registerAsync({
      imports: [],
      inject: [],
      useFactory: () => {
        return {
          secret: configuration().jwt.secret,
          signOptions: {
            expiresIn: configuration().jwt.expiresIn, // Token 过期时间
          } as JwtModuleOptions['signOptions'],
        };
      },
      global: true, // 全局模块，任何地方都能用
    }),
  ],
  controllers: [HealthController],
  providers: [
    {
      // Http包装器
      provide: APP_INTERCEPTOR,
      useClass: HttpWarpperInterceptor,
    },
    {
      // APP_INTERCEPTOR 将拦截器设置为全局
      provide: APP_INTERCEPTOR,
      useClass: HttpLoggingInterceptor,
    },
  ],
})
export class AppModule {}
