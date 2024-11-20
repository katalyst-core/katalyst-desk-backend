import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UUID } from 'crypto';

import { Database } from '@database/database';

import { GuardAccess } from './guard.type';

@Injectable()
export class GuardService {
  constructor(private readonly db: Database) {}

  async isOrganizationOwner(agentId: UUID, orgId: UUID) {
    const org = await this.db
      .selectFrom('organization')
      .select(['organization.organizationId'])
      .where('organization.organizationId', '=', orgId)
      .where('organization.ownerId', '=', agentId)
      .executeTakeFirst();

    return !!org;
  }

  async hasAccessToOrganization(
    permission: string,
    agentId: UUID,
    orgId: UUID,
  ): Promise<GuardAccess | null> {
    const isOrganizationOwner = await this.isOrganizationOwner(agentId, orgId);
    if (isOrganizationOwner) return { accessLevel: 'bypass' };

    // Check if agent has permission
    void permission;
    return { accessLevel: 'normal' };

    return null;
  }

  async hasAccessToTicket(
    permission: string,
    agentId: UUID,
    ticketId: UUID,
  ): Promise<GuardAccess | null> {
    const ticket = await this.db
      .selectFrom('ticket')
      .select(['ticket.organizationId'])
      .where('ticket.ticketId', '=', ticketId)
      .executeTakeFirst();

    if (!ticket) {
      throw new UnauthorizedException({
        message: 'Invalid Ticket',
        code: 'INVALID_TICKET',
      });
    }

    const hasBypass = await this.hasAccessToOrganization(
      'ticket.bypass',
      agentId,
      ticket.organizationId,
    );
    if (hasBypass) return { accessLevel: 'bypass' };

    const hasTicketAccess = await this.db
      .selectFrom('ticket')
      .leftJoin('ticketAgent', 'ticketAgent.ticketId', 'ticket.ticketId')
      .leftJoin('ticketTeam', 'ticketTeam.ticketId', 'ticket.ticketId')
      .leftJoin('teamAgent', 'teamAgent.teamId', 'ticketTeam.teamId')
      .select(['ticket.ticketId'])
      .where('ticket.ticketId', '=', ticketId)
      .where((eb) =>
        eb.or([
          eb.and([
            eb('ticketAgent.ticketId', 'is', null),
            eb('ticketTeam.ticketId', 'is', null),
          ]),
          eb('ticketAgent.agentId', '=', agentId),
          eb('teamAgent.agentId', '=', agentId),
        ]),
      )
      .executeTakeFirst();

    const hasAccess = await this.hasAccessToOrganization(
      permission,
      agentId,
      ticket.organizationId,
    );

    if (hasTicketAccess && hasAccess) return { accessLevel: 'normal' };

    return null;
  }

  async hasAccessToChannel(
    permission: string,
    agentId: UUID,
    channelId: UUID,
  ): Promise<GuardAccess | null> {
    const channel = await this.db
      .selectFrom('channel')
      .select(['channel.organizationId'])
      .where('channel.channelId', '=', channelId)
      .executeTakeFirst();

    if (!channel) {
      throw new BadRequestException({
        message: 'Invalid Channel',
        code: 'INVALID_CHANNEL',
      });
    }

    const { organizationId } = channel;

    const hasBypass = await this.hasAccessToOrganization(
      'channel.bypass',
      agentId,
      organizationId,
    );
    if (hasBypass) return { accessLevel: 'bypass' };

    const hasAccess = await this.hasAccessToOrganization(
      permission,
      agentId,
      organizationId,
    );
    if (hasAccess) return { accessLevel: 'normal' };

    return null;
  }

  async hasAccessToTeam(
    permission: string,
    agentId: UUID,
    teamId: UUID,
  ): Promise<GuardAccess | null> {
    const team = await this.db
      .selectFrom('team')
      .select(['team.organizationId'])
      .where('team.teamId', '=', teamId)
      .executeTakeFirst();

    if (!team) {
      throw new BadRequestException({
        message: 'Invalid Team',
        code: 'INVALID_TEAM',
      });
    }

    const { organizationId } = team;

    const hasBypass = await this.hasAccessToOrganization(
      'team.bypass',
      agentId,
      organizationId,
    );
    if (hasBypass) return { accessLevel: 'bypass' };

    const hasAccess = await this.hasAccessToOrganization(
      permission,
      agentId,
      organizationId,
    );
    if (hasAccess) return { accessLevel: 'normal' };

    return null;
  }

  async isTeamInOrganization(orgId: UUID, teamId: UUID) {
    const team = await this.db
      .selectFrom('team')
      .select(['team.teamId'])
      .where('team.teamId', '=', teamId)
      .where('team.organizationId', '=', orgId)
      .executeTakeFirst();

    return !!team;
  }

  async isAgentInOrganization(orgId: UUID, agentId: UUID) {
    const agent = await this.db
      .selectFrom('organizationAgent')
      .select(['organizationAgent.agentId'])
      .where('organizationAgent.agentId', '=', agentId)
      .where('organizationAgent.organizationId', '=', orgId)
      .executeTakeFirst();

    return !!agent;
  }
}
