export type ChannelTypeId = 'whatsapp' | 'line' | 'instagram';

export interface ChannelType {
  typeId: ChannelTypeId;
  channelName: string;
}
