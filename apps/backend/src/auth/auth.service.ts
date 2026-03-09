import { Inject, Injectable } from '@nestjs/common';
import { EmailService } from 'src/email/email.service';
import { REDIS_EXPIRE_TIME, REDIS_KEY_PREFIX } from 'src/redis/redis.constants';
import { REDIS_CLIENT, RedisClient } from 'src/redis/redis.provider';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: RedisClient,
    private readonly emailService: EmailService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async sendOtp(email: string) {
    try {
      const code = Math.floor(100000 + Math.random() * 900000);
      await this.redis.set(REDIS_KEY_PREFIX + email, code, 'EX', REDIS_EXPIRE_TIME);
      await this.emailService.sendEmail({
        to: email,
        subject: '欢迎加入我们的平台！',
        template: './register', // 使用上面配置的模板目录下的 `welcome.hbs` 文件
        context: {
          // 传递给模板的上下文变量
          name: '新用户',
          platform: 'ai-recall',
          code: code,
        },
      });
      console.log('1111发送邮件成功');
      return true;
    } catch (error) {
      console.error('发送邮件失败:', error);
      // 这里可以进行更完善的错误处理，例如抛出异常
      return false;
    }
  }

  async verifyOtp(email: string, code: string) {
    const cachedCode = await this.redis.get(REDIS_KEY_PREFIX + email);
    if (cachedCode === code) {
      let user = await this.userService.getUserByEmail(email);
      if (!user) {
        user = await this.userService.createUser(email);
      }
      await this.redis.del(REDIS_KEY_PREFIX + email);
      const payload = { userId: user._id, username: user.username, email: user.email };
      const token = this.jwtService.sign(payload);
      return {
        result: true,
        token,
      };
    }
    return {
      result: false,
    };
  }
}
