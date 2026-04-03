import { ApiProperty } from '@nestjs/swagger';

export class CreateKnowledgeDto {
  @ApiProperty({ example: '谚语', description: '知识点标题', required: false })
  title?: string;

  @ApiProperty({ example: '不到长城非好汉', description: '知识点内容' })
  content!: string;
}

export class DelKnowledgeDto {
  @ApiProperty({ example: 'DelKnowledgeDto_id', description: '知识点id' })
  id!: string;
}

export class UpdateKnowledgeDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: '知识点 id' })
  id!: string;
  @ApiProperty({ example: '谚语', description: '知识点标题', required: false })
  title?: string;
  @ApiProperty({ example: '不到长城非好汉', description: '知识点正文' })
  content!: string;
}

export class KnowledgeInfoItemDto {
  @ApiProperty({ example: 'text', enum: ['text', 'cloze'], description: '内容类型' })
  type!: 'text' | 'cloze';

  @ApiProperty({ example: '不到长城非好汉', description: '具体内容片段' })
  content!: string;
}

export class KnowledgeBaseResponseDto {
  @ApiProperty({ example: '谚语', description: '知识点标题' })
  title!: string;

  @ApiProperty({ type: [KnowledgeInfoItemDto], description: '知识点结构化拆解内容' })
  infoList!: KnowledgeInfoItemDto[];
}
