import { BadRequestException, Injectable } from '@nestjs/common';
import { UUID } from 'crypto';

import { Database } from 'src/database/database';
import { InstagramConfig } from './instagram.type';
import {
  InstagramMessage,
  InstagramMessageSchema,
  InstagramWebhook,
} from './instagram.schema';
import { ChannelService } from '../channel.service';
import { InstagramAPI } from './instagram.api';

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
          message: { mid: messageCode },
          message,
          timestamp,
        } = messaging;

        const parsedMessage = InstagramMessageSchema.safeParse(message);
        const newMessage = parsedMessage.data;

        this.channelService.registerMessage({
          senderId,
          recipientId,
          messageCode,
          timestamp: new Date(timestamp),
          message: newMessage,
          channelType: 'instagram',
        });
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

  async authChannel(code: string, agentId: UUID, organizationId: UUID) {
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
