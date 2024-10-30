import { forwardRef, Module } from '@nestjs/common';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';
import { TicketModule } from '../ticket/ticket.module';

@Module({
  imports: [forwardRef(() => TicketModule)],
  controllers: [OrganizationController],
  providers: [OrganizationService],
})
export class OrganizationModule {}
