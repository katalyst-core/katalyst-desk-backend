import { Expose } from 'class-transformer';
import { UUID } from 'crypto';
import { ShortenUUID } from 'src/common/decorator/class-transformer';
import { ResponseDTO } from 'src/common/dto/response-dto';

export class WsMessageResponseDTO extends ResponseDTO {
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

  @Expose({ name: 'is_read' })
  isRead: boolean;

  @Expose({ name: 'timestamp' })
  createdAt: Date;
}
