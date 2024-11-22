import { forwardRef, Module } from '@nestjs/common';

import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';
import { OrganizationModule } from '@module/organization/organization.module';

@Module({
  imports: [forwardRef(() => OrganizationModule)],
  controllers: [AgentController],
  providers: [AgentService],
  exports: [AgentService],
})
export class AgentModule {}
