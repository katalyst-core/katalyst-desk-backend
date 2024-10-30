import { forwardRef, Module } from '@nestjs/common';
import { TicketController } from './ticket.controller';
import { TicketService } from './ticket.service';
import { ChannelModule } from '../channel/channel.module';
import { WebsocketModule } from 'src/websocket/websocket.module';
import { TicketGateway } from './ticket.gateway';

@Module({
  imports: [forwardRef(() => WebsocketModule), forwardRef(() => ChannelModule)],
  controllers: [TicketController],
  providers: [TicketService, TicketGateway],
  exports: [TicketService],
})
export class TicketModule {}
