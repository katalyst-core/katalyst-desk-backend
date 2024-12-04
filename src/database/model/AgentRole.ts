import { UUID } from 'crypto';

import { AuditFields } from '.';

export interface AgentRole extends AuditFields {
  roleId: UUID;
  agentId: UUID;
  organizationId: UUID;
}
