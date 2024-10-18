import { Expose } from 'class-transformer';
import { UUID } from 'crypto';
import { ShortenUUID } from 'src/common/decorator/class-transformer';
import { ResponseDTO } from 'src/common/dto/response-dto';

export class TicketsResponseDTO extends ResponseDTO {
  @ShortenUUID()
  @Expose({ name: 'ticket_id' })
  ticketId: UUID;

  @Expose({ name: 'ticket_code' })
  ticketCode: string;

  @Expose({ name: 'display_name' })
  contactName: string;

  @Expose({ name: 'last_message' })
  messageContent: string;

  @Expose({ name: 'last_message_timestamp' })
  createdAt: Date;

  @Expose({ name: 'is_customer' })
  isCustomer: boolean;

  @Expose({ name: 'is_read' })
  isRead: boolean;

  @Expose({ name: 'unread_count' })
  unread: number;
}
