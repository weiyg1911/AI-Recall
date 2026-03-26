export enum LogLevel {
  ERROR = '0', // 错误：需要立即处理
  WARN = '1', // 警告：需要关注
  INFO = '2', // 信息：正常业务流程
  HTTP = '3', // HTTP：请求日志
  DEBUG = '4', // 调试：仅开发环境
}

export enum LoggerName {
  app = 'app', // app层面，用于拦截器
  auth = 'auth',
  email = 'email',
}
