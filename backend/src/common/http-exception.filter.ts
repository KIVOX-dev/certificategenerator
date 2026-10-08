import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';

/** Always answer with { statusCode, code, message } and never leak internals. */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Errors');
  catch(exception: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse();
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse() as any;
      if (body && typeof body === 'object' && body.code) return res.status(status).json(body);
      const code = status === 429 ? 'TOO_MANY_REQUESTS' : status === 401 ? 'UNAUTHORIZED' : status === 404 ? 'NOT_FOUND' : 'VALIDATION_ERROR';
      const message = typeof body === 'string' ? body : Array.isArray(body?.message) ? body.message.join(', ') : body?.message ?? 'Request failed';
      return res.status(status).json({ statusCode: status, code, message });
    }
    this.logger.error(exception instanceof Error ? exception.stack : String(exception));
    return res.status(500).json({ statusCode: 500, code: 'CERTIFICATE_ERROR', message: 'Something went wrong. Please try again.' });
  }
}
