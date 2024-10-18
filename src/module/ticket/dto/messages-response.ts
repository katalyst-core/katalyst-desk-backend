import { Expose } from 'class-transformer';
import { UUID } from 'crypto';
import { ShortenUUID } from 'src/common/decorator/class-transformer';
import { ResponseDTO } from 'src/common/dto/response-dto';

export class MessagesResponseDTO extends ResponseDTO {
  @ShortenUUID()
  @Expose({ name: 'message_id' })
  messageId: UUID;

  @Expose({ name: 'content' })
  messageContent: JSON;

  @Expose({ name: 'is_customer' })
  isCustomer: boolean;

  @Expose({ name: 'is_read' })
  isRead: boolean;

  @Expose({ name: 'timestamp' })
  createdAt: string;
}
