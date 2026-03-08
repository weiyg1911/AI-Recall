import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from './schemas/user.schemas';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

  async createUser(email: string) {
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new BadRequestException('用户已存在');
    }
    const username = 'user_' + email.split('@')[0];
    const user = new this.userModel({ email, username });
    await user.save();
    return user;
  }

  async getUserByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  async getUserById(id: string) {
    return this.userModel.findById(id);
  }
}
