import { ApiProperty } from '@nestjs/swagger';

export class CreateKnowledgeDto {
  @ApiProperty({ example: '不到长城非好汉', description: '知识点名称' })
  content!: string;
}
