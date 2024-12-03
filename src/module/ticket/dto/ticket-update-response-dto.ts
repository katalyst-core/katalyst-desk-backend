import { Exclude, Expose } from 'class-transformer';
import { UUID } from 'crypto';

import { ShortenUUID } from '@decorator/class-transformer';
import { ResponseDTO } from '@dto/response-dto';
import { MessageStatusId } from '@database/model/MessageStatus';
import { TicketStatusId } from '@database/model/TicketStatus';

@Exclude()
export class TicketUpdateResponseDTO extends ResponseDTO {
  @ShortenUUID()
  @Expose({ name: 'ticket_id' })
  ticketId: UUID;

  @ShortenUUID()
  @Expose({ name: 'message_id' })
  messageId?: UUID;

  @Expose({ name: 'message_status' })
  messageStatus?: MessageStatusId;

  @Expose({ name: 'expiration' })
  expiration?: Date;

  @Expose({ name: 'ticket_status' })
  ticketStatus?: TicketStatusId;
}
