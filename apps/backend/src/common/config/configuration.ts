export default () => ({
  mailer: {
    host: process.env.MAILER_HOST,
    port: parseInt(process.env.MAILER_PORT ?? '465', 10),
    user: process.env.MAILER_USER,
    pass: process.env.MAILER_PASS,
  },
  port: parseInt(process.env.PORT ?? '3000', 10),
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    uri: process.env.MONGODB_URI,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  aiModal: {
    apiKey: process.env.DS_Modal_API_KEY || '<your-ds-modal-api-key>',
  },
});
