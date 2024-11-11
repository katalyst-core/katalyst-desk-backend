import { UUID } from 'crypto';
import { Generated } from 'kysely';
import { ChannelTypeId } from './ChannelType';
import { AuditFields } from '.';

export interface Channel extends AuditFields {
  channelId: Generated<UUID>;
  organizationId: UUID;
  channelType: ChannelTypeId;
  channelName: string;
  channelParentAccount: string;
  channelAccount: string;
  channelConfig: JSON;
  channelExpiryDate: Date;
}
