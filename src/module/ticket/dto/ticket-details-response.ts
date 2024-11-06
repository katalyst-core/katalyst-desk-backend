import { Expose } from 'class-transformer';
import { UUID } from 'crypto';
import { ShortenUUID } from 'src/common/decorator/class-transformer';
import { ResponseDTO } from 'src/common/dto/response-dto';

export class TicketDetailsResponseDTO extends ResponseDTO {
  @ShortenUUID()
  @Expose({ name: 'ticket_id' })
  ticketId: UUID;

  @Expose({ name: 'ticket_code' })
  ticketCode: string;

  @Expose({ name: 'ticket_status' })
  ticketStatus: string;

  @Expose({ name: 'customer_name' })
  customerName: string;
}
