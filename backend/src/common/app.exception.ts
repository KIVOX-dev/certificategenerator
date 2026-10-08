import { HttpException } from '@nestjs/common';

/** Error codes the clients translate into plain-language messages. */
export type ErrorCode =
  | 'VALIDATION_ERROR' | 'INVALID_NAME' | 'INVALID_PHONE'
  | 'EVENT_NOT_FOUND' | 'EVENT_CLOSED'
  | 'CERTIFICATE_NOT_FOUND' | 'CERTIFICATE_NOT_ACTIVE' | 'CERTIFICATE_ERROR'
  | 'UNAUTHORIZED' | 'INVALID_CREDENTIALS' | 'NOT_FOUND' | 'CONFLICT' | 'TOO_MANY_REQUESTS';

export class AppException extends HttpException {
  constructor(public readonly code: ErrorCode, message: string, status: number, public readonly fields?: Record<string, string>) {
    super({ statusCode: status, code, message, fields }, status);
  }
}
