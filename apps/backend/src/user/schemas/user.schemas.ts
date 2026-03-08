import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

// 配置用户Schema全局规则
@Schema({
  timestamps: true, // 自动添加创建/更新时间
  collection: 'users', // 指定集合名为users
  strict: true, // 不允许存储未定义字段
  toJSON: {
    virtuals: true, // toJSON时包含虚拟字段
  },
})
export class User {
  @Prop({
    type: String,
    required: [true, '用户名不能为空'],
    trim: true, // 自动去除前后空格
    minlength: [2, '用户名长度不能少于2位'], // 最小长度
    maxlength: [20, '用户名长度不能超过20位'], // 最大长度
  })
  username!: string;

  // 邮箱：必填、唯一、小写、正则验证
  @Prop({
    type: String,
    required: [true, '邮箱不能为空'],
    unique: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, '请输入有效的邮箱地址'], // 正则匹配邮箱格式
  })
  email!: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
