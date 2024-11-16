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
  agentId?: UUID;
};
