import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

enum QuizType {
  MULTIPLE_CHOICE = 'multiple_choice',
  FILL_IN_BLANK = 'fill_in_blank',
  ESSAY = 'essay',
}

// 配置用户Schema全局规则
@Schema({
  timestamps: true, // 自动添加创建/更新时间
  collection: 'quiz', // 指定集合名为quiz
  strict: true, // 不允许存储未定义字段
  toJSON: {
    virtuals: true, // toJSON时包含虚拟字段
  },
})
export class Quiz {
  @Prop({
    type: String,
    required: [true, '用户id不能为空'],
    trim: true, // 自动去除前后空格
  })
  userId!: string;

  @Prop({
    type: String,
    required: [true, '知识点id不能为空'],
    trim: true,
  })
  knowledgeId!: string;

  @Prop({
    type: String,
    enum: QuizType,
    required: [true, '知识点类型不能为空'],
  })
  type!: QuizType;

  @Prop({
    type: String,
    required: [true, '题目标题不能为空'],
  })
  title!: string;

  @Prop({
    type: [String],
    required: [
      function (this: Quiz): boolean {
        return this.type == QuizType.MULTIPLE_CHOICE;
      },
      '选择题必须有2个或更多选项',
    ],
  })
  options?: string[];

  @Prop({
    type: [String],
    required: [
      function (this: Quiz): boolean {
        return this.type === QuizType.MULTIPLE_CHOICE || this.type === QuizType.FILL_IN_BLANK;
      },
      '选择题或填空题必须有选项答案',
    ],
  })
  optionsAnswer?: string[];

  @Prop({
    type: String,
    required: [
      function (this: Quiz): boolean {
        return this.type === QuizType.ESSAY;
      },
      '简答题必须有答案',
    ],
  })
  essayAnswer?: string;

  // 软删除标记（避免物理删除数据）
  @Prop({
    type: Date,
    default: null, // null 表示未删除
  })
  deletedAt!: Date | null;
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);

// 添加复合索引（优化查询），而不是使用单字索引
// 1表示升序
QuizSchema.index({ userId: 1, knowledgeId: 1, deletedAt: 1 }); // 按用户+删除状态查询索引
