import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';

import { AgentJWTAccess } from './strategy/agent-jwt-access.strategy';
import { AgentAccess } from './agent.type';
import { AgentService } from './agent.service';

@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @UseGuards(AgentJWTAccess)
  @Get('info')
  async getAgentInfo(@Req() req: Request) {
    const user = req.user as AgentAccess;
    const { agentId } = user;

    const data = this.agentService.getAgentInfo(agentId);

    return {
      code: 200,
      message: 'Successfully retrieved agent info',
      data,
    };
  }
}
