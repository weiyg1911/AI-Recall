import { CreateKnowledgeDto } from '@memorize/shared-types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class KnowledgeService {
  constructor() {}
  createKnowledge(body: CreateKnowledgeDto) {
    console.log(body);
    return 'createKnowledge';
  }
}
