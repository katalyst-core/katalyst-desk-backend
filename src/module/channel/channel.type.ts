import { MessageStatusId } from '@database/model/MessageStatus';
import { UUID } from 'crypto';
import { ChannelTypeId } from 'src/database/model/ChannelType';

export type ChannelMessage = {
  body: string;
};

export type RegisterMessage = {
  senderId: string;
  recipientId: string;
  messageCode: string;
  timestamp: Date;
  message: any;
  channelType: ChannelTypeId;
  customerName?: string;
  agentId?: UUID | null;
};

export type UpdateMessage = {
  messageCode: string;
  status: MessageStatusId;
  conversationId?: string;
  expiration?: Date;
};
