import { HttpAdapterHost, NestFactory } from '@nestjs/core';

import * as cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { AllExceptionFilter } from './common/filter/all-exception.filter';
import { ResponseInterceptor } from './common/interceptor/response.interceptor';
import { HttpException, HttpStatus, ValidationPipe } from '@nestjs/common';
import { NoCacheInterceptor } from './common/interceptor/no-cache.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.enableCors({
    origin: process.env.APP_FRONTEND_URL,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });

  if (process.env.APP_ENV === 'dev') {
  }

  // Handles all error exception
  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionFilter(httpAdapterHost));

  app.useGlobalInterceptors(
    new ResponseInterceptor(), // Handles response template
    new NoCacheInterceptor(), // Disables CDN and browser cache
  );

  // Handles DTO validation
  app.useGlobalPipes(
    new ValidationPipe({
      disableErrorMessages: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
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
