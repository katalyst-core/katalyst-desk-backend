import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UUID } from 'crypto';
import { Database } from 'src/database/database';

@Injectable()
export class GuardService {
  constructor(private readonly db: Database) {}

  async isOrganizationOwner(agentId: UUID, organizationId: UUID) {
    const org = await this.db
      .selectFrom('organization')
      .select(['organization.organizationId'])
      .where('organization.organizationId', '=', organizationId)
      .where('organization.ownerId', '=', agentId)
      .executeTakeFirst();

    if (!org) {
      throw new UnauthorizedException({
        message: 'Invalid Access',
        code: 'INVALID_ACCESS',
      });
    }
  }
}
