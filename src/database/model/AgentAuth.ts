import { UUID } from 'crypto';
import { AuditFields } from '.';
import { AuthTypeId } from './AuthType';

export interface AgentAuth extends AuditFields {
  agentId: UUID;
  authType: AuthTypeId;
  authValue: string;
}
