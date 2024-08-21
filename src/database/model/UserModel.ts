import { UUID } from 'crypto';
import { Generated } from 'kysely';
import { AuditFields } from '.';

export interface UserModel extends AuditFields {
  userId: Generated<UUID>;
  name: string;
  username: string;
  email: string;
  isEmailVerified: boolean;
}
