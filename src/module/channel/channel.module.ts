import { forwardRef, Module } from '@nestjs/common';

import { WebsocketModule } from '@websocket/websocket.module';
import { OrganizationModule } from '@module/organization/organization.module';

import { WhatsAppModule } from './whatsapp/whatsapp.module';
import { ChannelGateway } from './channel.gateway';
import { ChannelService } from './channel.service';
import { InstagramModule } from './instagram/instagram.module';
import { ChannelController } from './channel.controller';
import { FacebookModule } from './facebook/facebook.module';

@Module({
  imports: [
    forwardRef(() => WebsocketModule),
    forwardRef(() => OrganizationModule),
    WhatsAppModule,
    InstagramModule,
    FacebookModule,
  ],
  providers: [ChannelService, ChannelGateway],
  controllers: [ChannelController],
  exports: [ChannelService, ChannelGateway],
})
export class ChannelModule {}
