import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

import { WhatsAppMessage } from './whatsapp.schema';

@Injectable()
export class WhatsAppAPI {
  constructor(private readonly http: HttpService) {}

  async subscribeToApp(wabaId: string, accessToken: string) {
    return await lastValueFrom(
      this.http.post(
        `https://graph.facebook.com/v21.0/${wabaId}/subscribed_apps`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      ),
    );
  }

  async registerPhoneNumber(phoneNumberId: string, accessToken: string) {
    return await lastValueFrom(
      this.http.post(
        `https://graph.facebook.com/v21.0/${phoneNumberId}/register`,
        JSON.stringify({
          message_product: 'whatsapp',
          pin: '000000',
        }),
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      ),
    );
  }

  async getPhoneNumberDetail(phoneNumberId: string, accessToken: string) {
    return await lastValueFrom(
      this.http.get(`https://graph.facebook.com/v21.0/${phoneNumberId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    );
  }

  async sendMessage(
    channelAccount: string,
    customerAccount: string,
    message: WhatsAppMessage,
    accessToken: string,
  ) {
    return await lastValueFrom(
      this.http.post(
        `https://graph.facebook.com/v21.0/${channelAccount}/messages`,
        JSON.stringify({
          messaging_product: 'whatsapp',
          to: customerAccount,
          type: 'text',
          ...message,
        }),
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      ),
    );
  }

  async readMessage(
    channelAccount: string,
    messageCode: string,
    accessToken: string,
  ) {
    return await lastValueFrom(
      this.http.post(
        `https://graph.facebook.com/v21.0/${channelAccount}/messages`,
        JSON.stringify({
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageCode,
        }),
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      ),
    );
  }
}
