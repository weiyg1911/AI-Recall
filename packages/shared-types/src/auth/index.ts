import { ApiProperty } from '@nestjs/swagger';

export class SendOtpDto {
  @ApiProperty({ example: 'test@example.com', description: '接收验证码的邮箱地址' })
  email!: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: 'test@example.com', description: '需要登录或注册的邮箱地址' })
  email!: string;

  @ApiProperty({ example: '123456', description: '邮箱收到的6位数验证码' })
  code!: string;
}

export class VerifyOtpResponseDto {
  @ApiProperty({ example: true, description: '验证结果，true 代表验证成功' })
  result!: boolean;

  @ApiProperty({
    example: 'eyJhbGciOiJ...xxx',
    description: '验证成功后派发的身份 Token',
    required: false,
  })
  token?: string;
}
