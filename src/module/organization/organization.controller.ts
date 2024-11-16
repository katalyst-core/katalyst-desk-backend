import { UUID } from 'crypto';
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';

import { PermGuard } from '@decorator/route';
import { AccessLevel } from '@util/guard.type';
import { TeamService } from '@module/team/team.service';
import { TableOptionsDTO } from '@util/dto/table-options-dto';
import { PermLevel, Agent, ParamUUID } from '@decorator/param';
import { CreateTeamDTO } from '@module/team/dto/create-team-dto';
import { TeamsResponseDTO } from '@module/team/dto/teams-response-dto';

import { TicketService } from '../ticket/ticket.service';
import { OrganizationService } from './organization.service';
import { NewOrganizationDTO } from './dto/new-organization-dto';
import { JWTAccess } from '../auth/strategy/jwt-access.strategy';
import { TicketsResponseDTO } from '../ticket/dto/tickets-response-dto';
import { NewOrganizationResponseDTO } from './dto/new-organization-response-dto';
import { OrganizationInfoResponseDTO } from './dto/organization-info-response-dto';
import { ChannelService } from '@module/channel/channel.service';
import { ChannelAccountsResponseDTO } from '@module/channel/dto/channel-accounts-response-dto';

@UseGuards(JWTAccess)
@Controller('organization')
export class OrganizationController {
  constructor(
    private readonly orgService: OrganizationService,
    private readonly ticketService: TicketService,
    private readonly teamService: TeamService,
    private readonly channelService: ChannelService,
  ) {}

  @Post('create')
  async createOrganization(
    @Agent() agentId: UUID,
    @Body() body: NewOrganizationDTO,
  ) {
    const data = await this.orgService.createOrganization(agentId, body);

    return {
      code: 201,
      message: 'Created new organization',
      data,
      options: {
        dto: NewOrganizationResponseDTO,
      },
    };
  }

  @PermGuard('organization.info')
  @Get('/:orgId/info')
  async getOrganizationInfo(@ParamUUID('orgId') orgId: UUID) {
    const data = await this.orgService.getOrganizationById(orgId);

    return {
      code: 200,
      message: 'Successfully retrieved organization info',
      data,
      options: {
        dto: OrganizationInfoResponseDTO,
      },
    };
  }

  @PermGuard('channel.list')
  @Get('/:orgId/channels')
  async getChannels(@ParamUUID('orgId') orgId: UUID) {
    const accounts = await this.channelService.getChannelAccountsByOrgId(orgId);

    return {
      code: 200,
      message: 'Successfully retrieved channel accounts',
      data: accounts,
      options: {
        dto: ChannelAccountsResponseDTO,
      },
    };
  }

  @PermGuard('ticket.list')
  @Get('/:orgId/tickets')
  async getTickets(
    @Agent() agentId: UUID,
    @ParamUUID('orgId') orgId: UUID,
    @PermLevel() accessLevel: AccessLevel,
    @Query() tableOptions: TableOptionsDTO,
  ) {
    const tickets = await this.ticketService.getTicketsByOrgId(
      orgId,
      agentId,
      accessLevel,
      tableOptions,
    );

    return {
      options: {
        dto: TicketsResponseDTO,
      },
      data: tickets,
    };
  }

  @PermGuard('team.create')
  @Post('/:orgId/team')
  async createTeam(
    @ParamUUID('orgId') orgId: UUID,
    @Body() body: CreateTeamDTO,
  ) {
    const { name } = body;

    await this.teamService.createTeam(name, orgId);

    return {
      code: 200,
      message: 'Successfully created new team',
    };
  }

  @PermGuard('team.list')
  @Get('/:orgId/teams')
  async getTeams(@ParamUUID('orgId') orgId: UUID) {
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
}
