import { Injectable } from '@nestjs/common';
import { UUID } from 'crypto';

import { Database } from 'src/database/database';
import { NewOrganizationDTO } from './dto/new-organization-dto';

@Injectable()
export class OrganizationService {
  constructor(private readonly db: Database) {}

  async createOrganization(agentId: UUID, data: NewOrganizationDTO) {
    return this.db.transaction().execute(async (tx) => {
      const { name } = data;

      const newOrganization = await tx
        .insertInto('organization')
        .values({
          name,
          ownerId: agentId,
          createdBy: agentId,
        })
        .returning(['organizationId'])
        .executeTakeFirst();

      const { organizationId } = newOrganization;

      await tx
        .insertInto('organizationAgent')
        .values({
          organizationId,
          agentId,
        })
        .execute();

      return newOrganization;
    });
  }

  async getAllOrganizationByAgentId(agentId: UUID) {
    return await this.db
      .selectFrom('organizationAgent')
      .innerJoin(
        'organization',
        'organization.organizationId',
        'organizationAgent.organizationId',
      )
      .select(['organizationAgent.organizationId', 'organization.name'])
      .where('organizationAgent.agentId', '=', agentId)
      .execute();
  }

  async getOrganizationById(organizationId: UUID) {
    return await this.db
      .selectFrom('organization')
      .select(['organizationId', 'organization.name'])
      .where('organizationId', '=', organizationId)
      .executeTakeFirst();
  }
}
