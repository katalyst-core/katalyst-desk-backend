import { Generated } from 'kysely';
import { AuditFields } from '.';
import { UUID } from 'crypto';

export interface Agent extends AuditFields {
  agentId: Generated<UUID>;
  name: string;
  email: string;
  isEmailVerified: boolean;
}
