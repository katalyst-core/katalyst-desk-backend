import { UUID } from 'crypto';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { PermGuard } from '@decorator/route';
import { AccessLevel } from '@guard/guard.type';
import { TeamService } from '@module/team/team.service';
import { AgentService } from '@module/agent/agent.service';
import { TableOptionsDTO } from '@util/dto/table-options-dto';
import { TicketService } from '@module/ticket/ticket.service';
import { AddAgentDTO } from '@module/agent/dto/add-agent-dto';
import { PermLevel, Agent, ParamUUID } from '@decorator/param';
import { ChannelService } from '@module/channel/channel.service';
import { CreateTeamDTO } from '@module/team/dto/create-team-dto';
import { JWTAccess } from '@module/auth/strategy/jwt-access.strategy';
import { TeamsResponseDTO } from '@module/team/dto/teams-response-dto';
import { AgentsResponseDTO } from '@module/agent/dto/agents-response-dto';
import { TicketsResponseDTO } from '@module/ticket/dto/tickets-response-dto';
import { UnassignedTeamsResponseDTO } from '@module/team/dto/unassigned-teams-response-dto';
import { ChannelAccountsResponseDTO } from '@module/channel/dto/channel-accounts-response-dto';

import { OrganizationService } from './organization.service';
import { NewOrganizationDTO } from './dto/new-organization-dto';
import { NewOrganizationResponseDTO } from './dto/new-organization-response-dto';
import { OrganizationInfoResponseDTO } from './dto/organization-info-response-dto';
import { GuardService } from '@guard/guard.service';
import { AssignTeamDTO } from '@module/team/dto/assign-team-dto';

@UseGuards(JWTAccess)
@Controller('organization')
export class OrganizationController {
  constructor(
    private readonly guard: GuardService,
    private readonly orgService: OrganizationService,
    private readonly ticketService: TicketService,
    private readonly teamService: TeamService,
    private readonly channelService: ChannelService,
    private readonly agentService: AgentService,
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

  @PermGuard('agent.list')
  @Get('/:orgId/agents')
  async getAgents(
    @ParamUUID('orgId') orgId: UUID,
    @Query() tableOptions: TableOptionsDTO,
  ) {
    const data = await this.agentService.getAgentsByOrganizationId(
      orgId,
      tableOptions,
    );

    return {
      code: 200,
      message: 'Successfully retrieved agents',
      data,
      options: {
        dto: AgentsResponseDTO,
      },
    };
  }

  @PermGuard('agent.add')
  @Post('/:orgId/agent')
  async addAgent(@ParamUUID('orgId') orgId: UUID, @Body() body: AddAgentDTO) {
    const { email } = body;

    await this.agentService.addAgentToOrganization(orgId, email);

    return {
      code: 200,
      message: 'Successfully added agent',
    };
  }

  @PermGuard('agent.remove')
  @Delete('/:orgId/agent/:agentId')
  async removeAgent(
    @ParamUUID('orgId') orgId: UUID,
    @ParamUUID('agentId') agentId: UUID,
  ) {
    if (await this.guard.isOrganizationOwner(agentId, orgId)) {
      throw new BadRequestException({
        message: `Can't remove organization owner`,
        code: 'REMOVE_OWNER_NOT_ALLOWED',
      });
    }

    await this.agentService.removeAgentFromOrganization(orgId, agentId);

    return {
      code: 200,
      message: 'Successfully removed agent',
    };
  }

  @PermGuard('team.list')
  @Get('/:orgId/agent/:agentId/unassigned-teams')
  async getUnassignedTeams(
    @ParamUUID('orgId') orgId: UUID,
    @ParamUUID('agentId') agentId: UUID,
  ) {
    const data = await this.teamService.getUnassignedTeamsByAgentId(
      orgId,
      agentId,
    );

    return {
      code: 200,
      message: 'Successfully retrieved unassigned teams',
      data,
      options: {
        dto: UnassignedTeamsResponseDTO,
      },
    };
  }

  @PermGuard('agent.team')
  @Post('/:orgId/assign-team')
  async assignTeamToAgent(
    @ParamUUID('orgId') orgId: UUID,
    @Body() body: AssignTeamDTO,
  ) {
    const { team_id, agent_id } = body;

    if (!(await this.guard.isTeamInOrganization(orgId, team_id))) {
      throw new BadRequestException({
        message: `Team doesn't belong to organization`,
        code: 'TEAM_NOT_IN_ORGANIZATION',
      });
    }

    if (!(await this.guard.isAgentInOrganization(orgId, agent_id))) {
      throw new BadRequestException({
        message: `Agent isn't in organization`,
        code: 'AGENT_NOT_IN_ORGANIZATION',
      });
    }

    await this.agentService.assignTeam(agent_id, team_id);

    return {
      code: 200,
      message: 'Successfully added agent to team',
    };
  }

  @PermGuard('agent.team')
  @Post('/:orgId/unassign-team')
  async unassignTeamFromAgent(
    @ParamUUID('orgId') orgId: UUID,
    @Body() body: AssignTeamDTO,
  ) {
    const { team_id, agent_id } = body;

    if (!(await this.guard.isTeamInOrganization(orgId, team_id))) {
      throw new BadRequestException({
        message: `Team doesn't belong to organization`,
        code: 'TEAM_NOT_IN_ORGANIZATION',
      });
    }

    if (!(await this.guard.isAgentInOrganization(orgId, agent_id))) {
      throw new BadRequestException({
        message: `Agent isn't in organization`,
        code: 'AGENT_NOT_IN_ORGANIZATION',
      });
    }

    await this.agentService.unassignTeam(agent_id, team_id);

    return {
      code: 200,
      message: 'Successfully unassigned team from agent',
    };
  }
}
