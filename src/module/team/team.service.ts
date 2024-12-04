import { BadRequestException, Injectable } from '@nestjs/common';
import { UUID } from 'crypto';

import { Database } from '@database/database';

@Injectable()
export class TeamService {
  constructor(private readonly db: Database) {}

  async getTeamsByOrganizationId(orgId: UUID) {
    return await this.db
      .selectFrom('team')
      .leftJoin('agentTeam', 'agentTeam.teamId', 'team.teamId')
      .select(({ fn }) => [
        'team.teamId',
        'team.name',
        'team.createdAt as timestamp',
        fn.count<number>('agentTeam.agentId').as('totalAgent'),
      ])
      .where('team.organizationId', '=', orgId)
      .groupBy(['team.teamId', 'team.name', 'timestamp'])
      .execute();
  }

  async createTeam(name: string, orgId: UUID) {
    const teams = await this.db
      .selectFrom('team')
      .select(({ fn }) => [fn.countAll().as('count')])
      .where('team.organizationId', '=', orgId)
      .executeTakeFirst();

    if (Number(teams.count) > 25) {
      throw new BadRequestException({
        message: 'You can only create 25 teams',
        code: 'MAXIMUM_TEAM_LIMIT',
      });
    }

    await this.db
      .insertInto('team')
      .values({
        name,
        organizationId: orgId,
      })
      .execute();
  }

  async deleteTeam(teamId: UUID) {
    const response = await this.db
      .deleteFrom('team')
      .where('team.teamId', '=', teamId)
      .returning(['team.teamId'])
      .executeTakeFirst();

    if (!response) {
      throw new BadRequestException({
        code: 'TEAM_NOT_FOUND',
        message: 'Unable to find team',
      });
    }
  }

  async getUnassignedTeamsByAgentId(orgId: UUID, agentId: UUID) {
    return await this.db
      .selectFrom('team')
      .leftJoin('agentTeam', (join) =>
        join
          .onRef('agentTeam.teamId', '=', 'team.teamId')
          .on('agentTeam.agentId', '=', agentId),
      )
      .select(['team.teamId', 'team.name'])
      .where('agentTeam.agentId', 'is', null)
      .where('team.organizationId', '=', orgId)
      .execute();
  }
}
