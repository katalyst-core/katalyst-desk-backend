import { BadRequestException, Injectable } from '@nestjs/common';
import { jsonArrayFrom } from 'kysely/helpers/postgres';
import { UUID } from 'crypto';

import { Database } from '@database/database';
import { TableOptionsDTO } from '@util/dto/table-options-dto';
import { executeWithTableOptions } from '@util/index';

@Injectable()
export class AgentService {
  constructor(private readonly db: Database) {}

  async getAgentInfo(agentId: UUID) {
    return await this.db
      .selectFrom('agent')
      .select(['agent.name', 'agent.email'])
      .where('agent.agentId', '=', agentId)
      .executeTakeFirst();
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

  async getAgentsByOrganizationId(orgId: UUID, tableOptions: TableOptionsDTO) {
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
            .leftJoin('teamAgent', 'teamAgent.teamId', 'team.teamId')
            .whereRef('teamAgent.agentId', '=', 'agent.agentId')
            .select(['team.teamId', 'team.name'])
            .where('team.organizationId', '=', orgId),
        ).as('teams'),
      ])
      .where('organizationAgent.organizationId', '=', orgId);

    return executeWithTableOptions(query, tableOptions);
  }

  async addAgentToOrganization(orgId: UUID, agentEmail: string) {
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
    // TODO: Remove associated organizations

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

  async assignTeam(agentId: UUID, teamId: UUID) {
    await this.db
      .insertInto('teamAgent')
      .values({
        agentId,
        teamId,
      })
      .execute();
  }

  async unassignTeam(agentId: UUID, teamId: UUID) {
    await this.db
      .deleteFrom('teamAgent')
      .where('teamAgent.agentId', '=', agentId)
      .where('teamAgent.teamId', '=', teamId)
      .execute();
  }
}
