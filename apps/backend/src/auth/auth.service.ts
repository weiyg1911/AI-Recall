import { Injectable } from '@nestjs/common';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class AuthService {
  constructor(private readonly emailService: EmailService) {}

  async sendOtp(email: string) {
    try {
      await this.emailService.sendEmail({
        to: email,
        subject: '欢迎加入我们的平台！',
        template: './register', // 使用上面配置的模板目录下的 `welcome.hbs` 文件
        context: {
          // 传递给模板的上下文变量
          name: '新用户',
          platform: 'ai-recall',
          code: '123456',
        },
      });
      console.log(`欢迎邮件已成功发送至 ${email}`);
      return true;
    } catch (error) {
      console.error('发送邮件失败:', error);
      // 这里可以进行更完善的错误处理，例如抛出异常
      return false;
    }
  }

  verifyOtp(email: string, code: string) {
    return true;
  }
}
