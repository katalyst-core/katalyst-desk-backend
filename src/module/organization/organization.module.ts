import { forwardRef, Module } from '@nestjs/common';

import { TeamModule } from '@module/team/team.module';
import { RoleModule } from '@module/role/role.module';
import { AgentModule } from '@module/agent/agent.module';
import { TicketModule } from '@module/ticket/ticket.module';
import { ChannelModule } from '@module/channel/channel.module';

import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';

@Module({
  imports: [
    forwardRef(() => TeamModule),
    forwardRef(() => RoleModule),
    forwardRef(() => AgentModule),
    forwardRef(() => TicketModule),
    forwardRef(() => ChannelModule),
  ],
  controllers: [OrganizationController],
  providers: [OrganizationService],
  exports: [OrganizationService],
})
export class OrganizationModule {}
