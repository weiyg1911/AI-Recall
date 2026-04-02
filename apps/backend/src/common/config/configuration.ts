import {
  dsModalApiKey,
  jwtExpiresIn,
  jwtSecret,
  mailerConfig,
  mongodbUri,
  redisConfig,
} from './utils';

export default () => ({
  mailer: mailerConfig(),
  port: parseInt(process.env.PORT ?? '3002', 10),
  database: {
    uri: mongodbUri(),
  },
  redis: redisConfig(),
  jwt: {
    secret: jwtSecret(),
    expiresIn: jwtExpiresIn(),
  },
  aiModal: {
    apiKey: dsModalApiKey(),
  },
});
