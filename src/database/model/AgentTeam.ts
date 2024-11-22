import { UUID } from 'crypto';

export interface AgentTeam {
  teamId: UUID;
  agentId: UUID;
  organizationId: UUID;
}
