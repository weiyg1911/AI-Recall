import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailModule } from 'src/email/email.module';
import { UserModule } from 'src/user/user.module';

/**
 * 认证模块：通过 imports [EmailModule] 使用邮箱能力，不在此处声明 EmailService。
 */
@Module({
  imports: [EmailModule, UserModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
