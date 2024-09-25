import { UUID } from 'crypto';
import { Generated } from 'kysely';
import { ContactTypeId } from './ContactType';
import { TicketStatusId } from './TicketStatus';

export interface Ticket {
  ticketId: Generated<UUID>;
  ticketCode: string;
  organizationId: UUID;
  teamId: UUID;
  agentId: UUID;
  contactType: ContactTypeId;
  ticketStatus: TicketStatusId;
}
