import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { DatabaseModule } from './database/database.module';
import { UtilModule } from './util/util.module';
import { ApiConfigModule } from './config/api-config.module';
import { AgentModule } from './module/agent/agent.module';
import { OrganizationModule } from './module/organization/organization.module';
import { ChannelModule } from './module/channel/channel.module';
import { TicketModule } from './module/ticket/ticket.module';
import { AuthModule } from './module/auth/auth.module';
import { AppController } from './app.controller';

@Module({
  imports: [
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
    AuthModule,
    OrganizationModule,
    ChannelModule,
    TicketModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
