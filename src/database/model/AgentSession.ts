import { Generated } from 'kysely';
import { AuditFields } from '.';
import { UUID } from 'crypto';

export interface AgentSession extends AuditFields {
  sessionId: Generated<UUID>;
  agentId: UUID;
  sessionToken: UUID;
}
