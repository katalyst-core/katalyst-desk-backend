import { BadRequestException, Injectable } from '@nestjs/common';
import { UUID } from 'crypto';

import { Database } from 'src/database/database';
import { NewOrganizationDTO } from './dto/new-organization-dto';
import { UtilService } from 'src/util/util.service';

@Injectable()
export class OrganizationService {
  constructor(
    private readonly db: Database,
    private readonly util: UtilService,
  ) {}

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

  async getTicketsByOrgId(orgId: UUID, agentId: UUID, ticketOptions) {
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

    const tickets = this.db
      .selectFrom('ticket')
      .leftJoin('ticketCustomer', 'ticketCustomer.ticketId', 'ticket.ticketId')
      .leftJoin(
        'ticketMessage as latestMessage',
        'latestMessage.ticketId',
        'ticket.ticketId',
      )
      .select(({ selectFrom }) => [
        'ticket.ticketId',
        'ticket.ticketCode',
        'ticketCustomer.contactName',
        'latestMessage.isCustomer',
        'latestMessage.isRead',
        'latestMessage.createdAt',
        'latestMessage.messageContent',
        selectFrom('ticketMessage')
          .whereRef('ticketMessage.ticketId', '=', 'ticket.ticketId')
          .select(({ fn }) => [
            fn.count<number>('ticketMessage.ticketId').as('unreadCount'),
          ])
          .where('ticketMessage.isRead', '=', false)
          .as('unread'),
      ])
      .where('ticket.organizationId', '=', orgId)
      .where(({ eb, selectFrom }) =>
        eb(
          'latestMessage.createdAt',
          '=',
          selectFrom('ticketMessage')
            .select(['ticketMessage.createdAt'])
            .orderBy('ticketMessage.createdAt', 'desc')
            .limit(1)
            .whereRef('ticketMessage.ticketId', '=', 'ticket.ticketId'),
        ),
      )
      .orderBy('latestMessage.createdAt', 'desc');

    const data = await this.util.executeWithTableOptions(
      tickets,
      ticketOptions,
    );

    return data;
  }
}
