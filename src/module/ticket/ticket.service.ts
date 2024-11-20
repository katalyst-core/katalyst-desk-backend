import { BadRequestException, Injectable } from '@nestjs/common';
import { UUID } from 'crypto';

import { Database } from '@database/database';
import { AccessLevel } from '@guard/guard.type';
import { executeWithTableOptions } from '@util/.';
import { TableOptionsDTO } from '@util/dto/table-options-dto';

import { ChannelService } from '@module/channel/channel.service';
import { WhatsAppService } from '@module/channel/whatsapp/whatsapp.service';
import { InstagramService } from '@module/channel/instagram/instagram.service';

@Injectable()
export class TicketService {
  constructor(
    private readonly db: Database,
    private readonly channelService: ChannelService,
    private readonly instagramService: InstagramService,
    private readonly whatsAppService: WhatsAppService,
  ) {}

  async getTicketsByOrgId(
    orgId: UUID,
    agentId: UUID,
    accessLevel: AccessLevel,
    tableOptions,
  ) {
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
      .leftJoin('ticketAgent', 'ticketAgent.ticketId', 'ticket.ticketId')
      .leftJoin('ticketTeam', 'ticketTeam.ticketId', 'ticket.ticketId')
      .leftJoin('teamAgent', 'teamAgent.teamId', 'ticketTeam.teamId')
      .select(({ selectFrom }) => [
        'ticket.ticketId',
        'ticket.ticketCode',
        'ticket.ticketStatus',
        'masterCustomer.customerName',
        'latestMessage.isCustomer',
        'latestMessage.messageStatus',
        'latestMessage.createdAt',
        'latestMessage.messageContent',
        selectFrom('ticketMessage')
          .whereRef('ticketMessage.ticketId', '=', 'ticket.ticketId')
          .select(({ fn }) => [
            fn.count<number>('ticketMessage.ticketId').as('unreadCount'),
          ])
          .where('ticketMessage.messageStatus', '!=', 'read')
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
      .$if(accessLevel !== 'bypass', (qb) =>
        qb.where((eb) =>
          eb.or([
            eb.and([
              eb('ticketAgent.ticketId', 'is', null),
              eb('ticketTeam.ticketId', 'is', null),
            ]),
            eb('ticketAgent.agentId', '=', agentId),
            eb('teamAgent.agentId', '=', agentId),
          ]),
        ),
      )
      .orderBy('latestMessage.createdAt', 'desc');

    const tickets = await executeWithTableOptions(ticketQuery, tableOptions, {
      transform: (message) => {
        const { messageContent } = message;
        const channelMessage = this.channelService.transformRaw(messageContent);

        return {
          ...message,
          messageContent: channelMessage,
        };
      },
    });

    return tickets;
  }

  // TODO: Move to messages folder
  async getMessagesByTicketId(ticketId: UUID, tableOptions: TableOptionsDTO) {
    const messagesQuery = this.db
      .selectFrom('ticketMessage')
      .select([
        'ticketMessage.messageId',
        'ticketMessage.messageContent',
        'ticketMessage.isCustomer',
        'ticketMessage.messageStatus',
        'ticketMessage.createdAt',
      ])
      .where('ticketMessage.ticketId', '=', ticketId)
      .orderBy('ticketMessage.createdAt', 'desc');

    const messages = await executeWithTableOptions(
      messagesQuery,
      tableOptions,
      {
        transform: (message) => {
          const { messageContent } = message;
          const channelMessage =
            this.channelService.transformRaw(messageContent);

          return {
            ...message,
            messageContent: channelMessage,
          };
        },
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

    // TODO: Read message in their respective channel

    await this.db
      .updateTable('ticketMessage')
      .set({ messageStatus: 'read' })
      .where('ticketMessage.messageStatus', '!=', 'read')
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
      .select([
        'channelCustomer.customerAccount',
        'channel.channelAccount',
        'channel.channelType',
      ])
      .where('ticket.ticketId', '=', ticketId)
      .executeTakeFirst();

    if (!ticket) {
      throw new BadRequestException({
        message: 'Invalid Ticket',
        code: 'INVALID_TICKET',
      });
    }

    const { customerAccount, channelAccount, channelType } = ticket;

    try {
      let messageCode, messageContent;

      if (channelType == 'instagram') {
        [messageCode, messageContent] = await this.instagramService.sendMessage(
          channelAccount,
          customerAccount,
          text,
        );
      }

      if (channelType == 'whatsapp') {
        [messageCode, messageContent] = await this.whatsAppService.sendMessage(
          channelAccount,
          customerAccount,
          text,
        );
      }

      if (!messageCode || !messageContent) throw new Error();

      this.channelService.registerMessage({
        messageCode,
        message: messageContent,
        channelType,
        senderId: channelAccount,
        recipientId: customerAccount,
        timestamp: new Date(Date.now()),
        agentId,
      });
    } catch (err) {
      console.log(err);
      throw new BadRequestException({
        message: 'Unable to send message',
        code: 'CANT_SEND_MESSAGE',
      });
    }
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
    const ticket = await this.db
      .updateTable('ticket')
      .set({ ticketStatus: 'close' })
      .where('ticket.ticketId', '=', ticketId)
      .returning(['ticket.ticketId'])
      .executeTakeFirst();

    if (!ticket) {
      throw new BadRequestException({
        message: 'Invalid Ticket',
        code: 'INVALID_TICKET',
      });
    }
  }
}
