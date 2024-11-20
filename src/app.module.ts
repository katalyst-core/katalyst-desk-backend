import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AppController } from './app.controller';
import { GuardModule } from '@guard/guard.module';
import { AuthModule } from '@module/auth/auth.module';
import { TeamModule } from '@module/team/team.module';
import { AgentModule } from '@module/agent/agent.module';
import { DatabaseModule } from '@database/database.module';
import { TicketModule } from '@module/ticket/ticket.module';
import { ApiConfigModule } from '@config/api-config.module';
import { WebsocketModule } from '@websocket/websocket.module';
import { ChannelModule } from '@module/channel/channel.module';
import { OrganizationModule } from '@module/organization/organization.module';

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
    GuardModule,
    AgentModule,
    AuthModule,
    OrganizationModule,
    ChannelModule,
    TicketModule,
    TeamModule,
    WebsocketModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
