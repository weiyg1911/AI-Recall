import { CreateKnowledgeDto } from '@memorize/shared-types';
import { Injectable } from '@nestjs/common';
import { AIService } from 'src/ai-service/ai.service';
import { PromptTemplate } from '@langchain/core/prompts';
import { TITLE_PROMPT } from './prompt/title.prompts';
import { INPUT_KNOWLEDGE_PROMPT } from './prompt/input.prompts';
import { Model } from 'mongoose';
import { Knowledge } from './schemas/knowledge.schemas';
import { InjectModel } from '@nestjs/mongoose';
/**
 * 
{
  "_id": ObjectId("..."),
  "userId": ObjectId("..."),
  "title": "中国的首都",
  "content": "中国的首都是北京。",     // 原始完整文本（可选，用于检索）
  "segments": [
    { "type": "text", "content": "中国的首都是" },
    { 
      "type": "cloze", 
      "content": "北京",              // 挖空部分的原文（即答案）
      "placeholder": "______",        // 占位符显示样式（可选）
      "clozeId": "c1",                 // 填空编号（便于多空区分）
      "answers": ["北京"]               // 支持多个正确答案
    },
    { "type": "text", "content": "。" }
  ],
  "clozesCount": 1,                    // 挖空总数（可选冗余字段）
  "tags": ["地理"],
  "createdAt": "...",
  "updatedAt": "..."
}

 * 
 */
@Injectable()
export class KnowledgeService {
  constructor(
    private readonly aiService: AIService,
    @InjectModel(Knowledge.name)
    private readonly knowledgeModel: Model<Knowledge>,
  ) {}

  /**
   * 验证和清理 AI 返回的 infoList 数据
   * 确保所有 type 值都是有效的枚举值
   */
  private validateInfoList(infoList: any): Array<{
    type: 'text' | 'cloze';
    content: string;
  }> {
    if (!Array.isArray(infoList)) {
      throw new Error('infoList must be an array');
    }

    return infoList.map((item, index) => {
      // 验证基本结构
      if (!item || typeof item !== 'object') {
        throw new Error(`infoList[${index}] must be an object`);
      }

      // 验证必需字段
      if (!item.content || typeof item.content !== 'string') {
        throw new Error(`infoList[${index}].content must be a non-empty string`);
      }

      // 验证并修正 type 字段
      if (item.type !== 'text' && item.type !== 'cloze') {
        console.warn(
          `⚠️  Invalid type "${item.type}" at infoList[${index}], defaulting to "text". ` +
            `Content: "${item.content.substring(0, 30)}..."`,
        );
        return { ...item, type: 'text' as const };
      }

      return item;
    });
  }

  private async getKnowledgeTitle(str: string) {
    const dsModal = this.aiService.getDSModal(0.7, 4000);
    const titlePrompts = PromptTemplate.fromTemplate(TITLE_PROMPT);
    const chain = titlePrompts.pipe(dsModal);
    const aiRes = await chain.invoke({
      chatContent: str,
    });

    return aiRes;
  }

  getKnowledgeList(userId: string) {
    return this.knowledgeModel.find({
      userId,
      isDeleted: false,
    });
  }

  async createKnowledge(body: CreateKnowledgeDto, userId: string) {
    try {
      const dsModal = this.aiService.getDSModal(0.7, 4000);
      const inputPrompts = PromptTemplate.fromTemplate(INPUT_KNOWLEDGE_PROMPT);
      const chain = inputPrompts.pipe(dsModal);
      const [infoList, title] = await Promise.all([
        chain.invoke({
          inputKnowledge: body.content,
        }),
        this.getKnowledgeTitle(body.content),
      ]);

      console.debug('infoList', JSON.stringify(infoList));
      console.debug('title', JSON.stringify(title));

      // 验证和清理 AI 返回的数据
      const validatedInfoList = this.validateInfoList(infoList);

      const newItem = new this.knowledgeModel({
        userId: userId,
        title: title,
        infoList: validatedInfoList,
      });
      await newItem.save();
      return {
        infoList: infoList,
        title: title,
      };
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
}
