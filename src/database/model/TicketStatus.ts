export type TicketStatusId = 'open' | 'close';

export interface TicketStatus {
  statusId: TicketStatusId;
  statusName: string;
}
