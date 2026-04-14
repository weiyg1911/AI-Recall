import { randomUUID } from 'crypto';
import { Request } from 'express';

export type RequestWithTraceId = Request & { traceId?: string };

/** 从请求头读取或生成 traceId，并挂到 request 上，保证整条链路共用同一值 */
export function ensureTraceId(request: Request): string {
  const req = request as RequestWithTraceId;
  if (typeof req.traceId === 'string' && req.traceId.trim()) {
    return req.traceId.trim();
  }
  const raw = request.headers['x-trace-id'] ?? request.headers['x-request-id'];
  if (typeof raw === 'string' && raw.trim()) {
    req.traceId = raw.trim();
    return req.traceId;
  }
  req.traceId = randomUUID();
  return req.traceId;
}
