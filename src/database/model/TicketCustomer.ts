import { UUID } from 'crypto';
import { ContactTypeId } from './ContactType';

export interface TicketCustomer {
  ticketId: UUID;
  contactType: ContactTypeId;
  contactValue: string;
  contactName: string;
}
