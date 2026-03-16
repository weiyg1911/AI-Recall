import { Module } from '@nestjs/common';
import { KnowledgeController } from './knowledge.controller';
import { KnowledgeService } from './knowledge.service';
import { AIModule } from 'src/ai-service/ai.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Knowledge, KnowledgeSchema } from './schemas/knowledge.schemas';

@Module({
  imports: [
    AIModule,
    MongooseModule.forFeature([{ name: Knowledge.name, schema: KnowledgeSchema }]),
  ],
  controllers: [KnowledgeController],
  providers: [KnowledgeService],
})
export class KnowledgeModule {}
