import { Injectable } from '@nestjs/common';
import { UUID } from 'crypto';

import { Database } from '@database/database';

@Injectable()
export class RoleService {
  constructor(private readonly db: Database) {}

  async getUnassignedRolesByAgentId(orgId: UUID, agentId: UUID) {
    return await this.db
      .selectFrom('role')
      .leftJoin('agentRole', (join) =>
        join
          .onRef('agentRole.roleId', '=', 'role.roleId')
          .on('agentRole.agentId', '=', agentId),
      )
      .select(['role.roleId', 'role.roleName'])
      .where('agentRole.agentId', 'is', null)
      .where('role.organizationId', '=', orgId)
      .where('role.isDefault', '=', false)
      .execute();
  }
}
