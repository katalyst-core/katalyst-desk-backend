import { UUID } from 'crypto';
import { AuditFields } from '.';
import { Generated } from 'kysely';

export interface StoreModel extends AuditFields {
  storeId: Generated<UUID>;
  ownerId: UUID;
  name: string;
}
