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

@Module({
  imports: [
    RedisModule,
    AuthModule,
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
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
