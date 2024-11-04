import { BadRequestException, Injectable } from '@nestjs/common';
import { UUID } from 'crypto';

import { Database } from 'src/database/database';
import { InstagramAuthConfig } from './instagram.type';
import { InstagramWebhookType } from './instagram.schema';
import { ChannelService } from '../channel.service';
import { InstagramAPI } from './instagram.api';

@Injectable()
export class InstagramService {
  constructor(
    private readonly db: Database,
    private readonly channelService: ChannelService,
    private readonly instagramAPI: InstagramAPI,
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

    try {
      const tokenResponse = await this.instagramAPI.getAccessToken(code);

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

      const longLivedResponse = await this.instagramAPI.getLongLivedAccessToken(
        shortLivedAccessToken,
      );

      const { access_token: longLivedAccessToken } = longLivedResponse.data;

      const userInfoResponse =
        await this.instagramAPI.getUserInfo(longLivedAccessToken);

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
  }
}
