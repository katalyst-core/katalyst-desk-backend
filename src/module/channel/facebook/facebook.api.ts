import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

import { ApiConfigService } from '@config/api-config.service';

@Injectable()
export class FacebookAPI {
  constructor(
    private readonly config: ApiConfigService,
    private readonly http: HttpService,
  ) {}

  async getAccessToken(code: string) {
    return await lastValueFrom(
      this.http.post(
        'https://graph.facebook.com/v21.0/oauth/access_token',
        JSON.stringify({
          client_id: this.config.getFacebookClientId,
          client_secret: this.config.getFacebookClientSecret,
          grant_type: 'authorization_code',
          code,
        }),
        {
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    );
  }

  async getDebugToken(accessToken: string) {
    return await lastValueFrom(
      this.http.get('https://graph.facebook.com/v21.0/debug_token', {
        params: {
          input_token: accessToken,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    );
  }
}
