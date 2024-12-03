export type MessageStatusId = 'sent' | 'delivered' | 'read' | 'none';

export interface MessageStatus {
  statusId: MessageStatusId;
  statusName: string;
}
