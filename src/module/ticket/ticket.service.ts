import { BadRequestException, Injectable } from '@nestjs/common';
import { UUID } from 'crypto';
import { Database } from 'src/database/database';
import { TableOptionsDTO } from 'src/util/dto/table-options-dto';
import { UtilService } from 'src/util/util.service';
import { ChannelService } from '../channel/channel.service';

@Injectable()
export class TicketService {
  constructor(
    private readonly db: Database,
    private readonly util: UtilService,
    private readonly channelService: ChannelService,
  ) {}

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

    const ticketQuery = this.db
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

    const tickets = await this.util.executeWithTableOptions(
      ticketQuery,
      ticketOptions,
      (message) => {
        const { messageContent } = message;
        const channelMessage = this.channelService.transformRaw(messageContent);

        return {
          ...message,
          messageContent: channelMessage,
        };
      },
    );

    return tickets;
  }

  async getMessagesByTicketId(
    ticketId: UUID,
    userId: UUID,
    tableOptions: TableOptionsDTO,
  ) {
    const ticket = await this.db
      .selectFrom('ticket')
      .innerJoin(
        'organization',
        'organization.organizationId',
        'ticket.organizationId',
      )
      .innerJoin(
        'organizationAgent',
        'organizationAgent.organizationId',
        'organization.organizationId',
      )
      .where('organizationAgent.agentId', '=', userId)
      .where('ticket.ticketId', '=', ticketId)
      .executeTakeFirst();

    if (!ticket) {
      throw new BadRequestException({
        message: 'Agent does not have access to this ticket',
        code: 'AGENT_INVALID_ACCESS',
      });
    }

    const messagesQuery = this.db
      .selectFrom('ticketMessage')
      .select([
        'ticketMessage.messageId',
        'ticketMessage.messageContent',
        'ticketMessage.isCustomer',
        'ticketMessage.isRead',
        'ticketMessage.createdAt',
      ])
      .where('ticketMessage.ticketId', '=', ticketId)
      .orderBy('ticketMessage.createdAt', 'desc');

    const messages = await this.util.executeWithTableOptions(
      messagesQuery,
      tableOptions,
      (message) => {
        const { messageContent } = message;
        const channelMessage = this.channelService.transformRaw(messageContent);

        return {
          ...message,
          messageContent: channelMessage,
        };
      },
    );

    return messages;
  }

  async readTicketMessages(ticketId: UUID, userId: UUID) {
    const ticket = await this.db
      .selectFrom('ticket')
      .innerJoin(
        'organization',
        'organization.organizationId',
        'ticket.organizationId',
      )
      .innerJoin(
        'organizationAgent',
        'organizationAgent.organizationId',
        'organization.organizationId',
      )
      .where('organizationAgent.agentId', '=', userId)
      .where('ticket.ticketId', '=', ticketId)
      .executeTakeFirst();

    if (!ticket) {
      throw new BadRequestException({
        message: 'Agent does not have access to this ticket',
        code: 'AGENT_INVALID_ACCESS',
      });
    }

    await this.db
      .updateTable('ticketMessage')
      .set({ isRead: true })
      .where('ticketMessage.isRead', '=', false)
      .where('ticketMessage.ticketId', '=', ticketId)
      .execute();
  }

  // TODO: Read messages in WhatsApp (if on whatsapp)
}
