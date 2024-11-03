import { BadRequestException, Injectable } from '@nestjs/common';

import { ChannelMessage } from './channel.type';
import { randomUUID, UUID } from 'crypto';
import { Database } from 'src/database/database';
import { InstagramMessage } from './instagram/instagram.schema';
import { UtilService } from 'src/util/util.service';
import { ChannelGateway } from './channel.gateway';
import { WsTicketMessageDTO } from './dto/ws-ticket-message-dto';
import { WsNewTicketDTO } from './dto/ws-new-ticket-dto';

@Injectable()
export class ChannelService {
  constructor(
    private readonly db: Database,
    private readonly gateway: ChannelGateway,
  ) {}

  async getChannelAccountsByOrgId(orgId: UUID, agentId: UUID) {
    const org = await this.db
      .selectFrom('organization')
      .select(['organization.organizationId'])
      .where('organization.organizationId', '=', orgId)
      .where('organization.ownerId', '=', agentId)
      .executeTakeFirst();

    if (!org) {
      throw new BadRequestException({
        message: `You don't have access`,
        code: 'INSUFFICIENT_ACCESS',
      });
    }

    const channels = await this.db
      .selectFrom('channelAuth')
      .select([
        'channelAuth.channelAuthId',
        'channelAuth.channelAuthName',
        'channelAuth.channelType',
      ])
      .where('channelAuth.organizationId', '=', orgId)
      .execute();

    return channels;
  }

  async deleteAccountById(channelAuthId: UUID, agentId: UUID) {
    const channelAuth = await this.db
      .selectFrom('channelAuth')
      .select(['channelAuth.channelAuthId'])
      .innerJoin(
        'organization',
        'organization.organizationId',
        'channelAuth.organizationId',
      )
      .where('channelAuth.channelAuthId', '=', channelAuthId)
      .where('organization.ownerId', '=', agentId)
      .executeTakeFirst();

    if (!channelAuth) {
      throw new BadRequestException({
        message: 'Insufficient access',
        code: 'INSUFFICIENT_ACCESS',
      });
    }

    await this.db
      .deleteFrom('channelAuth')
      .where('channelAuth.channelAuthId', '=', channelAuthId)
      .execute();
  }

  async registerMessage(
    senderId: string,
    recipientId: string,
    messageCode: string,
    timestamp: number,
    message: any,
  ) {
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
          .where('channel.channelType', '=', 'instagram')
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
                  customerName: 'Unknown',
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
            const ticketCode = UtilService.shortenUUID(randomUUID());
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
              messageStatus: 'received',
              isCustomer,
              messageContent: message as JSON,
              createdAt: new Date(timestamp),
            })
            .onConflict((b) => b.doNothing())
            .returning(['ticketMessage.messageId', 'ticketMessage.createdAt'])
            .executeTakeFirst();

          const { organizationId } = channel;

          const agents = await tx
            .selectFrom('organizationAgent')
            .select(['organizationAgent.agentId'])
            .where('organizationAgent.organizationId', '=', organizationId)
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

            const wsMessage = {
              ...ticket,
              ...newMessage,
              ...masterCustomer,
              messageContent: channelMessage,
              isCustomer,
              unread: 0,
              isRead: false, // Change this to the actual is read
            } satisfies WsNewTicketDTO;

            agents.forEach(({ agentId }) =>
              this.gateway.sendAgent(
                agentId,
                'new-ticket',
                wsMessage,
                WsNewTicketDTO,
              ),
            );
          } else {
            const wsMessage = {
              ...ticket,
              ...newMessage,
              messageContent: channelMessage,
              isCustomer,
              isRead: false, // Change this to the actual is read
            } satisfies WsTicketMessageDTO;

            agents.forEach(({ agentId }) =>
              this.gateway.sendAgent(
                agentId,
                'ticket-message',
                wsMessage,
                WsTicketMessageDTO,
              ),
            );
          }
        });
      });
    } catch (err) {
      console.error(err);
    }
  }

  transformRaw(data: any): ChannelMessage | null {
    const instagram = InstagramMessage.safeParse(data);
    if (instagram.success) {
      const {
        data: { text: body },
      } = instagram;

      return { body };
    }

    // if (data satisfies WAMessage) {
    //   return {
    //     body: data.text.body,
    //   };
    // }

    return null;
  }
}
