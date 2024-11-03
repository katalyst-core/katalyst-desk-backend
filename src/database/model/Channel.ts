import { UUID } from 'crypto';
import { Generated } from 'kysely';
import { ChannelTypeId } from './ChannelType';

export interface Channel {
  channelId: Generated<UUID>;
  organizationId: UUID;
  channelAuthId: UUID;
  channelType: ChannelTypeId;
  channelName: string;
  channelAccount: string;
  channelConfig: JSON;
}
