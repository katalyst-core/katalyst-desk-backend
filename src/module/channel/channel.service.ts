import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID, UUID } from 'crypto';
import * as crypto from 'crypto';

import { shortenUUID } from '@util/.';
import { Database } from '@database/database';

import { ChannelGateway } from './channel.gateway';
import { ChannelMessage, RegisterMessage } from './channel.type';
import { WhatsAppMessageSchema } from './whatsapp/whatsapp.schema';
import { NewTicketResponseDTO } from './dto/new-ticket-response-dto';
import { InstagramMessageSchema } from './instagram/instagram.schema';
import { TicketMessageResponseDTO } from './dto/ticket-message-response-dto';

@Injectable()
export class ChannelService {
  constructor(
    private readonly db: Database,
    private readonly gateway: ChannelGateway,
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

            // TODO: Replace with a proper ticket code
            const ticketCode = shortenUUID(randomUUID());
            const { organizationId, channelId } = channel;
            const { channelCustomerId } = channelCustomer;

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
          }

          const { ticketId } = ticket;

          const newMessage = await tx
            .insertInto('ticketMessage')
            .values({
              ticketId,
              messageCode,
              isCustomer,
              messageStatus: 'received',
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

          const agents = await tx
            .selectFrom('organizationAgent')
            .select(['organizationAgent.agentId'])
            .where(
              'organizationAgent.organizationId',
              '=',
              channel.organizationId,
            )
            .execute();

          const channelMessage = this.transformRaw(message);
          if (isTicketNew) {
            const masterCustomer = await tx
              .selectFrom('masterCustomer')
              .innerJoin(
                'channelCustomer',
                'channelCustomer.masterCustomerId',
                'masterCustomer.masterCustomerId',
              )
              .select(['masterCustomer.customerName'])
              .where(
                'channelCustomer.channelCustomerId',
                '=',
                ticket.channelCustomerId,
              )
              .executeTakeFirst();

            const wsTicket = {
              ...ticket,
              ...newMessage,
              ...masterCustomer,
              isCustomer,
              messageContent: channelMessage,
              unread: 1,
              messageStatus: 'received',
              ticketStatus: 'close',
            } satisfies NewTicketResponseDTO;

            agents.forEach(({ agentId }) =>
              this.gateway.sendAgent(
                agentId,
                'new-ticket',
                wsTicket,
                NewTicketResponseDTO,
              ),
            );
          } else {
            const wsMessage = {
              ...ticket,
              ...newMessage,
              isCustomer,
              messageContent: channelMessage,
              messageStatus: 'received',
            } satisfies TicketMessageResponseDTO;

            agents.forEach(({ agentId }) =>
              this.gateway.sendAgent(
                agentId,
                'ticket-message',
                wsMessage,
                TicketMessageResponseDTO,
              ),
            );
          }
        });
      });
    } catch (err) {
      console.error(err);
    }
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
