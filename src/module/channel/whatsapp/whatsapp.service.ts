import { BadRequestException, Injectable } from '@nestjs/common';
import { WhatsAppConfig } from './whatsapp.type';
import { Database } from 'src/database/database';
import { UUID } from 'crypto';
import { WhatsAppAPI } from './whatsapp.api';
import { FacebookAPI } from '../facebook/facebook.api';
import {
  WhatsAppMessage,
  WhatsAppMessageSchema,
  WhatsAppWebhook,
} from './whatsapp.schema';
import { ChannelService } from '../channel.service';

@Injectable()
export class WhatsAppService {
  constructor(
    private readonly db: Database,
    private readonly channelService: ChannelService,
    private readonly whatsAppAPI: WhatsAppAPI,
    private readonly facebookAPI: FacebookAPI,
  ) {}

  async handleMessage(content: WhatsAppWebhook) {
    content.entry.forEach((entry) => {
      entry.changes.forEach((change) => {
        const {
          metadata: { phone_number_id: channelId },
          contacts,
          messages,
        } = change.value;

        messages.forEach((message) => {
          const { from: customerId, id: messageCode, timestamp } = message;

          const parsedMessage = WhatsAppMessageSchema.safeParse(message);
          const newMessage = parsedMessage.data;

          const customer = contacts.find((c) => c.wa_id === customerId);
          const customerName = customer.profile.name;

          const newTimestamp = new Date(Number(timestamp) * 1000);

          this.channelService.registerMessage({
            senderId: customerId,
            recipientId: channelId,
            messageCode,
            timestamp: newTimestamp,
            message: newMessage,
            channelType: 'whatsapp',
            customerName,
          });
        });
      });
    });
  }

  async sendMessage(
    channelAccount: string,
    customerAccount: string,
    text: string,
  ) {
    const channel = await this.db
      .selectFrom('channel')
      .select(['channel.channelConfig'])
      .where('channel.channelAccount', '=', channelAccount)
      .where('channel.channelType', '=', 'whatsapp')
      .executeTakeFirst();

    const { access_token: accessToken } =
      channel.channelConfig as WhatsAppConfig;

    const message: WhatsAppMessage = {
      type: 'text',
      text: {
        body: text,
      },
    };

    const response = await this.whatsAppAPI.sendMessage(
      channelAccount,
      customerAccount,
      message,
      accessToken,
    );

    const messageCode = response.data.messages[0].id;

    return [messageCode, message];
  }

  async authenticateChannel(
    phoneNumberId: string,
    wabaId: string,
    code: string,
    organizationId: UUID,
  ) {
    try {
      const tokenResponse = await this.facebookAPI.getAccessToken(code);
      const { access_token: accessToken } = tokenResponse.data;

      const debugResponse = await this.facebookAPI.getDebugToken(accessToken);
      const { granular_scopes } = debugResponse.data.data;

      const scopes = [
        'whatsapp_business_management',
        'whatsapp_business_messaging',
      ];

      scopes.forEach((scope) => {
        const gScope = granular_scopes.find(
          (s) => s.scope == scope && s.target_ids.includes(wabaId),
        );

        if (!gScope) {
          throw new Error();
        }
      });

      await this.whatsAppAPI.subscribeToApp(wabaId, accessToken);

      // Brute force registration
      // TODO: Change this to independent registration in the channels tab
      try {
        await this.whatsAppAPI.registerPhoneNumber(phoneNumberId, accessToken);
      } catch {}

      const detailResponse = await this.whatsAppAPI.getPhoneNumberDetail(
        phoneNumberId,
        accessToken,
      );

      const { verified_name: displayName, display_phone_number: phoneNumber } =
        detailResponse.data;

      const config = {
        access_token: accessToken,
        phone_number: phoneNumber,
      } as WhatsAppConfig;

      await this.db
        .insertInto('channel')
        .values({
          channelType: 'whatsapp',
          organizationId,
          channelParentAccount: wabaId,
          channelAccount: phoneNumberId,
          channelName: displayName,
          channelConfig: config,
        })
        .execute();
    } catch (err) {
      console.log(err);
      throw new BadRequestException({
        message: 'Failed to authenticate user',
        code: 'CHANNEL_AUTHENTICATION_FAILED',
      });
    }
  }
}
