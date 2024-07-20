import { UUID } from 'crypto';
import { AuditFields } from '.';

export interface BasicUserAuthenticationModel extends AuditFields {
  userId: UUID;
  passwordHash: string;
}
