import { TransformDTO } from '@decorator/class-transformer';
import { ResponseDTO } from '@dto/response-dto';
import { Expose } from 'class-transformer';

export class TicketTime extends ResponseDTO {
  @Expose({ name: 'date' })
  date: Date;

  @Expose({ name: 'Instagram' })
  instagram: number;

  @Expose({ name: 'WhatsApp' })
  whatsapp: number;
}

export class TicketStatus extends ResponseDTO {
  @Expose({ name: 'status' })
  status: string;

  @Expose({ name: 'count' })
  count: number;
}

export class DashboardResponseDTO extends ResponseDTO {
  @Expose({ name: 'ticket_count' })
  tickets: number;

  @Expose({ name: 'message_count' })
  messages: number;

  @Expose({ name: 'ticket_resolution_time' })
  ticketResolution: number;

  @Expose({ name: 'message_response_time' })
  responseTime: number;

  @TransformDTO(TicketTime)
  @Expose({ name: 'ticket_overview' })
  ticketTime: TicketTime;

  @TransformDTO(TicketStatus)
  @Expose({ name: 'ticket_status' })
  ticketStatus: TicketStatus;
}
