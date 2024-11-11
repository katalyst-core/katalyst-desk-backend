import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

import { ApiConfigService } from 'src/config/api-config.service';
import { InstagramMessage } from './instagram.schema';

@Injectable()
export class InstagramAPI {
  constructor(
    private readonly config: ApiConfigService,
    private readonly http: HttpService,
  ) {}

  async getAccessToken(code: string) {
    const tokenForm = new FormData();
    tokenForm.append('client_id', this.config.getInstagramAppId);
    tokenForm.append('client_secret', this.config.getInstagramAppSecret);
    tokenForm.append('redirect_uri', this.config.getInstagramAppRedirectUrl);
    tokenForm.append('code', code);
    tokenForm.append('grant_type', 'authorization_code');

    return await lastValueFrom(
      this.http.post(
        'https://api.instagram.com/oauth/access_token',
        tokenForm,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      ),
    );
  }

  async getLongLivedAccessToken(accessToken: string) {
    return await lastValueFrom(
      this.http.get('https://graph.instagram.com/access_token', {
        params: {
          grant_type: 'ig_exchange_token',
          client_secret: this.config.getInstagramAppSecret,
          access_token: accessToken,
        },
      }),
    );
  }

  async getUserInfo(accessToken: string) {
    return await lastValueFrom(
      this.http.get('https://graph.instagram.com/v21.0/me', {
        params: {
          fields: 'id,user_id,username,profile_picture_url',
          access_token: accessToken,
        },
      }),
    );
  }

  async sendMessage(
    channelAccount: string,
    customerAccount: string,
    message: InstagramMessage,
    accessToken,
  ) {
    return await lastValueFrom(
      this.http.post(
        `https://graph.instagram.com/v21.0/${channelAccount}/messages`,
        {
          recipient: {
            id: customerAccount,
          },
          message,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      ),
    );
  }
}
