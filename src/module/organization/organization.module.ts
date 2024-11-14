import { forwardRef, Module } from '@nestjs/common';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';
import { TicketModule } from '../ticket/ticket.module';
import { TeamModule } from '../team/team.module';

@Module({
  imports: [forwardRef(() => TicketModule), forwardRef(() => TeamModule)],
  controllers: [OrganizationController],
  providers: [OrganizationService],
})
export class OrganizationModule {}
