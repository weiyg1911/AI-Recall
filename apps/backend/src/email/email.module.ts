import { Module } from '@nestjs/common';
import { EmailService } from './email.service';

/**
 * 邮箱模块：一处实现、多处复用、单例。
 * 其他模块（auth、营销、订单等）通过 imports: [EmailModule] 注入 EmailService，共享同一实例。
 */
@Module({
  imports: [],
  controllers: [],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
