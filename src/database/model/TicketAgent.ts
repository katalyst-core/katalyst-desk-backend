import { UUID } from 'crypto';

import { AuditFields } from '.';

export interface TicketAgent extends AuditFields {
  ticketId: UUID;
  agentId: UUID;
  organizationId: UUID;
}
