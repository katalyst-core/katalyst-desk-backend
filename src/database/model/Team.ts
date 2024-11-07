import { UUID } from 'crypto';
import { Generated } from 'kysely';
import { AuditFields } from '.';

export interface Team extends AuditFields {
  teamId: Generated<UUID>;
  organizationId: UUID;
  name: string;
}
