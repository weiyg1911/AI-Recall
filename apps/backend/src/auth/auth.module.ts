import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailModule } from 'src/email/email.module';
import { UserModule } from 'src/user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt/jwt.strategy';
import { WinstonLoggerModule } from 'src/common/logger/winston-logger.module';
import { LoggerName } from 'src/common/logger/constants';

/**
 * 认证模块：通过 imports [EmailModule] 使用邮箱能力，不在此处声明 EmailService。
 */
@Module({
  imports: [EmailModule, UserModule, PassportModule, WinstonLoggerModule.register(LoggerName.auth)],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
