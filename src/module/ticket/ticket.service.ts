import { BadRequestException, Injectable } from '@nestjs/common';
import { UUID } from 'crypto';
import { Database } from 'src/database/database';
import { TableOptionsDTO } from 'src/util/dto/table-options-dto';
import { UtilService } from 'src/util/util.service';
import { ChannelService } from '../channel/channel.service';
import { InstagramAPI } from '../channel/instagram/instagram.api';

@Injectable()
export class TicketService {
  constructor(
    private readonly db: Database,
    private readonly util: UtilService,
    private readonly channelService: ChannelService,
    private readonly instagramAPI: InstagramAPI,
  ) {}

  async hasAccessToTicket(ticketId: UUID, agentId: UUID) {
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
      .where('organizationAgent.agentId', '=', agentId)
      .where('ticket.ticketId', '=', ticketId)
      .executeTakeFirst();

    if (!ticket) {
      throw new BadRequestException({
        message: 'Agent does not have access to this ticket',
        code: 'AGENT_INVALID_ACCESS',
      });
    }
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

    const ticketQuery = this.db
      .selectFrom('ticket')
      .innerJoin(
        'channelCustomer',
        'channelCustomer.channelCustomerId',
        'ticket.channelCustomerId',
      )
      .innerJoin(
        'masterCustomer',
        'masterCustomer.masterCustomerId',
        'channelCustomer.masterCustomerId',
      )
      .leftJoin(
        'ticketMessage as latestMessage',
        'latestMessage.ticketId',
        'ticket.ticketId',
      )
      .select(({ selectFrom }) => [
        'ticket.ticketId',
        'ticket.ticketCode',
        'masterCustomer.customerName',
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
      .where(({ eb, selectFrom }) =>
        eb(
          'ticket.createdAt',
          '=',
          selectFrom('ticket')
            .select(['ticket.createdAt'])
            .whereRef(
              'ticket.channelCustomerId',
              '=',
              'channelCustomer.channelCustomerId',
            )
            .orderBy('ticket.createdAt', 'desc')
            .limit(1),
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

  // TODO: Move to messages folder
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

  async readTicketMessages(ticketId: UUID, agentId: UUID) {
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
      .where('organizationAgent.agentId', '=', agentId)
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

  async sendMessage(ticketId: UUID, agentId: UUID, text: string) {
    const ticket = await this.db
      .selectFrom('ticket')
      .innerJoin(
        'channelCustomer',
        'channelCustomer.channelCustomerId',
        'ticket.channelCustomerId',
      )
      .innerJoin('channel', 'channel.channelId', 'ticket.channelId')
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
      .select([
        'channelCustomer.customerAccount',
        'channel.channelAccount',
        'channel.channelType',
      ])
      .where('ticket.ticketId', '=', ticketId)
      .where('organizationAgent.agentId', '=', agentId)
      .executeTakeFirst();

    if (!ticket) {
      throw new BadRequestException({
        message: 'Insufficient Access',
        code: 'Insufficient Access',
      });
    }

    const { customerAccount, channelAccount, channelType } = ticket;

    try {
      if (channelType == 'instagram') {
        await this.instagramAPI.sendMessage(
          channelAccount,
          customerAccount,
          text,
        );

        return;
      }
    } catch (err) {
      console.log(err);
      throw new BadRequestException({
        message: 'Unable to send message',
        code: 'CANT_SEND_MESSAGE',
      });
    }

    throw new BadRequestException({
      message: 'Unknown platform',
      code: 'UNKNOWN_PLATFORM',
    });
  }

  async getTicketDetails(ticketId: UUID) {
    const ticket = await this.db
      .selectFrom('ticket')
      .innerJoin(
        'channelCustomer',
        'channelCustomer.channelCustomerId',
        'ticket.channelCustomerId',
      )
      .innerJoin(
        'masterCustomer',
        'masterCustomer.masterCustomerId',
        'channelCustomer.masterCustomerId',
      )
      .select([
        'ticket.ticketId',
        'ticket.ticketCode',
        'ticket.ticketStatus',
        'masterCustomer.customerName',
      ])
      .where('ticket.ticketId', '=', ticketId)
      .executeTakeFirst();

    if (!ticket) {
      throw new BadRequestException({
        message: 'Unable to find ticket',
        code: 'TICKET_NOT_FOUND',
      });
    }

    return ticket;
  }

  async closeTicket(ticketId: UUID) {
    await this.db
      .updateTable('ticket')
      .set({ ticketStatus: 'close' })
      .where('ticket.ticketId', '=', ticketId)
      .execute();
  }
}
