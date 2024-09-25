import { UUID } from 'crypto';
import { Generated } from 'kysely';
import { ChannelTypeId } from './ChannelType';

export interface OrganizationChannel {
  channelId: Generated<UUID>;
  organizationId: UUID;
  channelType: ChannelTypeId;
  channelAccount: string;
  channelConfig: JSON;
}
