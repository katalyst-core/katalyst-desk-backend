import { Injectable } from '@nestjs/common/decorators/core/injectable.decorator';
import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';

import { transformDTO } from '@util/index';

export interface Response {
  status: number;
  message: string;
  data: any;
}

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response> {
    return next.handle().pipe(
      map((data) => {
        if (!data) return;

        const { status, message, data: content, options } = data;

        const { dto } = options || {};

        if (status) {
          context.switchToHttp().getResponse().status(data.status);
        }

        const newStatus =
          status || context.switchToHttp().getResponse().statusCode;

        // Serialize content with DTO if it exists
        const newContent = dto ? transformDTO(content, dto) : content || null;

        return {
          status: newStatus,
          message: message,
          data: newContent,
        };
      }),
    );
  }
}
