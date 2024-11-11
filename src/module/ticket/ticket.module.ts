import { forwardRef, Module } from '@nestjs/common';
import { TicketController } from './ticket.controller';
import { TicketService } from './ticket.service';
import { ChannelModule } from '../channel/channel.module';
import { WebsocketModule } from 'src/websocket/websocket.module';
import { TicketGateway } from './ticket.gateway';
import { InstagramModule } from '../channel/instagram/instagram.module';
import { WhatsAppModule } from '../channel/whatsapp/whatsapp.module';

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
