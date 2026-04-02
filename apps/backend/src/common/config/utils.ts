const isProduction = () => process.env.NODE_ENV === 'production';

// 生产环境启动时校验DS模型配置是否存在，否则抛出错误
function dsModalApiKey(): string {
  const key = process.env.DS_Modal_API_KEY?.trim();
  if (key) return key;
  if (isProduction()) {
    throw new Error('DS_Modal_API_KEY is required in production');
  }
  return '<your-ds-modal-api-key>';
}

// 生产环境启动时校验MongoDB配置是否存在，否则抛出错误
function mongodbUri(): string {
  const uri = process.env.MONGODB_URI?.trim();
  if (uri) return uri;
  if (isProduction()) {
    throw new Error('MONGODB_URI is required in production');
  }
  return 'mongodb://localhost:27017/memorize';
}

// 生产环境启动时校验邮件配置是否存在，否则抛出错误
function mailerConfig(): {
  host: string;
  port: number;
  user: string;
  pass: string;
} {
  const host = process.env.MAILER_HOST?.trim();
  const port = process.env.MAILER_PORT?.trim();
  const user = process.env.MAILER_USER?.trim();
  const pass = process.env.MAILER_PASS?.trim();
  if ((!host || !port || !user || !pass) && isProduction()) {
    throw new Error(
      'MAILER_HOST, MAILER_PORT, MAILER_USER, MAILER_PASS are required in production',
    );
  }
  return {
    host: host ?? 'smtp.gmail.com',
    port: port ? parseInt(port, 10) : 587,
    user: user ?? 'your-email@gmail.com',
    pass: pass ?? 'your-password',
  };
}

// 生产环境启动时校验Redis配置是否存在，否则抛出错误
function redisConfig(): {
  host: string;
  port: number;
} {
  const host = process.env.REDIS_HOST?.trim();
  const port = process.env.REDIS_PORT?.trim();

  if ((!host || !port) && isProduction()) {
    throw new Error('REDIS_HOST, REDIS_PORT are required in production');
  }
  return {
    host: host ?? '127.0.0.1',
    port: port ? parseInt(port, 10) : 6379,
  };
}

// 生产环境启动时校验JWT配置是否存在，否则抛出错误
function jwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();
  if (secret) return secret;
  if (isProduction()) {
    throw new Error('JWT_SECRET is required in production');
  }
  return 'dev-only-jwt-secret-not-for-production';
}

// 生产环境启动时校验JWT过期时间配置是否存在，否则抛出错误
function jwtExpiresIn(): string {
  const expiresIn = process.env.JWT_EXPIRES_IN?.trim();
  if (expiresIn) return expiresIn;
  if (isProduction()) {
    throw new Error('JWT_EXPIRES_IN is required in production');
  }
  return '7d';
}

export { dsModalApiKey, mongodbUri, mailerConfig, redisConfig, jwtSecret, jwtExpiresIn };
