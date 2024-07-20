import { UUID } from 'crypto';
import { AuditFields } from '.';
import { Generated } from 'kysely';

export interface UserSessionModel extends AuditFields {
  sessionId: Generated<UUID>;
  userId: UUID;
  sessionToken: string;
}
