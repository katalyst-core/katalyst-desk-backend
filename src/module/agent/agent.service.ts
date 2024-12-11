import { BadRequestException, Injectable } from '@nestjs/common';
import { jsonArrayFrom } from 'kysely/helpers/postgres';
import { UUID } from 'crypto';

import { Database } from '@database/database';
import { TableOptionsDTO } from '@util/dto/table-options-dto';
import { executeWithTableOptions } from '@util/index';
import { ModifyAgentDTO } from './dto/modify-agent-dto';

@Injectable()
export class AgentService {
  constructor(private readonly db: Database) {}

  async getAgentInfoById(agentId: UUID) {
    return await this.db
      .selectFrom('agent')
      .select(['agent.name', 'agent.email'])
      .where('agent.agentId', '=', agentId)
      .executeTakeFirst();
  }

  async getAgentsInOrganization(orgId: UUID, tableOptions: TableOptionsDTO) {
    const query = this.db
      .selectFrom('agent')
      .innerJoin(
        'organizationAgent',
        'organizationAgent.agentId',
        'agent.agentId',
      )
      .select(({ selectFrom }) => [
        'agent.agentId',
        'agent.name',
        'agent.email',
        'agent.createdAt as timestamp',
        jsonArrayFrom(
          selectFrom('team')
            .leftJoin('agentTeam', 'agentTeam.teamId', 'team.teamId')
            .whereRef('agentTeam.agentId', '=', 'agent.agentId')
            .select(['team.teamId', 'team.name'])
            .where('team.organizationId', '=', orgId),
        ).as('teams'),
        jsonArrayFrom(
          selectFrom('role')
            .leftJoin('agentRole', 'agentRole.roleId', 'role.roleId')
            .whereRef('agentRole.agentId', '=', 'agent.agentId')
            .select(['role.roleId', 'role.roleName'])
            .where('role.organizationId', '=', orgId),
        ).as('roles'),
      ])
      .where('organizationAgent.organizationId', '=', orgId);

    return executeWithTableOptions(query, tableOptions);
  }

  async addAgentToOrganizationByEmail(orgId: UUID, agentEmail: string) {
    const agent = await this.db
      .selectFrom('agent')
      .select(['agent.agentId'])
      .where('agent.email', '=', agentEmail)
      .executeTakeFirst();

    if (!agent) {
      throw new BadRequestException({
        message: `Agent doesn't exist`,
        code: 'NO_AGENT',
      });
    }

    const { agentId } = agent;

    const orgAgent = await this.db
      .selectFrom('organizationAgent')
      .select(['organizationAgent.agentId'])
      .where('organizationAgent.agentId', '=', agentId)
      .where('organizationAgent.organizationId', '=', orgId)
      .executeTakeFirst();

    if (orgAgent) {
      throw new BadRequestException({
        message: 'Agent already in organization',
        code: 'AGENT_ORGANIZATION_EXIST',
      });
    }

    await this.db
      .insertInto('organizationAgent')
      .values({
        agentId: agent.agentId,
        organizationId: orgId,
      })
      .returning(['organizationAgent.agentId'])
      .executeTakeFirst();
  }

  async removeAgentFromOrganization(orgId: UUID, agentId: UUID) {
    const orgAgent = await this.db
      .deleteFrom('organizationAgent')
      .where('organizationAgent.agentId', '=', agentId)
      .where('organizationAgent.organizationId', '=', orgId)
      .returning(['organizationAgent.agentId'])
      .executeTakeFirst();

    if (!orgAgent) {
      throw new BadRequestException({
        message: `Agent doesn't exist`,
        code: 'NO_AGENT',
      });
    }
  }

  async addAgentToTeam(organizationId: UUID, agentId: UUID, teamId: UUID) {
    await this.db
      .insertInto('agentTeam')
      .values({
        organizationId,
        agentId,
        teamId,
      })
      .execute();
  }

  async removeAgentFromTeam(organizationId: UUID, agentId: UUID, teamId: UUID) {
    await this.db
      .deleteFrom('agentTeam')
      .where('agentTeam.organizationId', '=', organizationId)
      .where('agentTeam.agentId', '=', agentId)
      .where('agentTeam.teamId', '=', teamId)
      .execute();
  }

  async addRoleToAgent(organizationId: UUID, agentId: UUID, roleId: UUID) {
    const role = await this.db
      .selectFrom('role')
      .select(['role.isDefault'])
      .where('role.roleId', '=', roleId)
      .where('role.organizationId', '=', organizationId)
      .executeTakeFirst();

    if (!role || role.isDefault) {
      throw new BadRequestException({
        message: `Role Doesn't exist`,
        code: 'NO_ROLE_FOUND',
      });
    }

    await this.db
      .insertInto('agentRole')
      .values({
        organizationId,
        agentId,
        roleId,
      })
      .execute();
  }

  async removeRoleFromAgent(organizationId: UUID, agentId: UUID, roleId: UUID) {
    await this.db
      .deleteFrom('agentRole')
      .where('agentRole.organizationId', '=', organizationId)
      .where('agentRole.agentId', '=', agentId)
      .where('agentRole.roleId', '=', roleId)
      .execute();
  }

  async modifyAgent(agentId: UUID, data: ModifyAgentDTO) {
    const { name } = data;

    await this.db
      .updateTable('agent')
      .set({
        name,
      })
      .where('agent.agentId', '=', agentId)
      .execute();
  }
}
