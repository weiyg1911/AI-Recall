import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { WinstonLoggerService } from '../logger/winston-logger.service';

/**
 * 全局异常过滤器（通过 APP_FILTER 注册）。
 * - HttpException：使用异常自带状态码，消息兼容 string / 校验器 message 数组。
 * - 其它错误：固定 500；生产环境对外文案收敛，避免泄露内部信息。
 * - 响应体与 HttpWrapperInterceptor 成功体对齐：{ code, message, data, traceId }。
 * - Winston 记录异常；4xx 用 warn，5xx 与未预期错误用 error，并带 traceId。
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: WinstonLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    // RPC / WS 等非 HTTP 上下文交给框架或其它过滤器处理
    if (host.getType() !== 'http') {
      throw exception;
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const traceId = this.resolveTraceId(request);

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const message = this.normalizeHttpExceptionMessage(exception);
      this.log(request, traceId, status, exception, false);
      response.status(status).json({
        code: status,
        message,
        data: null,
        traceId,
      });
      return;
    }

    // 非 HttpException：视为服务端未捕获错误
    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    this.log(request, traceId, status, exception, true);
    const message =
      process.env.NODE_ENV === 'production'
        ? 'Internal Server Error'
        : exception instanceof Error
          ? exception.message
          : String(exception);

    response.status(status).json({
      code: status,
      message,
      data: null,
      traceId,
    });
  }

  /** 优先使用客户端传入的链路 id，否则生成 UUID */
  private resolveTraceId(request: Request): string {
    const raw = request.headers['x-trace-id'] ?? request.headers['x-request-id'];
    if (typeof raw === 'string' && raw.trim()) {
      return raw.trim();
    }
    return randomUUID();
  }

  /** 将 getResponse() 规范为单一字符串，便于与前端约定 */
  private normalizeHttpExceptionMessage(exception: HttpException): string {
    const res = exception.getResponse();
    if (typeof res === 'string') {
      return res;
    }
    if (typeof res === 'object' && res !== null) {
      const r = res as Record<string, unknown>;
      if (Array.isArray(r.message)) {
        return r.message.map(String).join('; ');
      }
      if (typeof r.message === 'string') {
        return r.message;
      }
    }
    return exception.message;
  }

  /** 未预期错误与 5xx 打 error；4xx 打 warn。仅未预期时附带 stack */
  private log(
    request: Request,
    traceId: string,
    status: number,
    exception: unknown,
    isUnexpected: boolean,
  ): void {
    const payload = JSON.stringify({
      message: 'HTTP exception',
      traceId,
      method: request.method,
      url: request.url,
      status,
      isUnexpected,
      err:
        exception instanceof Error
          ? { name: exception.name, message: exception.message }
          : { message: String(exception) },
      stack: isUnexpected && exception instanceof Error ? exception.stack : undefined,
    });

    if (isUnexpected || status >= 500) {
      this.logger.error(payload);
    } else {
      this.logger.warn(payload);
    }
  }
}
