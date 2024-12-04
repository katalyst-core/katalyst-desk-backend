import { forwardRef, Module } from '@nestjs/common';

import { WebsocketModule } from '@websocket/websocket.module';

import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { ChannelModule } from '../channel/channel.module';
import { WhatsAppModule } from '../channel/whatsapp/whatsapp.module';
import { InstagramModule } from '../channel/instagram/instagram.module';
import { OrganizationModule } from '@module/organization/organization.module';

@Module({
  imports: [
    forwardRef(() => WebsocketModule),
    forwardRef(() => ChannelModule),
    forwardRef(() => InstagramModule),
    forwardRef(() => WhatsAppModule),
    forwardRef(() => OrganizationModule),
  ],
  controllers: [TicketController],
  providers: [TicketService],
  exports: [TicketService],
})
export class TicketModule {}
