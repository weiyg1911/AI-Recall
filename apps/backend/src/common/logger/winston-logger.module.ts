import { Module, DynamicModule } from '@nestjs/common';
import { WinstonLoggerService } from './winston-logger.service';
import { LoggerName } from './constants';

@Module({})
export class WinstonLoggerModule {
  static register(moduleName: LoggerName): DynamicModule {
    return {
      module: WinstonLoggerModule,
      providers: [
        {
          provide: WinstonLoggerService,
          useFactory: () => new WinstonLoggerService(moduleName),
        },
      ],

      exports: [WinstonLoggerService],
    };
  }
}
