import { Global, Module } from '@nestjs/common';
import { ApiConfigService } from './api-config.service';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        APP_FRONTEND_URL: Joi.string().required(),
        DB_STRING: Joi.string().required(),
        JWT_ACCESS_PRIVATE_KEY: Joi.string().required(),
        JWT_REFRESH_PRIVATE_KEY: Joi.string().required(),
        JWT_GATEWAY_PRIVATE_KEY: Joi.string().required(),
        JWT_ACCESS_EXPIRY: Joi.number().required(),
        JWT_REFRESH_EXPIRY: Joi.number().required(),
        JWT_GATEWAY_EXPIRY: Joi.number().required(),
      }),
    }),
  ],
  providers: [ApiConfigService],
  exports: [ApiConfigService],
})
export class ApiConfigModule {}
