import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { WinstonLoggerService } from '../logger/winston-logger.service';

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  private winstonLogger: WinstonLoggerService;
  constructor(
    @Inject(WinstonLoggerService)
    private readonly logger: WinstonLoggerService,
  ) {
    this.winstonLogger = logger;
    //
  }
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, query, params, headers } = request;
    this.winstonLogger.info(
      JSON.stringify({
        message: `Request: ${method} ${url}`,
        method,
        url,
        body,
        query,
        params,
        headers: headers,
      }),
    );

    return next.handle().pipe(
      tap({
        next: (response) => {
          this.winstonLogger.log('' + JSON.stringify(response));
        },
        error: (error) => {
          this.winstonLogger.error('error:' + JSON.stringify(error));
        },
      }),
    );
  }
}
