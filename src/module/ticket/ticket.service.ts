import { BadRequestException, Injectable } from '@nestjs/common';
import { UUID } from 'crypto';
import { jsonArrayFrom } from 'kysely/helpers/postgres';
import { sql } from 'kysely';

import { Database } from '@database/database';
import { executeWithTableOptions, restoreUUID } from '@util/.';
import { TableOptionsDTO } from '@util/dto/table-options-dto';
import { ChannelService } from '@module/channel/channel.service';
import { WhatsAppService } from '@module/channel/whatsapp/whatsapp.service';
import { InstagramService } from '@module/channel/instagram/instagram.service';
import { OrganizationService } from '@module/organization/organization.service';

import { TicketUpdateResponseDTO } from './dto/ticket-update-response-dto';

@Injectable()
export class TicketService {
  constructor(
    private readonly db: Database,
    private readonly channelService: ChannelService,
    private readonly instagramService: InstagramService,
    private readonly whatsAppService: WhatsAppService,
    private readonly orgService: OrganizationService,
  ) {}

  async getTicketsByOrgId(orgId: UUID, tableOptions: TableOptionsDTO) {
    const filter =
      tableOptions.filter &&
      tableOptions.filter.reduce((prev, curr) => {
        const [key, value] = curr.split(':');

        if (key === 'team') prev.push(restoreUUID(value));

        return prev;
      }, [] as UUID[]);

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
        'ticket.ticketId as ticket_id',
        'ticket.ticketCode',
        'ticket.ticketStatus',
        'masterCustomer.customerName',
        'latestMessage.isCustomer',
        'latestMessage.messageStatus',
        'latestMessage.createdAt',
        'latestMessage.messageContent',
        'channelCustomer.channelCustomerId',
        selectFrom('ticketMessage')
          .whereRef('ticketMessage.ticketId', '=', 'ticket.ticketId')
          .select(({ fn }) => [
            fn.count<number>('ticketMessage.ticketId').as('unreadCount'),
          ])
          .where('ticketMessage.messageStatus', '!=', 'read')
          .as('unread'),
        jsonArrayFrom(
          selectFrom('team')
            .innerJoin('ticketTeam', 'ticketTeam.teamId', 'team.teamId')
            .whereRef('ticketTeam.ticketId', '=', 'ticket.ticketId')
            .select(['team.name']),
        ).as('teams'),
      ])
      .where('ticket.organizationId', '=', orgId)
      
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
      .$if(!!filter, (qb) =>
        qb.where(({ eb, selectFrom }) =>
          eb(
            'ticket.ticketId',
            'in',
            selectFrom('ticketTeam')
              .select(['ticketTeam.ticketId'])
              .whereRef('ticketTeam.ticketId', '=', 'ticket.ticketId')
              .where((eb) =>
                eb.or(filter.map((t) => eb('ticketTeam.teamId', '=', t))),
              ),
          ),
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

  async sendMessage(ticketId: UUID, agentId: UUID | null, text: string) {
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
      .select(({ selectFrom }) => [
        'ticket.ticketId',
        'ticket.ticketCode',
        'ticket.ticketStatus',
        'masterCustomer.customerName',
        'ticket.conversationExpiration',
        jsonArrayFrom(
          selectFrom('team')
            .leftJoin('ticketTeam', (join) =>
              join
                .onRef('ticketTeam.teamId', '=', 'team.teamId')
                .onRef('ticketTeam.ticketId', '=', 'ticket.ticketId'),
            )
            .whereRef('team.organizationId', '=', 'ticket.organizationId')
            .select([
              'team.teamId',
              'team.name',
              sql`ticket_team.team_id is not null`.as('active'),
            ]),
        ).as('teams'),
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
      .set({ ticketStatus: 'close', updatedAt: new Date(Date.now()) })
      .where('ticket.ticketId', '=', ticketId)
      .returning([
        'ticket.ticketId',
        'ticket.organizationId',
        'ticket.ticketStatus',
      ])
      .executeTakeFirst();

    if (!ticket) {
      throw new BadRequestException({
        message: 'Invalid Ticket',
        code: 'INVALID_TICKET',
      });
    }

    const wsContent = {
      ticketId,
      ticketStatus: ticket.ticketStatus,
    } satisfies TicketUpdateResponseDTO;

    this.orgService.sendGatewayMessage<TicketUpdateResponseDTO>(
      ticket.organizationId,
      'ticket-update',
      wsContent,
      TicketUpdateResponseDTO,
    );
  }

  async addTeamToTicket(orgId: UUID, ticketId: UUID, teamId: UUID) {
    const team = await this.db
      .selectFrom('team')
      .select(['team.teamId'])
      .where('team.teamId', '=', teamId)
      .where('team.organizationId', '=', orgId)
      .executeTakeFirst();

    if (!team) {
      throw new BadRequestException({
        message: 'Team does not exist',
        code: 'TEAM_NOT_FOUND',
      });
    }

    const agent = await this.db
      .selectFrom('ticket')
      .select(['ticket.ticketId'])
      .where('ticket.organizationId', '=', orgId)
      .where('ticket.ticketId', '=', ticketId)
      .executeTakeFirst();

    if (!agent) {
      throw new BadRequestException({
        message: 'agent does not exist',
        code: 'AGENT_NOT_FOUND',
      });
    }

    await this.db
      .insertInto('ticketTeam')
      .values({
        ticketId,
        teamId,
      })
      .execute();

    this.orgService.sendGatewayMessage(orgId, 'ticket-refresh', {});
  }

  async removeTeamToTicket(orgId: UUID, ticketId: UUID, teamId: UUID) {
    const team = await this.db
      .selectFrom('team')
      .select(['team.teamId'])
      .where('team.teamId', '=', teamId)
      .where('team.organizationId', '=', orgId)
      .executeTakeFirst();

    if (!team) {
      throw new BadRequestException({
        message: 'Team does not exist',
        code: 'TEAM_NOT_FOUND',
      });
    }

    const agent = await this.db
      .selectFrom('ticket')
      .select(['ticket.ticketId'])
      .where('ticket.organizationId', '=', orgId)
      .where('ticket.ticketId', '=', ticketId)
      .executeTakeFirst();

    if (!agent) {
      throw new BadRequestException({
        message: 'agent does not exist',
        code: 'AGENT_NOT_FOUND',
      });
    }

    await this.db
      .deleteFrom('ticketTeam')
      .where('ticketTeam.ticketId', '=', ticketId)
      .where('ticketTeam.teamId', '=', teamId)
      .execute();

    this.orgService.sendGatewayMessage(orgId, 'ticket-refresh', {});
  }
}
