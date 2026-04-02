import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from './auth/jwt/jwt-auth.guard';

@ApiTags('健康检查')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: '检查服务是否正常运行' })
  @ApiResponse({
    status: 200,
    description: '服务正常',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2025-01-01T00:00:00.000Z',
      },
    },
  })
  checkHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ping')
  @ApiOperation({ summary: '简单连通性检查' })
  @ApiResponse({ status: 200, description: '返回 pong' })
  ping() {
    return 'pong';
  }

  @Get('authTime')
  @ApiOperation({ summary: '获取服务器时间' })
  @ApiResponse({ status: 200, description: '返回服务器时间' })
  @UseGuards(JwtAuthGuard)
  getServerTime() {
    return new Date().toISOString();
  }

  @Get('errorException')
  @ApiOperation({ summary: '测试错误异常' })
  @ApiResponse({ status: 200, description: '返回错误异常' })
  errorException() {
    return new Error('测试错误异常');
  }
}
