import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class HttpWrapperInterceptor implements NestInterceptor {
  constructor() {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((response) => {
        // 成功时包装
        return {
          code: 200,
          message: 'success',
          data: response,
        };
      }),
      catchError((error) => {
        // 错误时包装（可自定义错误码和消息）
        return throwError(() => ({
          code: error.status || 500,
          message: error.message || 'Internal server error',
          data: null,
        }));
      }),
    );
  }
}
