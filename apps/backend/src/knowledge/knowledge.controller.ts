import { Body, Controller, Post } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';
import { CreateKnowledgeDto } from '@memorize/shared-types';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('知识点管理')
@Controller('knowledge')
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Post('create')
  createKnowledge(@Body() body: CreateKnowledgeDto) {
    return this.knowledgeService.createKnowledge(body);
  }
}
