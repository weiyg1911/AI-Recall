import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';
import { CreateKnowledgeDto } from '@memorize/shared-types';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    username: string;
    email: string;
  };
}

@ApiTags('知识点管理')
@Controller('knowledge')
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  getKnowledgeList(@Req() req: AuthenticatedRequest) {
    const userId = req.user.userId;
    return this.knowledgeService.getKnowledgeList(userId);
  }

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '创建知识点' })
  @ApiBody({
    type: CreateKnowledgeDto,
    examples: {
      example1: {
        value: {
          title: '谚语',
          content: '不到长城非好汉',
        },
      },
      example2: {
        value: {
          content: 'title 可以为空',
        },
      },
    },
  })
  createKnowledge(@Req() req: AuthenticatedRequest, @Body() body: CreateKnowledgeDto) {
    const userId = req.user.userId;
    return this.knowledgeService.createKnowledge(body, userId);
  }
}
