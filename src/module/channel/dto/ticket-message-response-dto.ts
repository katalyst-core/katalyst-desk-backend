import { Exclude, Expose } from 'class-transformer';
import { UUID } from 'crypto';

import { ShortenUUID } from '@decorator/class-transformer';
import { ResponseDTO } from '@dto/response-dto';
import { MessageStatusId } from '@database/model/MessageStatus';

@Exclude()
export class TicketMessageResponseDTO extends ResponseDTO {
  @ShortenUUID()
  @Expose({ name: 'ticket_id' })
  ticketId: UUID;

  @ShortenUUID()
  @Expose({ name: 'message_id' })
  messageId: UUID;

  @Expose({ name: 'content' })
  messageContent: any;

  @Expose({ name: 'is_customer' })
  isCustomer: boolean;

  @Expose({ name: 'message_status' })
  messageStatus: MessageStatusId;

  @Expose({ name: 'timestamp' })
  createdAt: Date;
}
