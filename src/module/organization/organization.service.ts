import { BadRequestException, Injectable } from '@nestjs/common';
import { UUID } from 'crypto';

import { Database } from 'src/database/database';
import { NewOrganizationDTO } from './dto/new-organization-dto';

@Injectable()
export class OrganizationService {
  constructor(private readonly db: Database) {}

  async createOrganization(agentId: UUID, data: NewOrganizationDTO) {
    return this.db.transaction().execute(async (tx) => {
      const { name } = data;

      const newOrganization = await tx
        .insertInto('organization')
        .values({
          name,
          ownerId: agentId,
          createdBy: agentId,
        })
        .returning(['organizationId'])
        .executeTakeFirst();

      const { organizationId } = newOrganization;

      await tx
        .insertInto('organizationAgent')
        .values({
          organizationId,
          agentId,
        })
        .execute();

      return newOrganization;
    });
  }

  async getOrganizationById(organizationId: UUID) {
    return await this.db
      .selectFrom('organization')
      .select(['organizationId', 'organization.name'])
      .where('organizationId', '=', organizationId)
      .executeTakeFirst();
  }

  async getTicketsByOrgId(orgId: UUID, agentId: UUID) {
    const org = await this.db
      .selectFrom('organizationAgent')
      .select(['organizationAgent.organizationId'])
      .where('organizationAgent.agentId', '=', agentId)
      .where('organizationAgent.organizationId', '=', orgId)
      .executeTakeFirst();

    if (!org) {
      throw new BadRequestException({
        message: 'Agent does not have access to this organization',
        code: 'AGENT_INVALID_ACCESS',
      });
    }

    const ticket = await this.db
      .selectFrom('ticket')
      .leftJoin('ticketCustomer', 'ticketCustomer.ticketId', 'ticket.ticketId')
      .leftJoin(
        (eb) =>
          eb
            .selectFrom('ticketMessage')
            .select([
              'ticketMessage.ticketId',
              'ticketMessage.isRead',
              'ticketMessage.isCustomer',
              'ticketMessage.createdAt',
              'ticketMessage.messageContent',
            ])
            .orderBy('ticketMessage.createdAt', 'desc')
            .limit(1)
            .as('ticketMessage'),
        (join) => join.onRef('ticketMessage.ticketId', '=', 'ticket.ticketId'),
      )
      .select(({ selectFrom }) => [
        'ticket.ticketId',
        'ticket.ticketCode',
        'ticketCustomer.contactName',
        'ticketMessage.isCustomer',
        'ticketMessage.isRead',
        'ticketMessage.createdAt',
        'ticketMessage.messageContent',
        selectFrom('ticketMessage')
          .whereRef('ticketMessage.ticketId', '=', 'ticket.ticketId')
          .select(({ fn }) => [
            fn.count<number>('ticketMessage.ticketId').as('unreadCount'),
          ])
          .where('ticketMessage.isRead', '=', false)
          .as('unread'),
      ])
      .where('ticket.organizationId', '=', orgId)
      .execute();

    return ticket;
  }
}
