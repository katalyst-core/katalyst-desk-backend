import { UUID } from 'crypto';

export interface TicketCustomer {
  ticketId: UUID;
  contactAccount: string;
  contactName: string;
}
