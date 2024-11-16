import { BadRequestException, Injectable } from '@nestjs/common';
import { UUID } from 'crypto';

import { Database } from '@database/database';

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

  async getOrganizationById(orgId: UUID) {
    const org = await this.db
      .selectFrom('organization')
      .select(['organization.organizationId', 'organization.name'])
      .where('organization.organizationId', '=', orgId)
      .executeTakeFirst();

    if (!org) {
      throw new BadRequestException({
        code: 'ORGANIZATION_NOT_FOUND',
        message: 'Organization not found',
      });
    }

    return org;
  }
}
