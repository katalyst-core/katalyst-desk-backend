import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';

import { AgentJWTAccess } from './strategy/agent-jwt-access.strategy';
import { AgentAccess } from './agent.type';
import { AgentService } from './agent.service';
import { UtilService } from 'src/util/util.service';

@UseGuards(AgentJWTAccess)
@Controller('agent')
export class AgentController {
  constructor(
    private readonly util: UtilService,
    private readonly agentService: AgentService,
  ) {}

  @Get('info')
  async getAgentInfo(@Req() req: Request) {
    const user = req.user as AgentAccess;
    const { agentId } = user;

    const data = await this.agentService.getAgentInfo(agentId);

    return {
      code: 200,
      message: 'Successfully retrieved agent info',
      data,
    };
  }

  @Get('organizations')
  async getOrganizations(@Req() req: Request) {
    const user = req.user as AgentAccess;
    const { agentId } = user;

    const orgs = await this.agentService.getOrganizationsByAgentId(agentId);

    const response = orgs.map((org) => {
      const { organizationId, name } = org;

      return {
        organization_id: UtilService.shortenUUID(organizationId),
        name,
      };
    });

    return {
      code: 200,
      message: 'Successfully retrieved all organizations',
      data: response,
    };
  }
}
