import { UUID } from 'crypto';
import { Generated } from 'kysely';
import { ChannelTypeId } from './ChannelType';
import { AuditFields } from '.';

export interface ChannelAuth extends AuditFields {
  channelAuthId: Generated<UUID>;
  organizationId: UUID;
  channelType: ChannelTypeId;
  channelAuthName: string;
  channelAuthAccount: string;
  channelAuthConfig: JSON;
  channelAuthExpiryDate: Date;
}
