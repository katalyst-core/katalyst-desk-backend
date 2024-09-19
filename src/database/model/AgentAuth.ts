import { UUID } from 'crypto';
import { AuditFields } from '.';

export interface AgentAuth extends AuditFields {
  agentId: UUID;
  authType: string;
  authValue: string;
}
