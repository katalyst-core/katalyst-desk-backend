import { Generated } from 'kysely';
import { UUID } from 'crypto';

import { AuditFields } from '.';

export interface Role extends AuditFields {
  roleId: Generated<UUID>;
  roleName: string;
  organizationId: UUID;
  permission: string;
  isDefault: boolean;
}
