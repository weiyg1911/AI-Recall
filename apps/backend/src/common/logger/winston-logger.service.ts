import * as winston from 'winston';
import { Injectable, Scope, LoggerService } from '@nestjs/common';
import path from 'path';
import { LoggerName } from './constants';
const logDir = path.join(process.cwd(), 'logs'); // 日志目录

@Injectable({ scope: Scope.TRANSIENT })
export class WinstonLoggerService implements LoggerService {
  private logger: winston.Logger;

  constructor(moduleName: LoggerName = LoggerName.app) {
    this.logger = winston.createLogger({
      // error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6。 下面这里指只有info及以上的会被记录
      level: 'info',
      // 输出格式
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
          return `${timestamp} [${level}]: ${message}`;
        }),
      ),
      // 输出到哪里：
      transports: [
        // 控制台输出
        new winston.transports.Console(),
        // 写入所有日志到 combined.log
        new winston.transports.File({ filename: path.join(logDir, moduleName, 'combined.log') }),
        // 单独写入 error 日志
        new winston.transports.File({
          filename: path.join(logDir, 'error.log'),
          level: 'error',
        }),
      ],
    });
  }

  log(message: string) {
    this.info(message);
  }

  error(message: string) {
    this.logger.error(message);
  }

  warn(message: string) {
    this.logger.warn(message);
  }

  info(message: string) {
    this.logger.log('info', message);
  }

  verbose(message: string) {
    this.logger.verbose(message);
  }

  debug(message: string) {
    this.logger.debug(message);
  }

  // httpLogReq(message: string) {}

  // httpLogRes(message: string) {}

  // httpLogError(message: string) {}
}
