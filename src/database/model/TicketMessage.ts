import { Generated } from 'kysely';
import { UUID } from 'crypto';
import { MessageStatusId } from './MessageStatus';

export interface TicketMessage {
  messageId: Generated<UUID>;
  ticketId: UUID;
  messageStatus: MessageStatusId;
  isCustomer: boolean;
  messageContent: string;
}
