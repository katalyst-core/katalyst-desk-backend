export type ChannelTypeId = 'whatsapp' | 'line';

export interface ChannelType {
  typeId: ChannelTypeId;
  channelName: string;
}
