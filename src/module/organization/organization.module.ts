import { forwardRef, Module } from '@nestjs/common';

import { ChannelModule } from '@module/channel/channel.module';

import { TeamModule } from '../team/team.module';
import { TicketModule } from '../ticket/ticket.module';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';

@Module({
  imports: [
    forwardRef(() => TicketModule),
    forwardRef(() => TeamModule),
    forwardRef(() => ChannelModule),
  ],
  controllers: [OrganizationController],
  providers: [OrganizationService],
})
export class OrganizationModule {}
