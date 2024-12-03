import { Generated } from 'kysely';

import { AuditFields } from '.';
import { ChannelTypeId } from './ChannelType';

export interface ChannelEventLog extends AuditFields {
  id: Generated<bigint>;
  content: JSON;
  error: JSON | null;
  channelType: ChannelTypeId;
  isProcessed: boolean;
}
