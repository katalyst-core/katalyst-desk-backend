import { UUID } from 'crypto';

import { AuditFields } from '.';

export interface AgentTeam extends AuditFields {
  teamId: UUID;
  agentId: UUID;
  organizationId: UUID;
}
