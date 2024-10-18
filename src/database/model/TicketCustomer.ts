import { UUID } from 'crypto';
import { AuditFields } from '.';

export interface TicketCustomer extends AuditFields {
  ticketId: UUID;
  contactAccount: string;
  contactName: string;
}
