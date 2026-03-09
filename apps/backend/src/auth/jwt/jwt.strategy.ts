import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import configuration from 'src/common/config/configuration';

interface Payload {
  userId: string;
  username: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  // 构造函数接收ConfigService实例，用于获取配置
  constructor(private readonly configService: ConfigService) {
    // 调用父类构造函数，传递JWT的配置选项
    super({
      // 从请求的Authorization头部提取Bearer Token
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 不忽略JWT的过期时间（默认为false）
      ignoreExpiration: false,
      // 获取JWT的密钥
      secretOrKey: configuration().jwt.secret,
    });
  }
  // payload是解密后的JWT数据
  validate(payload: Payload) {
    // 返回有效的用户信息（可以将其存储在请求的user对象中，后续中间件可以访问）
    return {
      userId: payload.userId, // 用户ID
      username: payload.username, // 用户名
      email: payload.email, // 用户邮箱
    };
  }
}
