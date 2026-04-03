import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { SendOtpDto, VerifyOtpDto, VerifyOtpResponseDto } from '@memorize/shared-types';
import { AuthService } from './auth.service';

@ApiTags('用户认证')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('send-otp')
  @ApiOperation({ summary: '发送验证码', description: '向指定的邮箱发送注册登录相关的 6 位验证码' })
  @ApiOkResponse({ description: '是否成功发送邮件', type: Boolean })
  sendOtp(@Body() body: SendOtpDto) {
    return this.authService.sendOtp(body.email);
  }

  @Post('verify-otp')
  @ApiOperation({ summary: '验证邮箱验证码', description: '验证通过后将下发访问 Token' })
  @ApiOkResponse({ description: '验证结果及对应的身份 Token', type: VerifyOtpResponseDto })
  verifyOtp(@Body() body: VerifyOtpDto) {
    return this.authService.verifyOtp(body.email, body.code);
  }
}
