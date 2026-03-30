import { ApiProperty } from '@nestjs/swagger';

/** 发送验证码请求体，前后端共用；此处唯一定义，Swagger 与类型均基于此 class */
export class SendOtpDto {
  @ApiProperty({ example: 'sendOtpDto@example.com', description: '邮箱地址' })
  email!: string;
}

/** 验证验证码请求体，前后端共用 */
export class VerifyOtpDto {
  @ApiProperty({ example: 'VerifyOtpDto@example.com', description: '邮箱地址' })
  email!: string;

  @ApiProperty({ example: '123456', description: '验证码' })
  code!: string;
}
