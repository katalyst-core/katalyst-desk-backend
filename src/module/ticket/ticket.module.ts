import { forwardRef, Module } from '@nestjs/common';

import { WebsocketModule } from '@websocket/websocket.module';

import { TicketService } from './ticket.service';
import { TicketGateway } from './ticket.gateway';
import { TicketController } from './ticket.controller';
import { ChannelModule } from '../channel/channel.module';
import { WhatsAppModule } from '../channel/whatsapp/whatsapp.module';
import { InstagramModule } from '../channel/instagram/instagram.module';

@Module({
  imports: [
    forwardRef(() => WebsocketModule),
    forwardRef(() => ChannelModule),
    forwardRef(() => InstagramModule),
    forwardRef(() => WhatsAppModule),
  ],
  controllers: [TicketController],
  providers: [TicketService, TicketGateway],
  exports: [TicketService],
})
export class TicketModule {}
