import { Generated } from 'kysely';
import { UUID } from 'crypto';
import { MessageStatusId } from './MessageStatus';
import { AuditFields } from '.';

export interface TicketMessage extends AuditFields {
  messageId: Generated<UUID>;
  messageCode: string;
  ticketId: UUID;
  messageStatus: MessageStatusId;
  isCustomer: boolean;
  messageContent: JSON;
  isRead: boolean;
}
