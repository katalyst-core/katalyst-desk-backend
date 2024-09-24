import { UUID } from 'crypto';
import { AuditFields } from '.';

export interface OrganizationAgent extends AuditFields {
  organizationId: UUID;
  agentId: UUID;
}
