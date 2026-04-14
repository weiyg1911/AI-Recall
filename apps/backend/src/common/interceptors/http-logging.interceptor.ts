import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { WinstonLoggerService } from '../logger/winston-logger.service';
import { ensureTraceId } from '../http/trace-id.util';

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
    const traceId = ensureTraceId(request);
    const { method, url, body, query, params, headers } = request;
    this.winstonLogger.info(
      JSON.stringify({
        message: `Request: ${method} ${url}`,
        traceId,
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
          this.winstonLogger.log(JSON.stringify({ traceId, message: 'Response', data: response }));
        },
        error: (error) => {
          this.winstonLogger.error(
            JSON.stringify({
              traceId,
              message: 'Request pipeline error',
              error: error instanceof Error ? { name: error.name, message: error.message } : error,
            }),
          );
        },
      }),
    );
  }
}
