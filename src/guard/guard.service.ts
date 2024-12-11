import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UUID } from 'crypto';

import { Database } from '@database/database';

import { GuardAccess } from './guard.type';
import { toBigInt } from '@util/index';

@Injectable()
export class GuardService {
  constructor(private readonly db: Database) {}

  async hasAccessToOrganization(
    permissions: bigint[],
    agentId: UUID,
    orgId: UUID,
  ): Promise<GuardAccess | null> {
    const agent = await this.db
      .selectFrom('organizationAgent')
      .select(['organizationAgent.isOwner'])
      .where('organizationAgent.organizationId', '=', orgId)
      .where('organizationAgent.agentId', '=', agentId)
      .executeTakeFirst();

    if (!agent) return null;
    if (agent.isOwner) return { isOwner: true };

    const roles = await this.db
      .selectFrom('role')
      .leftJoin('agentRole', 'agentRole.roleId', 'role.roleId')
      .select(['role.permission', 'agentRole.agentId'])
      .where('role.organizationId', '=', orgId)
      .where((eb) =>
        eb.or([
          eb('agentRole.agentId', '=', agentId),
          eb('role.isDefault', '=', true),
        ]),
      )
      .execute();

    const agentPerm = roles.reduce(
      (prev, curr) => prev | toBigInt(curr.permission),
      BigInt('0'),
    );

    const validPerms = permissions.filter(
      (perm) => perm == BigInt(0x0) || agentPerm & perm,
    );

    if (validPerms.length) return { permissions: validPerms };

    return null;
  }

  async hasAccessToTicket(
    permissions: bigint[],
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

    //TODO: Change bypass logic
    // const hasBypass = await this.hasAccessToOrganization(
    //   'ticket.bypass',
    //   agentId,
    //   ticket.organizationId,
    // );
    // if (hasBypass) return { accessLevel: 'bypass' };

    const hasTicketAccess = await this.db
      .selectFrom('ticket')
      .leftJoin('ticketAgent', 'ticketAgent.ticketId', 'ticket.ticketId')
      .leftJoin('ticketTeam', 'ticketTeam.ticketId', 'ticket.ticketId')
      .leftJoin('agentTeam', 'agentTeam.teamId', 'ticketTeam.teamId')
      .select(['ticket.ticketId'])
      .where('ticket.ticketId', '=', ticketId)
      // .where((eb) =>
      //   eb.or([
      //     eb.and([
      //       eb('ticketAgent.ticketId', 'is', null),
      //       eb('ticketTeam.ticketId', 'is', null),
      //     ]),
      //     eb('ticketAgent.agentId', '=', agentId),
      //     eb('agentTeam.agentId', '=', agentId),
      //   ]),
      // )
      .executeTakeFirst();

    console.log(hasTicketAccess);

    const hasAccess = await this.hasAccessToOrganization(
      permissions,
      agentId,
      ticket.organizationId,
    );

    if (hasTicketAccess) return hasAccess;

    return null;
  }

  async hasAccessToChannel(
    permissions: bigint[],
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

    // const hasBypass = await this.hasAccessToOrganization(
    //   'channel.bypass',
    //   agentId,
    //   organizationId,
    // );
    // if (hasBypass) return { accessLevel: 'bypass' };

    return await this.hasAccessToOrganization(
      permissions,
      agentId,
      organizationId,
    );
  }

  async hasAccessToTeam(
    permissions: bigint[],
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

    // const hasBypass = await this.hasAccessToOrganization(
    //   'team.bypass',
    //   agentId,
    //   organizationId,
    // );
    // if (hasBypass) return { accessLevel: 'bypass' };

    return await this.hasAccessToOrganization(
      permissions,
      agentId,
      organizationId,
    );
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
