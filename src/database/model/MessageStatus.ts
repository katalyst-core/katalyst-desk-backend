export type MessageStatusId = 'sent' | 'received' | 'read';

export interface MessageStatus {
  statusId: MessageStatusId;
  statusName: string;
}
