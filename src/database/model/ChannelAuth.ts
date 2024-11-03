import { UUID } from 'crypto';
import { Generated } from 'kysely';
import { ChannelTypeId } from './ChannelType';

export interface ChannelAuth {
  channelAuthId: Generated<UUID>;
  organizationId: UUID;
  channelType: ChannelTypeId;
  channelAuthName: string;
  channelAuthAccount: string;
  channelAuthConfig: JSON;
  channelAuthExpiryDate: Date;
}
