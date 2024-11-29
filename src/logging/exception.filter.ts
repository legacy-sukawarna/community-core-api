import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import * as Sentry from '@sentry/node';

@Catch()
export class SentryExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;

    // Log the exception to Sentry
    Sentry.captureException(exception);

    // Return the error response
    response.status(status).json({
      statusCode: status,
      message: exception.message || 'Internal server error',
    });
  }
}
