import { HttpAdapterHost, NestFactory } from '@nestjs/core';

import * as cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { AllExceptionFilter } from './middleware/all-exception.filter';
import { ResponseInterceptor } from './middleware/response.interceptor';
import { HttpException, HttpStatus, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  if (process.env.APP_ENV === 'dev') {
    app.enableCors({
      origin: ['http://localhost:5173'],
    });
  }

  // Handles all error exception
  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionFilter(httpAdapterHost));

  // Handles response template
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Handles DTO validation
  app.useGlobalPipes(
    new ValidationPipe({
      disableErrorMessages: true,
      exceptionFactory: (err) => {
        return new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            message: 'Incomplete request form',
            code: 'INCOMPLETE_REQUEST',
            data: process.env.APP_ENV === 'dev' ? err : null,
          },
          HttpStatus.BAD_REQUEST,
        );
      },
    }),
  );

  const port = parseInt(process.env.PORT) || 3000;
  await app.listen(port);
}
bootstrap();
