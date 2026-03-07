import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { SendOtpDto, VerifyOtpDto } from '@memorize/shared-types';
import { AuthService } from './auth.service';

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('send-otp')
  @ApiOperation({ summary: '发送验证码' })
  @ApiBody({
    type: SendOtpDto,
    examples: {
      example1: {
        value: { email: '123@123.com' },
      },
    },
  })
  @ApiResponse({ status: 200, description: '返回验证码' })
  sendOtp(@Body() body: SendOtpDto) {
    return this.authService.sendOtp(body.email);
  }

  @Post('verify-otp')
  @ApiOperation({ summary: '验证邮箱验证码' })
  @ApiBody({
    type: VerifyOtpDto,
    examples: {
      example1: {
        value: { email: '123@123.com', code: '123456' },
      },
    },
  })
  @ApiResponse({ status: 200, description: '返回验证结果' })
  verifyOtp(@Body() body: VerifyOtpDto) {
    return this.authService.verifyOtp(body.email, body.code);
  }
}
