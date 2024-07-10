import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: HttpException, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const isException = exception instanceof HttpException;

    const httpStatus = isException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const httpMessage = isException
      ? exception.message
      : 'Internal Server Error';

    let errorCode;
    let errorData;
    try {
      const errorResponse = exception.getResponse() as any;
      errorCode = errorResponse.code;
      errorData = errorResponse.data;
    } catch (_) {
      console.log(exception);
    }

    const responseBody = {
      status: httpStatus,
      message: httpMessage,
      error: {
        code: errorCode || undefined,
        data: errorData || undefined,
      },
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
