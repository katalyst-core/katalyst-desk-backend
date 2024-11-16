import { Injectable } from '@nestjs/common/decorators/core/injectable.decorator';
import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class NoCacheInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response> {
    if (context.getType() === 'http') {
      const http = context.switchToHttp();
      const response: Response = http.getResponse();
      response.setHeader('Cache-Control', 'no-store');
    }

    return next.handle();
  }
}
