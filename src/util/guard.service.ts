import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UUID } from 'crypto';
import { Database } from 'src/database/database';

@Injectable()
export class GuardService {
  constructor(private readonly db: Database) {}

  async isOrganizationOwner(agentId: UUID, orgId: UUID) {
    const org = await this.db
      .selectFrom('organization')
      .select(['organization.organizationId'])
      .where('organization.organizationId', '=', orgId)
      .where('organization.ownerId', '=', agentId)
      .executeTakeFirst();

    if (!org) {
      throw new UnauthorizedException({
        message: 'Invalid Access',
        code: 'INVALID_ACCESS',
      });
    }

    return true;
  }

  async hasAccessTo(label: string, agentId: UUID, orgId: UUID) {
    void label;

    const isOrganizationOwner = await this.isOrganizationOwner(agentId, orgId);
    if (isOrganizationOwner) return;
  }
}
