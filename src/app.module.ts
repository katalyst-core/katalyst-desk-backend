import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';

import { DatabaseModule } from './database/database.module';
import { UtilModule } from './util/util.module';
import { ApiConfigModule } from './config/api-config.module';
import { AgentModule } from './module/agent/agent.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DB_STRING: Joi.string().required(),
        JWT_ACCESS_SECRET: Joi.string().required(),
        JWT_REFRESH_SECRET: Joi.string().required(),
      }),
    }),
    DatabaseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connectionString: configService.get('DB_STRING'),
      }),
    }),
    ApiConfigModule,
    UtilModule,
    AgentModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
