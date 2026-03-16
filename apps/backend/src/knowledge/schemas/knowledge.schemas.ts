import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

// 配置用户Schema全局规则
@Schema({
  timestamps: true, // 自动添加创建/更新时间
  collection: 'knowledge', // 指定集合名为knowledge
  strict: true, // 不允许存储未定义字段
  toJSON: {
    virtuals: true, // toJSON时包含虚拟字段
  },
})
export class Knowledge {
  @Prop({
    type: String,
    required: [true, '用户id不能为空'],
    trim: true, // 自动去除前后空格
  })
  userId!: string;

  // 必填
  @Prop({
    type: [
      {
        type: {
          type: String,
          enum: ['text', 'cloze'], // 限制type只能为text或cloze
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
      },
    ],
    required: [true, '信息列表不能为空'],
    default: [], // 默认为空数组
  })
  infoList!: Array<{
    type: 'text' | 'cloze';
    content: string;
  }>;

  // 软删除标记（避免物理删除数据）
  @Prop({ default: false })
  isDeleted!: boolean;
}

export const KnowledgeSchema = SchemaFactory.createForClass(Knowledge);

// 添加复合索引（优化查询），而不是使用单字索引
// 1表示升序
KnowledgeSchema.index({ userId: 1, isDeleted: 1 }); // 按用户+删除状态查询索引
