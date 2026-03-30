import { ApiProperty } from '@nestjs/swagger';

export class CreateKnowledgeDto {
  @ApiProperty({ example: '谚语', description: '知识点标题' })
  title?: string;
  @ApiProperty({ example: '不到长城非好汉', description: '知识点内容' })
  content!: string;
}

export class DelKnowledgeDto {
  @ApiProperty({ example: 'DelKnowledgeDto_id', description: '知识点id' })
  id!: string;
}
