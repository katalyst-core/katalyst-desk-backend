import { UUID } from 'crypto';

export interface AgentRole {
  roleId: UUID;
  agentId: UUID;
  organizationId: UUID;
}
