import { UUID } from 'crypto';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { PermGuard } from '@decorator/route';
import { GuardAccess } from '@guard/guard.type';
import { RoleService } from '@module/role/role.service';
import { TeamService } from '@module/team/team.service';
import { Guard, Agent, ParamUUID } from '@decorator/param';
import { AgentService } from '@module/agent/agent.service';
import { TableOptionsDTO } from '@util/dto/table-options-dto';
import { TicketService } from '@module/ticket/ticket.service';
import { AddAgentDTO } from '@module/agent/dto/add-agent-dto';
import { ChannelService } from '@module/channel/channel.service';
import { CreateTeamDTO } from '@module/team/dto/create-team-dto';
import { AssignRoleDTO } from '@module/agent/dto/assign-role-dto';
import { AssignTeamDTO } from '@module/agent/dto/assign-team-dto';
import { JWTAccess } from '@module/auth/strategy/jwt-access.strategy';
import { TeamsResponseDTO } from '@module/team/dto/teams-response-dto';
import { AgentsResponseDTO } from '@module/agent/dto/agents-response-dto';
import { TicketsResponseDTO } from '@module/ticket/dto/tickets-response-dto';
import { UnassignedTeamsResponseDTO } from '@module/team/dto/unassigned-teams-response-dto';
import { ChannelAccountsResponseDTO } from '@module/channel/dto/channel-accounts-response-dto';
import { UnassignedRolesResponseDTO } from '@module/role/dto/unassigned-roles-response-dto';
import {
  AGENT_LIST,
  AGENT_MANAGE,
  AGENT_ROLE_LIST,
  AGENT_ROLE_MANAGE,
  AGENT_TEAM_LIST,
  AGENT_TEAM_MANAGE,
  CHANNEL_LIST,
  NO_PERM,
  ORG_MANAGE,
  TEAM_LIST,
  TEAM_MANAGE,
  TICKET_LIST,
  TICKET_MANAGE,
} from '@guard/permissions';

import { OrganizationService } from './organization.service';
import { NewOrganizationDTO } from './dto/new-organization-dto';
import { NewOrganizationResponseDTO } from './dto/new-organization-response-dto';
import { OrganizationInfoResponseDTO } from './dto/organization-info-response-dto';
import { AssignTicketTeamDTO } from '@module/ticket/dto/assign-ticket-team-dto';
import { DashboardOptionsDTO } from './dto/dashboard-options-dto';
import { DashboardResponseDTO } from './dto/dashboard-response-dto';
import { ModifyOrganizationDTO } from './dto/modify-organization-dto';
import { WelcomeMessageDTO } from './dto/welcome-message-dto';
import { WelcomeMessageResponseDTO } from './dto/welcome-message-response-dto';

@UseGuards(JWTAccess)
@Controller('organization')
export class OrganizationController {
  constructor(
    private readonly orgService: OrganizationService,
    private readonly ticketService: TicketService,
    private readonly teamService: TeamService,
    private readonly channelService: ChannelService,
    private readonly agentService: AgentService,
    private readonly roleService: RoleService,
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

  @PermGuard([NO_PERM])
  @Get('/:orgId/info')
  async getOrganizationInfo(
    @Agent() agentId: UUID,
    @ParamUUID('orgId') orgId: UUID,
  ) {
    const data = await this.orgService.getOrganizationById(agentId, orgId);

    return {
      code: 200,
      message: 'Successfully retrieved organization info',
      data,
      options: {
        dto: OrganizationInfoResponseDTO,
      },
    };
  }

  @PermGuard([CHANNEL_LIST])
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

  @PermGuard([TICKET_LIST])
  @Get('/:orgId/tickets')
  async getTickets(
    @Agent() agentId: UUID,
    @ParamUUID('orgId') orgId: UUID,
    @Guard() guardAccess: GuardAccess,
    @Query() tableOptions: TableOptionsDTO,
  ) {
    // const { isOwner, permissions } = guardAccess;
    // const hasBypass = isOwner || permissions.includes(TICKET_MANAGE);

    const tickets = await this.ticketService.getTicketsByOrgId(
      orgId,
      tableOptions,
    );

    return {
      options: {
        dto: TicketsResponseDTO,
      },
      data: tickets,
    };
  }

  @PermGuard([TEAM_MANAGE])
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

  @PermGuard([TEAM_LIST])
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

  @PermGuard([AGENT_LIST])
  @Get('/:orgId/agents')
  async getAgents(
    @ParamUUID('orgId') orgId: UUID,
    @Query() tableOptions: TableOptionsDTO,
  ) {
    const data = await this.agentService.getAgentsInOrganization(
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

  @PermGuard([AGENT_MANAGE])
  @Post('/:orgId/agent')
  async addAgent(@ParamUUID('orgId') orgId: UUID, @Body() body: AddAgentDTO) {
    const { email } = body;

    await this.agentService.addAgentToOrganizationByEmail(orgId, email);

    return {
      code: 200,
      message: 'Successfully added agent',
    };
  }

  @PermGuard([AGENT_MANAGE])
  @Delete('/:orgId/agent/:agentId')
  async removeAgent(
    @ParamUUID('orgId') orgId: UUID,
    @ParamUUID('agentId') agentId: UUID,
  ) {
    await this.agentService.removeAgentFromOrganization(orgId, agentId);

    return {
      code: 200,
      message: 'Successfully removed agent',
    };
  }

  @PermGuard([AGENT_TEAM_LIST])
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

  @PermGuard([AGENT_TEAM_MANAGE])
  @Post('/:orgId/assign-team')
  async assignTeamToAgent(
    @ParamUUID('orgId') orgId: UUID,
    @Body() body: AssignTeamDTO,
  ) {
    const { team_id, agent_id } = body;

    await this.agentService.addAgentToTeam(orgId, agent_id, team_id);

    return {
      code: 200,
      message: 'Successfully added agent to team',
    };
  }

  @PermGuard([AGENT_TEAM_MANAGE])
  @Post('/:orgId/unassign-team')
  async unassignTeamFromAgent(
    @ParamUUID('orgId') orgId: UUID,
    @Body() body: AssignTeamDTO,
  ) {
    const { team_id, agent_id } = body;

    await this.agentService.removeAgentFromTeam(orgId, agent_id, team_id);

    return {
      code: 200,
      message: 'Successfully unassigned team from agent',
    };
  }

  @PermGuard([AGENT_ROLE_LIST])
  @Get('/:orgId/agent/:agentId/unassigned-roles')
  async getUnassignedRoles(
    @ParamUUID('orgId') orgId: UUID,
    @ParamUUID('agentId') agentId: UUID,
  ) {
    const data = await this.roleService.getUnassignedRolesByAgentId(
      orgId,
      agentId,
    );

    return {
      code: 200,
      message: 'Successfully retrieved unassigned roles',
      data,
      options: {
        dto: UnassignedRolesResponseDTO,
      },
    };
  }

  @PermGuard([AGENT_ROLE_MANAGE])
  @Post('/:orgId/add-role')
  async addRoleToAgent(
    @ParamUUID('orgId') orgId: UUID,
    @Body() body: AssignRoleDTO,
  ) {
    const { role_id, agent_id } = body;

    await this.agentService.addRoleToAgent(orgId, agent_id, role_id);

    return {
      code: 200,
      message: 'Successfully added role to agent',
    };
  }

  @PermGuard([AGENT_ROLE_MANAGE])
  @Post('/:orgId/remove-role')
  async removeRoleFromAgent(
    @ParamUUID('orgId') orgId: UUID,
    @Body() body: AssignRoleDTO,
  ) {
    const { role_id, agent_id } = body;

    await this.agentService.removeRoleFromAgent(orgId, agent_id, role_id);

    return {
      code: 200,
      message: 'Successfully removed role from agent',
    };
  }

  @PermGuard([TICKET_MANAGE])
  @Post('/:orgId/add-ticket-team')
  async addTeamToTicket(
    @ParamUUID('orgId') orgId: UUID,
    @Body() body: AssignTicketTeamDTO,
  ) {
    const { ticket_id, team_id } = body;

    await this.ticketService.addTeamToTicket(orgId, ticket_id, team_id);

    return {
      code: 200,
      message: 'Successfully added team to ticket',
    };
  }

  @PermGuard([TICKET_MANAGE])
  @Post('/:orgId/remove-ticket-team')
  async removeTeamFromTicket(
    @ParamUUID('orgId') orgId: UUID,
    @Body() body: AssignTicketTeamDTO,
  ) {
    const { ticket_id, team_id } = body;

    await this.ticketService.removeTeamToTicket(orgId, ticket_id, team_id);

    return {
      code: 200,
      message: 'Successfully removed team from ticket',
    };
  }

  @Get('/:orgId/dashboard')
  async getDashboardDetails(
    @ParamUUID('orgId') orgId: UUID,
    @Query() params: DashboardOptionsDTO,
  ) {
    const { month, year } = params;

    const data = await this.orgService.getDashboardDetails(orgId, month, year);

    return {
      status: HttpStatus.OK,
      message: 'Successfully retrieved dashboard details',
      data,
      options: {
        dto: DashboardResponseDTO,
      },
    };
  }

  @PermGuard([ORG_MANAGE])
  @Post('/:orgId/modify')
  async modifyOrganization(
    @ParamUUID('orgId') orgId: UUID,
    @Body() body: ModifyOrganizationDTO,
  ) {
    await this.orgService.modifyOrganization(orgId, body);

    return {
      status: HttpStatus.OK,
      message: 'Successfully modified organization',
    };
  }

  @PermGuard([ORG_MANAGE])
  @Delete('/:orgId')
  async deleteOrganization(@ParamUUID('orgId') orgId: UUID) {
    await this.orgService.deleteOrganization(orgId);

    return {
      status: HttpStatus.OK,
      message: 'Successfully deleted organization',
    };
  }

  @PermGuard([ORG_MANAGE])
  @Get('/:orgId/welcome-message')
  async getWelcomeMessage(@ParamUUID('orgId') orgId: UUID) {
    const data = await this.orgService.getWelcomeMessage(orgId);

    return {
      status: HttpStatus.OK,
      message: 'Successfully retrieved welcome message',
      data,
      options: {
        dto: WelcomeMessageResponseDTO,
      },
    };
  }

  @PermGuard([ORG_MANAGE])
  @Post('/:orgId/welcome-message')
  async updateWelcomeMessage(
    @ParamUUID('orgId') orgId: UUID,
    @Body() body: WelcomeMessageDTO,
  ) {
    const { message } = body;

    await this.orgService.updateWelcomeMessage(orgId, message);

    return {
      status: HttpStatus.OK,
      message: 'Successfully updated welcome message',
    };
  }
}
