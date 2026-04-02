import { CreateKnowledgeDto, UpdateKnowledgeDto } from '@memorize/shared-types';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AIService } from 'src/ai-service/ai.service';
import { PromptTemplate } from '@langchain/core/prompts';
import { TITLE_PROMPT } from './prompt/title.prompts';
import { INPUT_KNOWLEDGE_PROMPT } from './prompt/input.prompts';
import { Model, Types } from 'mongoose';
import { Knowledge } from './schemas/knowledge.schemas';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class KnowledgeService {
  constructor(
    private readonly aiService: AIService,
    @InjectModel(Knowledge.name)
    private readonly knowledgeModel: Model<Knowledge>,
  ) {}

  private async getKnowledgeTitle(str: string) {
    const dsModal = this.aiService.getDSModal(0.7, 4000);
    const titlePrompts = PromptTemplate.fromTemplate(TITLE_PROMPT);
    const chain = titlePrompts.pipe(dsModal);
    const aiRes = await chain.invoke({
      chatContent: str,
    });

    return aiRes;
  }

  /** 将正文交给 AI，得到结构化 infoList 与标题 */
  private async synthesizeKnowledgeFromRawContent(rawContent: string) {
    const dsModal = this.aiService.getDSModal(0.7, 4000);
    const inputPrompts = PromptTemplate.fromTemplate(INPUT_KNOWLEDGE_PROMPT);
    const chain = inputPrompts.pipe(dsModal);
    const [infoList, title] = await Promise.all([
      chain.invoke({ inputKnowledge: rawContent }),
      this.getKnowledgeTitle(rawContent),
    ]);
    const parsed = JSON.parse(infoList.content as string);
    return {
      infoList: parsed as Knowledge['infoList'],
      title: String((title as { content?: string }).content ?? ''),
    };
  }

  async getKnowledgeList(userId: string) {
    const res = await this.knowledgeModel.find({
      userId,
      deletedAt: null,
    });
    return res;
  }

  async getKnowledgeDetail(knowledgeId: string, userId: string) {
    if (!Types.ObjectId.isValid(knowledgeId)) {
      throw new BadRequestException('无效的知识点 ID');
    }
    const doc = await this.knowledgeModel.findOne({
      _id: new Types.ObjectId(knowledgeId),
      userId,
      deletedAt: null,
    });
    if (!doc) {
      throw new NotFoundException('知识点不存在或已删除');
    }
    return doc;
  }

  async createKnowledge(body: CreateKnowledgeDto, userId: string) {
    try {
      const { infoList, title } = await this.synthesizeKnowledgeFromRawContent(body.content);
      const newItem = new this.knowledgeModel({
        userId: userId,
        title,
        infoList,
      });
      await newItem.save();
      return { title, infoList };
    } catch (err) {
      console.error('创建知识点失败:', err);

      // 处理 Mongoose 验证错误
      if (err instanceof Error && err.name === 'ValidationError') {
        const validationError = err as any;
        const errorMessages = Object.values(validationError.errors || {}).map(
          (e: any) => e.message,
        );
        throw new Error(`数据验证失败: ${errorMessages.join(', ')}`);
      }

      // 处理其他错误
      throw err;
    }
  }

  async updateKnowledge(body: UpdateKnowledgeDto, userId: string) {
    if (!Types.ObjectId.isValid(body.id)) {
      throw new BadRequestException('无效的知识点 ID');
    }
    const rawContent = body.title?.trim()
      ? `# ${body.title.trim()}\n\n${body.content}`
      : body.content;
    try {
      const { infoList, title } = await this.synthesizeKnowledgeFromRawContent(rawContent);
      const res = await this.knowledgeModel.updateOne(
        {
          _id: new Types.ObjectId(body.id),
          userId,
          deletedAt: null,
        },
        { $set: { title, infoList } },
      );
      if (res.matchedCount === 0) {
        throw new NotFoundException('知识点不存在或已删除');
      }
      return { title, infoList };
    } catch (err) {
      console.error('更新知识点失败:', err);
      if (err instanceof BadRequestException || err instanceof NotFoundException) {
        throw err;
      }
      if (err instanceof Error && err.name === 'ValidationError') {
        const validationError = err as any;
        const errorMessages = Object.values(validationError.errors || {}).map(
          (e: any) => e.message,
        );
        throw new Error(`数据验证失败: ${errorMessages.join(', ')}`);
      }
      throw err;
    }
  }

  async delKnowledge(knowledgeId: string, userId: string) {
    if (!Types.ObjectId.isValid(knowledgeId)) {
      throw new BadRequestException('无效的知识点 ID');
    }
    const res = await this.knowledgeModel.updateOne(
      {
        _id: new Types.ObjectId(knowledgeId),
        userId,
        deletedAt: null,
      },
      { $set: { deletedAt: new Date() } },
    );
    if (res.matchedCount === 0) {
      throw new NotFoundException('知识点不存在或已删除');
    }
  }
}
