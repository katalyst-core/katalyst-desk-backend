import { Injectable } from '@nestjs/common';
import { UUID } from 'crypto';
import { Database } from 'src/database/database';

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
}
