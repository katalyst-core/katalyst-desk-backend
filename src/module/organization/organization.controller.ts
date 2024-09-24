import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { Request } from 'express';
import { NewOrganizationDTO } from './dto/new-organization-dto';
import { AgentJWTAccess } from '../agent/strategy/agent-jwt-access.strategy';
import { AgentAccess } from '../agent/agent.type';
import { UtilService } from 'src/util/util.service';

@UseGuards(AgentJWTAccess)
@Controller('organization')
export class OrganizationController {
  constructor(
    private readonly orgService: OrganizationService,
    private readonly util: UtilService,
  ) {}

  @Post('create')
  async createOrganization(
    @Req() req: Request,
    @Body() data: NewOrganizationDTO,
  ) {
    const user = req.user as AgentAccess;
    const { agentId } = user;

    const newOrg = await this.orgService.createOrganization(agentId, data);

    const { organizationId } = newOrg;
    const response = {
      organization_id: this.util.shortenUUID(organizationId),
    };

    return {
      code: 201,
      message: 'Created new organization',
      data: response,
    };
  }

  @Get('get-all')
  async getAllOrganization(@Req() req: Request) {
    const user = req.user as AgentAccess;
    const { agentId } = user;

    const allOrg = await this.orgService.getAllOrganizationByAgentId(agentId);
    const response = allOrg.map((org) => {
      const { organizationId, name } = org;
      return {
        organization_id: this.util.shortenUUID(organizationId),
        name,
      };
    });

    return {
      code: 200,
      message: 'Successfully retrieved all organization id',
      data: response,
    };
  }

  @Get('/:id/info')
  async getOrganizationById(@Param('id') organizationShortId: string) {
    const organizationId = this.util.restoreUUID(organizationShortId);

    const organization =
      await this.orgService.getOrganizationById(organizationId);

    const { name } = organization;
    const response = {
      organization_id: organizationShortId,
      name,
    };

    return {
      code: 200,
      message: 'Successfully retrieved organization info',
      data: response,
    };
  }
}
