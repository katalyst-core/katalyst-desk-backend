import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Injectable } from '@nestjs/common/decorators/core/injectable.decorator';
import { instanceToPlain } from 'class-transformer';
import { map, Observable } from 'rxjs';

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

        let formattedContent;

        // Serialize content with DTO if it exists
        if (dto) {
          const serialize = (c: unknown) => instanceToPlain(new dto(c));
          const remap = (c: any) =>
            Array.isArray(c) ? c.map(serialize) : serialize(c);

          if (content?.hasOwnProperty('pagination')) {
            formattedContent = {
              result: remap(content.result),
              pagination: content.pagination,
            };
          } else {
            formattedContent = remap(content);
          }
        } else {
          formattedContent = content || null; // Fallback to null if content is falsy
        }

        return {
          status: status || context.switchToHttp().getResponse().statusCode,
          message: message,
          data: formattedContent,
        };
      }),
    );
  }
}
