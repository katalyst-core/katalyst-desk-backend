import { BadRequestException, Injectable } from '@nestjs/common';
import { UUID } from 'crypto';

import { Database } from '@database/database';
import { InstagramConfig } from './instagram.type';
import { InstagramAPI } from './instagram.api';
import { ChannelService } from '../channel.service';
import { InstagramMessage, InstagramWebhook } from './instagram.schema';

@Injectable()
export class InstagramService {
  constructor(
    private readonly db: Database,
    private readonly channelService: ChannelService,
    private readonly instagramAPI: InstagramAPI,
  ) {}

  handleMessage(content: InstagramWebhook) {
    // Async execution
    content.entry.forEach((entry) =>
      entry.messaging.forEach((messaging) => {
        const {
          sender: { id: senderId },
          recipient: { id: recipientId },
          message,
          read,
          timestamp,
        } = messaging;

        if (message) {
          const { mid: messageCode } = message;

          this.channelService.registerMessage({
            senderId,
            recipientId,
            messageCode,
            timestamp: new Date(timestamp),
            message,
            channelType: 'instagram',
          });
        }

        if (read) {
          const { mid: messageCode } = read;

          this.channelService.updateMessage({
            messageCode,
            status: 'read',
          });
        }
      }),
    );
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
      .where('channel.channelType', '=', 'instagram')
      .executeTakeFirst();

    const { access_token: accessToken } =
      channel.channelConfig as InstagramConfig;

    const message: InstagramMessage = {
      text,
    };

    const response = await this.instagramAPI.sendMessage(
      channelAccount,
      customerAccount,
      message,
      accessToken,
    );

    const { message_id: messageCode } = response.data;

    return [messageCode, message];
  }

  async authenticateChannel(code: string, organizationId: UUID) {
    try {
      const tokenResponse = await this.instagramAPI.getAccessToken(code);

      const { access_token: shortLivedAccessToken, user_id: channelUserId } =
        tokenResponse.data;

      const exChannel = await this.db
        .selectFrom('channel')
        .select(['channel.channelId'])
        .where('channel.channelParentAccount', '=', channelUserId)
        .executeTakeFirst();

      if (exChannel) {
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
      } as InstagramConfig;

      await this.db
        .insertInto('channel')
        .values({
          channelType: 'instagram',
          organizationId,
          channelParentAccount: id,
          channelAccount: user_id,
          channelName: username,
          channelConfig: config,
          channelExpiryDate: expiryDate,
        })
        .execute();
    } catch (err) {
      console.log(err);
      throw new BadRequestException('Failed to authenticate user');
    }
  }
}
