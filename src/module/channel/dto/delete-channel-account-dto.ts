import { IsString } from 'class-validator';
import { UUID } from 'crypto';

import { RestoreUUID } from 'src/common/decorator/class-transformer';

export class DeleteChannelAccountDTO {
  @IsString()
  @RestoreUUID()
  channel_account_id: UUID;
}
