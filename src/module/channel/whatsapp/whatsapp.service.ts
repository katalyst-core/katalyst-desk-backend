import { Injectable } from '@nestjs/common';
import { WARequest } from './whatsapp.type';
import { Database } from 'src/database/database';
import { ChannelGateway } from '../channel.gateway';
import { ChannelService } from '../channel.service';

@Injectable()
export class WhatsAppService {
  constructor(
    private readonly db: Database,
    private readonly channelService: ChannelService,
    private readonly gateway: ChannelGateway,
  ) {}

  async handleMessage(req: WARequest) {
    // console.log('req:', JSON.stringify(req)); // Used for webhook debugging
    // const content = req.entry[0].changes[0].value;
    // const contact = content?.contacts[0];
    // const message = content?.messages[0];
    // const { phone_number_id: phoneNumberId } = content.metadata;
    // const {
    //   profile: { name: accountName },
    // } = contact;
    // const { from: accountNumber, id: messageCode } = message;
    // try {
    //   await this.db.transaction().execute(async (tx) => {
    //     const channel = await tx
    //       .selectFrom('channel')
    //       .select(['channel.organizationId', 'channel.channelId'])
    //       .where('channel.channelType', '=', 'whatsapp')
    //       .where('channel.channelAccount', '=', phoneNumberId)
    //       .executeTakeFirst();
    //     if (!channel) {
    //       return;
    //     }
    //     let ticket = await tx
    //       .selectFrom('ticket')
    //       .select(['ticket.ticketId'])
    //       .leftJoin(
    //         'ticketCustomer',
    //         'ticketCustomer.ticketId',
    //         'ticket.ticketId',
    //       )
    //       .where('ticket.channelId', '=', channel.channelId)
    //       .where('ticketCustomer.contactAccount', '=', accountNumber)
    //       .where('ticket.ticketStatus', '!=', 'close')
    //       .executeTakeFirst();
    //     const ticketCode = UtilService.shortenUUID(randomUUID());
    //     if (!ticket) {
    //       ticket = await tx
    //         .insertInto('ticket')
    //         .values({
    //           ticketCode,
    //           organizationId: channel.organizationId,
    //           channelId: channel.channelId,
    //           ticketStatus: 'open',
    //         })
    //         .returning(['ticket.ticketId'])
    //         .executeTakeFirst();
    //       await tx
    //         .insertInto('')
    //         .values({
    //           ticketId: ticket.ticketId,
    //           contactAccount: accountNumber,
    //           contactName: accountName,
    //         })
    //         .execute();
    //     }
    //     const newMessage = await tx
    //       .insertInto('ticketMessage')
    //       .values({
    //         ticketId: ticket.ticketId,
    //         messageCode: messageCode,
    //         messageStatus: 'received',
    //         isCustomer: true,
    //         messageContent: message,
    //       })
    //       .onConflict((b) => b.doNothing())
    //       .returning(['ticketMessage.messageId', 'ticketMessage.createdAt'])
    //       .executeTakeFirst();
    //     // Rough concept, maybe I should broadcast to organization
    //     const agents = await tx
    //       .selectFrom('organizationAgent')
    //       .select('organizationAgent.agentId')
    //       .where(
    //         'organizationAgent.organizationId',
    //         '=',
    //         channel.organizationId,
    //       )
    //       .execute();
    //     const channelMessage = this.channelService.transformRaw(message);
    //     const wsMessage = {
    //       ...ticket,
    //       ...newMessage,
    //       messageContent: channelMessage,
    //       isCustomer: true,
    //       isRead: false,
    //     } satisfies WsMessageResponseDTO;
    //     // This sends to the whole organization
    //     agents.forEach(({ agentId }) =>
    //       this.gateway.sendAgent(
    //         agentId,
    //         'ticket-message',
    //         wsMessage,
    //         WsMessageResponseDTO,
    //       ),
    //     );
    //   });
    // } catch (err) {
    //   console.log(err);
    // }
  }
}
