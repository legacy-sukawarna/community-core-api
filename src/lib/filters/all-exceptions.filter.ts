import { Response } from 'express';
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  Logger,
  HttpStatus,
  HttpException,
} from '@nestjs/common';

type ErrorResponseBody = {
  status: string;
  title: string;
  code: string;
  messages: string[];
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    let responseStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let status = 'error';
    let code: string = null;
    let title: string = exception.name;
    let messages: any[] = [exception.message];

    if (typeof exception === 'string') {
      title = exception;
      messages = [];
    } else if (exception instanceof HttpException) {
      const content: any = exception.getResponse();
      responseStatus =
        exception.getStatus() || HttpStatus.INTERNAL_SERVER_ERROR;

      title = content?.error || exception.toString().replace('Error: ', '');
      status = content?.status || status;
      code = content?.code || code;
      messages = content?.messages || [content?.message || content];
    }

    this.logger.error(exception, exception?.stack);
    const body: ErrorResponseBody = {
      status,
      title,
      code,
      messages,
    };

    response.status(responseStatus).json(body);
  }
}
