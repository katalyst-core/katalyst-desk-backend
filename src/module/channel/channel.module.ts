import { forwardRef, Module } from '@nestjs/common';
import { WhatsAppModule } from './whatsapp/whatsapp.module';
import { ChannelGateway } from './channel.gateway';
import { ChannelService } from './channel.service';
import { WebsocketModule } from 'src/websocket/websocket.module';
import { InstagramModule } from './instagram/instagram.module';
import { ChannelController } from './channel.controller';

@Module({
  imports: [forwardRef(() => WebsocketModule), WhatsAppModule, InstagramModule],
  providers: [ChannelService, ChannelGateway],
  controllers: [ChannelController],
  exports: [ChannelService, ChannelGateway],
})
export class ChannelModule {}
