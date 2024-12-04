import { UUID } from 'crypto';

import { AuditFields } from '.';

export interface TicketTeam extends AuditFields {
  ticketId: UUID;
  teamId: UUID;
}
