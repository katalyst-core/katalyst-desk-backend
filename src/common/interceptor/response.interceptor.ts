import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Injectable } from '@nestjs/common/decorators/core/injectable.decorator';
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

        if (data.status) {
          context.switchToHttp().getResponse().status(data.status);
        }

        return {
          status:
            data.status || context.switchToHttp().getResponse().statusCode,
          message: data.message,
          data: data.data || null,
        };
      }),
    );
  }
}
