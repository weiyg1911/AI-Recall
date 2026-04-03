import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';
import {
  CreateKnowledgeDto,
  DelKnowledgeDto,
  UpdateKnowledgeDto,
  KnowledgeBaseResponseDto,
  PageDto,
  KnowledgeListResponseDto,
} from '@memorize/shared-types';
import { ApiBody, ApiOperation, ApiTags, ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
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
  @ApiOperation({ summary: '获取知识点列表' })
  @ApiOkResponse({ description: '返回分页的知识点列表', type: KnowledgeListResponseDto })
  @ApiBody({
    type: PageDto,
  })
  getKnowledgeList(@Req() req: AuthenticatedRequest, @Body() body: PageDto) {
    const userId = req.user.userId;
    const { page, pageSize } = body;
    return this.knowledgeService.getKnowledgeList(userId, page, pageSize);
  }

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '创建知识点' })
  @ApiBearerAuth()
  @ApiOkResponse({ description: '知识点创建成功', type: KnowledgeBaseResponseDto })
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

  @Post('detail')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '知识点详情' })
  @ApiBody({
    type: DelKnowledgeDto,
  })
  getKnowledgeDetail(@Req() req: AuthenticatedRequest, @Body() body: DelKnowledgeDto) {
    return this.knowledgeService.getKnowledgeDetail(body.id, req.user.userId);
  }

  @Post('update')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '更新知识点' })
  @ApiBody({
    type: UpdateKnowledgeDto,
  })
  updateKnowledge(@Req() req: AuthenticatedRequest, @Body() body: UpdateKnowledgeDto) {
    return this.knowledgeService.updateKnowledge(body, req.user.userId);
  }

  @Post('delete')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '删除知识点' })
  @ApiBody({
    type: DelKnowledgeDto,
  })
  delKnowledge(@Req() req: AuthenticatedRequest, @Body() delDto: DelKnowledgeDto) {
    const useId = req.user.userId;
    const { id } = delDto;
    return this.knowledgeService.delKnowledge(id, useId);
  }
}
