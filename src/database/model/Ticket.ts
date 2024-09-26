import { UUID } from 'crypto';
import { Generated } from 'kysely';
import { TicketStatusId } from './TicketStatus';

export interface Ticket {
  ticketId: Generated<UUID>;
  ticketCode: string;
  organizationId: UUID;
  teamId: UUID;
  agentId: UUID;
  channelId: UUID;
  ticketStatus: TicketStatusId;
}
