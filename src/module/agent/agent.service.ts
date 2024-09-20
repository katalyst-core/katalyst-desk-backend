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
}
