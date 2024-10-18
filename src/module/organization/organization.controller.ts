import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { Request } from 'express';
import { NewOrganizationDTO } from './dto/new-organization-dto';
import { AgentJWTAccess } from '../agent/strategy/agent-jwt-access.strategy';
import { AgentAccess } from '../agent/agent.type';
import { UtilService } from 'src/util/util.service';
import { TicketsResponseDTO } from './dto/tickets-response';

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
      organization_id: UtilService.shortenUUID(organizationId),
    };

    return {
      code: 201,
      message: 'Created new organization',
      data: response,
    };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get('/:id/info')
  async getOrganizationById(@Param('id') organizationShortId: string) {
    const organizationId = UtilService.restoreUUID(organizationShortId);

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

  @Get('/:id/tickets')
  async getTickets(@Req() req: Request, @Param('id') orgShortId: string) {
    const orgId = UtilService.restoreUUID(orgShortId);

    const user = req.user as AgentAccess;
    const { agentId } = user;

    const tickets = await this.orgService.getTicketsByOrgId(orgId, agentId);

    return {
      options: {
        dto: TicketsResponseDTO,
      },
      data: tickets,
    };
  }
}
