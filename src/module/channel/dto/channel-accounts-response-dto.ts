import { Expose } from 'class-transformer';
import { UUID } from 'crypto';

import { ShortenUUID } from '@decorator/class-transformer';
import { ResponseDTO } from '@dto/response-dto';

export class ChannelAccountsResponseDTO extends ResponseDTO {
  @ShortenUUID()
  @Expose({ name: 'channel_account_id' })
  channelId: UUID;

  @Expose({ name: 'channel_account_name' })
  channelName: string;

  @Expose({ name: 'channel_type' })
  channelType: string;
}
