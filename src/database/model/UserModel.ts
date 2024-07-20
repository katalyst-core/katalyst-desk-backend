import { UUID } from 'crypto';
import { AuditFields } from '.';
import { Generated } from 'kysely';

export interface UserModel extends AuditFields {
  userId: Generated<UUID>;
  name: string;
  username: string;
  email: string;
  emailVerified: boolean;
}
