import { Injectable, Logger } from '@nestjs/common';

import { MailerService } from '@nestjs-modules/mailer';

// 邮件发送配置、模板渲染、SMTP 连接
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name); // 传入上下文名称

  constructor(private readonly mailerService: MailerService) {}

  async sendEmail({
    to,
    subject,
    template,
    context,
  }: {
    to: string;
    subject: string;
    template: string;
    context: any;
  }) {
    try {
      await this.mailerService.sendMail({
        to: to,
        subject: subject,
        template: template,
        context: context,
      });
      return true;
    } catch (error) {
      this.logger.error('发送邮件失败:', error);
      return false;
    }
  }
}
