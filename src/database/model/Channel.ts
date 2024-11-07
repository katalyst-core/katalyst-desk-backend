import { UUID } from 'crypto';
import { Generated } from 'kysely';
import { ChannelTypeId } from './ChannelType';
import { AuditFields } from '.';

export interface Channel extends AuditFields {
  channelId: Generated<UUID>;
  organizationId: UUID;
  channelAuthId: UUID;
  channelType: ChannelTypeId;
  channelName: string;
  channelAccount: string;
  channelConfig: JSON;
}
