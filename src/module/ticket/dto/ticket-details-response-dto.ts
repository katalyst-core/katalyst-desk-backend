import { Expose } from 'class-transformer';
import { UUID } from 'crypto';

import { ShortenUUID, TransformDTO } from '@decorator/class-transformer';
import { ResponseDTO } from '@dto/response-dto';

class Team extends ResponseDTO {
  @ShortenUUID()
  @Expose({ name: 'team_id' })
  team_id: UUID;

  @Expose({ name: 'name' })
  name: string;

  @Expose({ name: 'active' })
  active: boolean;
}

export class TicketDetailsResponseDTO extends ResponseDTO {
  @ShortenUUID()
  @Expose({ name: 'ticket_id' })
  ticketId: UUID;

  @Expose({ name: 'ticket_code' })
  ticketCode: string;

  @Expose({ name: 'ticket_status' })
  ticketStatus: string;

  @TransformDTO(Team)
  @Expose({ name: 'teams' })
  teams: Team[];

  @Expose({ name: 'customer_name' })
  customerName: string;

  @Expose({ name: 'expiration' })
  conversationExpiration?: Date;
}
