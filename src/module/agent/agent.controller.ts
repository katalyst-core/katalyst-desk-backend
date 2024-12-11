import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UUID } from 'crypto';

import { Agent } from '@decorator/param';
import { JWTAccess } from '@module/auth/strategy/jwt-access.strategy';

import { AgentService } from './agent.service';
import { AgentInfoResponseDTO } from './dto/agent-info-response-dto';
import { OrganizationsResponseDTO } from './dto/organizations-response-dto';
import { OrganizationService } from '@module/organization/organization.service';
import { ModifyAgentDTO } from './dto/modify-agent-dto';

@UseGuards(JWTAccess)
@Controller('/agent')
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

  @Post('/modify')
  async modifyAgent(@Agent() agentId: UUID, @Body() body: ModifyAgentDTO) {
    await this.agentService.modifyAgent(agentId, body);

    return {
      status: HttpStatus.OK,
      message: 'Successfully modified agent',
    };
  }
}
