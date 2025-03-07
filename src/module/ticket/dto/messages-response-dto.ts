import { Expose } from 'class-transformer';
import { UUID } from 'crypto';

import { ShortenUUID } from '@decorator/class-transformer';
import { ResponseDTO } from '@dto/response-dto';

export class MessagesResponseDTO extends ResponseDTO {
  @ShortenUUID()
  @Expose({ name: 'message_id' })
  messageId: UUID;

  @Expose({ name: 'content' })
  messageContent: JSON;

  @Expose({ name: 'is_customer' })
  isCustomer: boolean;

  @Expose({ name: 'message_status' })
  messageStatus: boolean;

  @Expose({ name: 'timestamp' })
  createdAt: Date;
}
