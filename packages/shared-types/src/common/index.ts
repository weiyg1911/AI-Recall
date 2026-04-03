import { ApiProperty } from '@nestjs/swagger';

export class PageDto {
  @ApiProperty({ example: 1, description: '页码' })
  page!: number;
  @ApiProperty({ example: 10, description: '每页数量' })
  pageSize!: number;
}

export class PageResponseDto<T> {
  @ApiProperty({ example: 1, description: '总数' })
  total!: number;
  @ApiProperty({ example: 10, description: '当前页' })
  page!: number;
  @ApiProperty({ example: 10, description: '每页数量' })
  pageSize!: number;
  @ApiProperty({ example: [], description: '数据' })
  data!: T[];
}
