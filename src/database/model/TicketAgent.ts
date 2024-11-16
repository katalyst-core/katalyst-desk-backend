import { UUID } from 'crypto';

export interface TicketAgent {
  ticketId: UUID;
  agentId: UUID;
}
