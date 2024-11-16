import { Exclude, Expose } from 'class-transformer';
import { UUID } from 'crypto';

import { ResponseDTO } from '@dto/response-dto';
import { ShortenUUID } from '@decorator/class-transformer';
import { MessageStatusId } from '@database/model/MessageStatus';

@Exclude()
export class NewTicketResponseDTO extends ResponseDTO {
  @ShortenUUID()
  @Expose({ name: 'ticket_id' })
  ticketId: UUID;

  @Expose({ name: 'ticket_code' })
  ticketCode: string;

  @Expose({ name: 'ticket_status' })
  ticketStatus: string;

  @Expose({ name: 'display_name' })
  customerName: string;

  @Expose({ name: 'last_message' })
  messageContent: any;

  @Expose({ name: 'last_message_timestamp' })
  createdAt: Date;

  @Expose({ name: 'is_customer' })
  isCustomer: boolean;

  @Expose({ name: 'message_status' })
  messageStatus: MessageStatusId;

  @Expose({ name: 'unread_count' })
  unread: number;
}
