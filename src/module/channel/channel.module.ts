import { forwardRef, Module } from '@nestjs/common';
import { WhatsAppModule } from './whatsapp/whatsapp.module';
import { ChannelGateway } from './channel.gateway';
import { ChannelService } from './channel.service';
import { WebsocketModule } from 'src/websocket/websocket.module';

@Module({
  imports: [forwardRef(() => WebsocketModule), WhatsAppModule],
  providers: [ChannelService, ChannelGateway],
  exports: [ChannelService, ChannelGateway],
})
export class ChannelModule {}
