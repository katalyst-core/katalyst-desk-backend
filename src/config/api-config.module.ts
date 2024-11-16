import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

import { ApiConfigService } from './api-config.service';

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

        FACEBOOK_TOKEN: Joi.string().required(),
        FACEBOOK_CLIENT_ID: Joi.string().required(),
        FACEBOOK_CLIENT_SECRET: Joi.string().required(),

        WHATSAPP_WEBHOOK_TOKEN: Joi.string().required(),

        INSTAGRAM_WEBHOOK_TOKEN: Joi.string().required(),
        INSTAGRAM_APP_ID: Joi.string().required(),
        INSTAGRAM_APP_SECRET: Joi.string().required(),
        INSTAGRAM_APP_REDIRECT_URL: Joi.string().required(),
      }),
    }),
  ],
  providers: [ApiConfigService],
  exports: [ApiConfigService],
})
export class ApiConfigModule {}
