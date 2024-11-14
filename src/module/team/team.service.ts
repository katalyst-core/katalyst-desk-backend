import { BadRequestException, Injectable } from '@nestjs/common';
import { UUID } from 'crypto';
import { Database } from 'src/database/database';

@Injectable()
export class TeamService {
  constructor(private readonly db: Database) {}

  async getTeamsByOrganizationId(orgId: UUID) {
    return await this.db
      .selectFrom('team')
      .leftJoin('teamAgent', 'teamAgent.teamId', 'team.teamId')
      .select(({ fn }) => [
        'team.teamId',
        'team.name',
        'team.createdAt as timestamp',
        fn.count<number>('teamAgent.agentId').as('totalAgent'),
      ])
      .where('team.organizationId', '=', orgId)
      .groupBy('team.teamId')
      .execute();
  }

  async createTeam(name: string, orgId: UUID) {
    await this.db
      .insertInto('team')
      .values({
        name,
        organizationId: orgId,
      })
      .execute();
  }

  async deleteTeam(teamId: UUID, orgId: UUID) {
    const response = await this.db
      .deleteFrom('team')
      .where('team.teamId', '=', teamId)
      .where('team.organizationId', '=', orgId)
      .returning(['team.teamId'])
      .executeTakeFirst();

    if (!response) {
      throw new BadRequestException({
        code: 'TEAM_NOT_FOUND',
        message: 'Unable to find team',
      });
    }
  }
}
