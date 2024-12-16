import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { UUID } from 'crypto';
import * as crypto from 'crypto';
import { formatDate } from 'date-fns';

import { Database } from '@database/database';
import { OrganizationService } from '@module/organization/organization.service';
import { TicketService } from '@module/ticket/ticket.service';
import { ChannelTypeId } from '@database/model/ChannelType';

import { ChannelMessage, RegisterMessage, UpdateMessage } from './channel.type';
import { WhatsAppMessageSchema } from './whatsapp/whatsapp.schema';
import { NewTicketResponseDTO } from './dto/new-ticket-response-dto';
import { InstagramMessageSchema } from './instagram/instagram.schema';
import { TicketMessageResponseDTO } from './dto/ticket-message-response-dto';
import { TicketUpdateResponseDTO } from '../ticket/dto/ticket-update-response-dto';

@Injectable()
export class ChannelService {
  constructor(
    private readonly db: Database,
    private readonly orgService: OrganizationService,
    @Inject(forwardRef(() => TicketService))
    private readonly ticketService: TicketService,
  ) {}

  async getChannelAccountsByOrgId(orgId: UUID) {
    const channels = await this.db
      .selectFrom('channel')
      .select([
        'channel.channelId',
        'channel.channelName',
        'channel.channelType',
      ])
      .where('channel.organizationId', '=', orgId)
      .execute();

    return channels;
  }

  async deleteAccountById(channelId: UUID) {
    const channel = await this.db
      .deleteFrom('channel')
      .where('channel.channelId', '=', channelId)
      .returning(['channel.channelId'])
      .execute();

    if (!channel) {
      throw new BadRequestException({
        message: 'Invalid Channel',
        code: 'INVALID_CHANNEL',
      });
    }
  }

  verifySHA256(body: string, signature: string, secret: string) {
    const hash = crypto.createHmac('sha256', secret).update(body).digest('hex');
    return signature === `sha256=${hash}`;
  }

  getTicketNumber(channelType: ChannelTypeId, num: number) {
    const now = new Date(Date.now());

    const channels = {
      instagram: 'IG',
      whatsapp: 'WA',
    };

    return `${channels[channelType]}${formatDate(now, 'yyyyMMdd')}${String(num).padStart(5, '0')}`;
  }

  async registerMessage(data: RegisterMessage) {
    const {
      senderId,
      recipientId,
      messageCode,
      timestamp,
      message,
      channelType,
      customerName,
      agentId,
    } = data;

    try {
      await this.db.transaction().execute(async (tx) => {
        const channels = await tx
          .selectFrom('channel')
          .select([
            'channel.organizationId',
            'channel.channelId',
            'channel.channelAccount',
          ])
          .where((eb) =>
            eb.or([
              eb('channel.channelAccount', '=', senderId),
              eb('channel.channelAccount', '=', recipientId),
            ]),
          )
          .where('channel.channelType', '=', channelType)
          .execute();

        if (channels.length <= 0) {
          return;
        }

        await channels.forEach(async (channel) => {
          const isCustomer = recipientId === channel.channelAccount;
          const customerAccount = isCustomer ? senderId : recipientId;
          let isTicketNew = false;

          const { channelId } = channel;

          let ticket = await tx
            .selectFrom('ticket')
            .innerJoin(
              'channelCustomer',
              'channelCustomer.channelCustomerId',
              'ticket.channelCustomerId',
            )
            .select([
              'ticket.ticketId',
              'ticket.ticketCode',
              'ticket.channelCustomerId',
            ])
            .where('ticket.channelId', '=', channelId)
            .where('channelCustomer.customerAccount', '=', customerAccount)
            .where('channelCustomer.channelType', '=', 'instagram')
            .where('ticket.ticketStatus', '!=', 'close')
            .executeTakeFirst();

          if (!ticket) {
            let channelCustomer = await tx
              .selectFrom('channelCustomer')
              .select(['channelCustomer.channelCustomerId'])
              .where('channelCustomer.customerAccount', '=', customerAccount)
              .where('channelCustomer.channelType', '=', 'instagram')
              .executeTakeFirst();

            if (!channelCustomer) {
              const masterCustomer = await tx
                .insertInto('masterCustomer')
                .values({
                  customerName: customerName || 'Unknown',
                })
                .returning(['masterCustomer.masterCustomerId'])
                .executeTakeFirst();

              const { masterCustomerId } = masterCustomer;

              channelCustomer = await tx
                .insertInto('channelCustomer')
                .values({
                  masterCustomerId,
                  customerAccount,
                  channelType: 'instagram',
                })
                .returning(['channelCustomer.channelCustomerId'])
                .executeTakeFirst();
            }

            const { organizationId, channelId } = channel;
            const { channelCustomerId } = channelCustomer;

            const total = await tx
              .selectFrom('ticket')
              .select(({ fn }) => [
                fn.count<number>('ticket.ticketId').as('ticketCount'),
              ])
              .where('organizationId', '=', organizationId)
              .executeTakeFirst();

            const ticketCode = this.getTicketNumber(
              channelType,
              total.ticketCount,
            );

            isTicketNew = true;
            ticket = await tx
              .insertInto('ticket')
              .values({
                ticketCode,
                organizationId,
                channelId,
                channelCustomerId,
                ticketStatus: 'open',
                agentId,
              })
              .returning([
                'ticket.ticketId',
                'ticket.ticketCode',
                'ticket.channelCustomerId',
              ])
              .executeTakeFirst();

            const org = await this.db
              .selectFrom('organization')
              .select(['organization.welcomeMessage'])
              .where('organization.organizationId', '=', organizationId)
              .executeTakeFirst();

            if (
              org &&
              org.welcomeMessage != null &&
              org.welcomeMessage.length > 0
            ) {
              await this.ticketService.sendMessage(
                ticket.ticketId,
                null,
                org.welcomeMessage,
              );
            }
          }

          const { ticketId } = ticket;
          const messageStatus = !isCustomer ? 'delivered' : 'none';

          const newMessage = await tx
            .insertInto('ticketMessage')
            .values({
              ticketId,
              messageCode,
              isCustomer,
              messageStatus,
              messageContent: message as JSON,
              createdAt: timestamp,
            })
            .onConflict((b) =>
              b.column('messageCode').doUpdateSet({
                messageContent: message as JSON,
                createdAt: timestamp,
                updatedAt: new Date(Date.now()),
              }),
            ) // Update content
            .returning([
              'ticketMessage.messageId',
              'ticketMessage.createdAt',
              'ticketMessage.updatedAt',
            ])
            .executeTakeFirst();

          if (newMessage.updatedAt) return;

          const channelMessage = this.transformRaw(message);

          const wsTicketMessage = {
            ...ticket,
            ...newMessage,
            isCustomer,
            messageContent: channelMessage,
            unread: 1,
            messageStatus,
            ticketStatus: 'close',
          } satisfies NewTicketResponseDTO | TicketMessageResponseDTO;

          if (isTicketNew) {
            const masterCustomer = await tx
              .selectFrom('masterCustomer')
              .innerJoin(
                'channelCustomer',
                'channelCustomer.masterCustomerId',
                'masterCustomer.masterCustomerId',
              )
              .select([
                'masterCustomer.customerName',
                'channelCustomer.channelCustomerId',
              ])
              .where(
                'channelCustomer.channelCustomerId',
                '=',
                ticket.channelCustomerId,
              )
              .executeTakeFirst();

            const wsTicket = {
              ...wsTicketMessage,
              ...masterCustomer,
              ticketStatus: 'close',
              teams: [],
            } satisfies NewTicketResponseDTO;

            this.orgService.sendGatewayMessage<NewTicketResponseDTO>(
              channel.organizationId,
              'new-ticket',
              wsTicket,
              NewTicketResponseDTO,
            );
          } else {
            const wsMessage = {
              ...wsTicketMessage,
            } satisfies TicketMessageResponseDTO;

            this.orgService.sendGatewayMessage(
              channel.organizationId,
              'ticket-message',
              wsMessage,
              TicketMessageResponseDTO,
            );
          }
        });
      });
    } catch (err) {
      console.error(err);
    }
  }

  async updateMessage(data: UpdateMessage) {
    const { messageCode, status, expiration, conversationId } = data;

    const message = await this.db
      .updateTable('ticketMessage')
      .set({
        messageStatus: status,
      })
      .where('ticketMessage.messageCode', '=', messageCode)
      .returning(['ticketMessage.ticketId', 'ticketMessage.messageId'])
      .executeTakeFirst();

    if (!message) return;

    const org = await this.db
      .selectFrom('ticket')
      .select(['ticket.organizationId'])
      .where('ticket.ticketId', '=', message.ticketId)
      .executeTakeFirst();

    if (expiration) {
      await this.db
        .updateTable('ticket')
        .set({ conversationId, conversationExpiration: expiration })
        .where('ticket.ticketId', '=', message.ticketId)
        .execute();
    }

    const wsMessage = {
      ticketId: message.ticketId,
      messageId: message.messageId,
      messageStatus: status,
      expiration,
    } satisfies TicketUpdateResponseDTO;

    this.orgService.sendGatewayMessage<TicketUpdateResponseDTO>(
      org.organizationId,
      'ticket-update',
      wsMessage,
      TicketUpdateResponseDTO,
    );
  }

  async logEvent(
    channelType: ChannelTypeId,
    content: JSON,
    error: JSON | undefined,
    isProcessed,
  ) {
    await this.db
      .insertInto('channelEventLog')
      .values({
        content,
        error,
        channelType,
        isProcessed,
      })
      .execute();
  }

  transformRaw(data: JSON): ChannelMessage | null {
    const instagram = InstagramMessageSchema.safeParse(data);
    if (instagram.success) {
      const { text: body } = instagram.data;

      return { body };
    }

    const whatsApp = WhatsAppMessageSchema.safeParse(data);
    if (whatsApp.success) {
      const {
        text: { body },
      } = whatsApp.data;

      return { body };
    }

    return null;
  }
}
