import { BadRequestException, Injectable } from '@nestjs/common';
import { UUID } from 'crypto';

import { Database } from '@database/database';

import { defaultRoles } from '@guard/permissions';
import { toBinary } from '@util/index';
import { ChannelGateway } from '@module/channel/channel.gateway';
import { WsTypes } from '@websocket/websocket.type';
import { ResponseDTO } from '@dto/response-dto';

import { NewOrganizationDTO } from './dto/new-organization-dto';

@Injectable()
export class OrganizationService {
  constructor(
    private readonly db: Database,
    private readonly gateway: ChannelGateway,
  ) {}

  async createOrganization(agentId: UUID, data: NewOrganizationDTO) {
    return this.db.transaction().execute(async (tx) => {
      const { name } = data;

      const newOrganization = await tx
        .insertInto('organization')
        .values({
          name,
          createdBy: agentId,
        })
        .returning(['organizationId'])
        .executeTakeFirst();

      const { organizationId } = newOrganization;

      defaultRoles.forEach(async (role) => {
        await tx
          .insertInto('role')
          .values({
            roleName: role.name,
            permission: toBinary(role.permissions),
            isDefault: role.isDefault,
            organizationId,
          })
          .execute();
      });

      await tx
        .insertInto('organizationAgent')
        .values({
          organizationId,
          agentId,
          isOwner: true,
        })
        .execute();

      return newOrganization;
    });
  }

  async getOrganizationsByAgentId(agentId: UUID) {
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

  async sendGatewayMessage<T extends ResponseDTO = any>(
    orgId: UUID,
    type: WsTypes,
    data: T,
    dto?: { new (...args: any[]): T },
  ) {
    const orgs = await this.db
      .selectFrom('organizationAgent')
      .select(['organizationAgent.agentId'])
      .where('organizationAgent.organizationId', '=', orgId)
      .execute();

    orgs.forEach((org) => {
      this.gateway.sendAgent(org.agentId, type, data, dto);
    });
  }
}
