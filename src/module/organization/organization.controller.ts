import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UUID } from 'crypto';
import { Request } from 'express';

import { OrganizationService } from './organization.service';
import { NewOrganizationDTO } from './dto/new-organization-dto';
import { JWTAccess } from '../auth/strategy/jwt-access.strategy';
import { AgentAccess } from '../auth/auth.type';
import { UtilService } from 'src/util/util.service';
import { TicketsResponseDTO } from '../ticket/dto/tickets-response-dto';
import { TableOptionsDTO } from 'src/util/dto/table-options-dto';
import { TicketService } from '../ticket/ticket.service';
import { Agent, ParamUUID } from 'src/common/decorator/param';
import { GuardService } from 'src/util/guard.service';
import { TeamService } from '../team/team.service';
import { TeamsResponseDTO } from '../team/dto/teams-response-dto';
import { CreateTeamDTO } from '../team/dto/create-team-dto';

@UseGuards(JWTAccess)
@Controller('organization')
export class OrganizationController {
  constructor(
    private readonly orgService: OrganizationService,
    private readonly ticketService: TicketService,
    private readonly teamService: TeamService,
    private readonly guard: GuardService,
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
  async getOrganizationById(@ParamUUID('id') orgId: UUID) {
    const organization = await this.orgService.getOrganizationById(orgId);

    const { name } = organization;
    const response = {
      organization_id: orgId,
      name,
    };

    return {
      code: 200,
      message: 'Successfully retrieved organization info',
      data: response,
    };
  }

  @Get('/:id/tickets')
  async getTickets(
    @Req() req: Request,
    @Param('id') orgShortId: string,
    @Query() tableOptions: TableOptionsDTO,
  ) {
    const orgId = UtilService.restoreUUID(orgShortId);

    const user = req.user as AgentAccess;
    const { agentId } = user;

    const tickets = await this.ticketService.getTicketsByOrgId(
      orgId,
      agentId,
      tableOptions,
    );

    return {
      options: {
        dto: TicketsResponseDTO,
      },
      data: tickets,
    };
  }

  @Get('/:id/teams')
  async getTeams(@Agent() agentId: UUID, @ParamUUID('id') orgId: UUID) {
    await this.guard.hasAccessTo('team.list', agentId, orgId);

    const data = await this.teamService.getTeamsByOrganizationId(orgId);

    return {
      code: 200,
      message: 'Successfully retrieved teams',
      data,
      options: {
        dto: TeamsResponseDTO,
      },
    };
  }

  @Post('/:id/team')
  async createTeam(
    @Agent() agentId,
    @ParamUUID('id') orgId: UUID,
    @Body() body: CreateTeamDTO,
  ) {
    await this.guard.hasAccessTo('team.create', agentId, orgId);

    const { name } = body;

    await this.teamService.createTeam(name, orgId);

    return {
      code: 200,
      message: 'Successfully created new team',
    };
  }

  @Delete('/:orgId/team/:teamId')
  async deleteTeam(
    @Agent() agentId,
    @ParamUUID('orgId') orgId: UUID,
    @ParamUUID('teamId') teamId: UUID,
  ) {
    await this.guard.hasAccessTo('team.delete', agentId, orgId);

    await this.teamService.deleteTeam(teamId, orgId);

    return {
      code: 200,
      message: 'Successfully deleted team',
    };
  }
}
