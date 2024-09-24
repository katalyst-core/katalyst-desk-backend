import { Generated } from 'kysely';
import { AuditFields } from '.';
import { UUID } from 'crypto';

export interface Organization extends AuditFields {
  organizationId: Generated<UUID>;
  ownerId: UUID;
  name: string;
}
