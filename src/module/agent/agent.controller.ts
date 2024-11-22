import { Controller, Get, UseGuards } from '@nestjs/common';
import { UUID } from 'crypto';

import { Agent } from '@decorator/param';
import { JWTAccess } from '@module/auth/strategy/jwt-access.strategy';

import { AgentService } from './agent.service';
import { AgentInfoResponseDTO } from './dto/agent-info-response-dto';
import { OrganizationsResponseDTO } from './dto/organizations-response-dto';
import { OrganizationService } from '@module/organization/organization.service';

@UseGuards(JWTAccess)
@Controller('agent')
export class AgentController {
  constructor(
    private readonly agentService: AgentService,
    private readonly orgService: OrganizationService,
  ) {}

  @Get('info')
  async getAgentInfo(@Agent() agentId: UUID) {
    const data = await this.agentService.getAgentInfoById(agentId);

    return {
      code: 200,
      message: 'Successfully retrieved agent info',
      data,
      options: {
        dto: AgentInfoResponseDTO,
      },
    };
  }

  @Get('organizations')
  async getOrganizations(@Agent() agentId: UUID) {
    const data = await this.orgService.getOrganizationsByAgentId(agentId);

    return {
      code: 200,
      message: 'Successfully retrieved all organizations',
      data: data,
      options: {
        dto: OrganizationsResponseDTO,
      },
    };
  }
}
