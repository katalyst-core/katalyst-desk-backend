import { Generated } from 'kysely';
import { UUID } from 'crypto';
import { AuditFields } from '.';
import { ChannelTypeId } from './ChannelType';

export interface ChannelCustomer extends AuditFields {
  channelCustomerId: Generated<UUID>;
  masterCustomerId: string;
  customerAccount: string;
  channelType: ChannelTypeId;
}
