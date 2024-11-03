import { BadRequestException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { UUID } from 'crypto';

import { ApiConfigService } from 'src/config/api-config.service';
import { Database } from 'src/database/database';
import { InstagramAuthConfig } from './instagram.type';
import { InstagramWebhookType } from './instagram.schema';
import { ChannelService } from '../channel.service';
import { ChannelGateway } from '../channel.gateway';

@Injectable()
export class InstagramService {
  constructor(
    private readonly http: HttpService,
    private readonly config: ApiConfigService,
    private readonly db: Database,
    private readonly channelService: ChannelService,
    private readonly gateway: ChannelGateway,
  ) {}

  async handleMessage(content: InstagramWebhookType) {
    // Async execution
    content.entry.forEach(
      async (_entry) =>
        await _entry.messaging.forEach(async (_messaging) => {
          const {
            sender: { id: senderId },
            recipient: { id: recipientId },
            message: { mid: messageCode },
            message,
            timestamp,
          } = _messaging;

          await this.channelService.registerMessage(
            senderId,
            recipientId,
            messageCode,
            timestamp,
            message,
          );
        }),
    );
  }

  async authUser(code: string, agentId: UUID, organizationId: UUID) {
    const org = await this.db
      .selectFrom('organization')
      .select(['organization.organizationId'])
      .where('organization.organizationId', '=', organizationId)
      .where('organization.ownerId', '=', agentId)
      .executeTakeFirst();

    if (!org) {
      throw new BadRequestException('Invalid username or organization');
    }

    const tokenForm = new FormData();
    tokenForm.append('client_id', this.config.getInstagramAppId);
    tokenForm.append('client_secret', this.config.getInstagramAppSecret);
    tokenForm.append('redirect_uri', this.config.getInstagramAppRedirectUrl);
    tokenForm.append('code', code);
    tokenForm.append('grant_type', 'authorization_code');

    try {
      const tokenResponse = await lastValueFrom(
        this.http.post(
          'https://api.instagram.com/oauth/access_token',
          tokenForm,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
          },
        ),
      );

      const { access_token: shortLivedAccessToken, user_id: channelUserId } =
        tokenResponse.data;

      const exChannelAuth = await this.db
        .selectFrom('channelAuth')
        .select(['channelAuth.channelAuthId'])
        .where('channelAuth.channelAuthAccount', '=', channelUserId)
        .executeTakeFirst();

      if (exChannelAuth) {
        throw new BadRequestException('Account already registered');
      }

      const longLivedResponse = await lastValueFrom(
        this.http.get('https://graph.instagram.com/access_token', {
          params: {
            grant_type: 'ig_exchange_token',
            client_secret: this.config.getInstagramAppSecret,
            access_token: shortLivedAccessToken,
          },
        }),
      );

      const { access_token: longLivedAccessToken } = longLivedResponse.data;

      const userInfoResponse = await lastValueFrom(
        this.http.get('https://graph.instagram.com/v21.0/me', {
          params: {
            fields: 'id,user_id,username,profile_picture_url',
            access_token: longLivedAccessToken,
          },
        }),
      );

      const { permissions } = tokenResponse.data;
      const { access_token, expires_in } = longLivedResponse.data;
      const { id, user_id, username, profile_picture_url } =
        userInfoResponse.data;

      const expiryDate = new Date(Date.now() + expires_in * 1000);

      const config = {
        access_token,
        permissions,
        profile_picture_url,
      } as InstagramAuthConfig;

      await this.db.transaction().execute(async (tx) => {
        const channelAuth = await tx
          .insertInto('channelAuth')
          .values({
            channelType: 'instagram',
            organizationId,
            channelAuthAccount: id,
            channelAuthName: username,
            channelAuthExpiryDate: expiryDate,
            channelAuthConfig: config,
          })
          .returning(['channelAuthId'])
          .executeTakeFirst();

        const { channelAuthId } = channelAuth;

        await tx
          .insertInto('channel')
          .values({
            channelType: 'instagram',
            organizationId,
            channelAuthId,
            channelAccount: user_id,
            channelName: username,
          })
          .execute();
      });
    } catch (err) {
      console.log(err);
      throw new BadRequestException('Failed to authenticate user');
    }

    // console.log(tokenResponse);
    // console.log(tokenResponse.status);
    // console.log(tokenResponse.data);
  }
}
