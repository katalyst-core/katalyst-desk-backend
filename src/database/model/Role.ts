import { Generated } from 'kysely';
import { UUID } from 'crypto';

export interface Role {
  roleId: Generated<UUID>;
  roleName: string;
  organizationId: UUID;
  permission: string;
  isDefault: boolean;
}
