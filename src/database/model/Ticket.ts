import { UUID } from 'crypto';
import { Generated } from 'kysely';
import { TicketStatusId } from './TicketStatus';
import { AuditFields } from '.';

export interface Ticket extends AuditFields {
  ticketId: Generated<UUID>;
  ticketCode: string;
  organizationId: UUID;
  teamId: UUID;
  agentId: UUID;
  channelCustomerId: UUID;
  channelId: UUID;
  ticketStatus: TicketStatusId;
  conversationId: string;
  conversationExpiration: Date;
}
