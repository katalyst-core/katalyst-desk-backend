import { Injectable } from '@nestjs/common';
import { WARequest } from './whatsapp.type';
import { Database } from 'src/database/database';

@Injectable()
export class WhatsAppService {
  constructor(private readonly db: Database) {}

  async handleMessage(req: WARequest) {
    console.log('req:', JSON.stringify(req)); // Used for webhook debugging

    const content = req.entry[0].changes[0].value;
    const contact = content.contacts[0];
    const message = content.messages[0];

    const { phone_number_id: phoneNumberId } = content.metadata;
    const {
      profile: { name: accountName },
    } = contact;
    const { from: accountNumber, id: messageId } = message;

    try {
      await this.db.transaction().execute(async (tx) => {
        const channel = await tx
          .selectFrom('organizationChannel')
          .select([
            'organizationChannel.organizationId',
            'organizationChannel.channelId',
          ])
          .where('organizationChannel.channelType', '=', 'whatsapp')
          .where('organizationChannel.channelAccount', '=', phoneNumberId)
          .executeTakeFirst();

        if (!channel) {
          return;
        }

        let ticket = await tx
          .selectFrom('ticket')
          .select(['ticket.ticketId'])
          .leftJoin(
            'ticketCustomer',
            'ticketCustomer.ticketId',
            'ticket.ticketId',
          )
          .where('ticket.channelId', '=', channel.channelId)
          .where('ticketCustomer.contactAccount', '=', accountNumber)
          .where('ticket.ticketStatus', '!=', 'close')
          .executeTakeFirst();

        if (!ticket) {
          ticket = await tx
            .insertInto('ticket')
            .values({
              ticketCode: '######',
              organizationId: channel.organizationId,
              channelId: channel.channelId,
              ticketStatus: 'open',
            })
            .returning(['ticket.ticketId'])
            .executeTakeFirst();

          await tx
            .insertInto('ticketCustomer')
            .values({
              ticketId: ticket.ticketId,
              contactAccount: accountNumber,
              contactName: accountName,
            })
            .execute();
        }

        await tx
          .insertInto('ticketMessage')
          .values({
            ticketId: ticket.ticketId,
            messageCode: messageId,
            messageStatus: 'received',
            isCustomer: true,
            messageContent: message,
          })
          .onConflict((b) => b.doNothing())
          .execute();
      });
    } catch (err) {
      console.log(err);
    }
  }
}
