import { IsString } from 'class-validator';
import { UUID } from 'crypto';

import { RestoreUUID } from 'src/common/decorator/class-transformer';

export class ChannelAccountsDTO {
  @IsString()
  @RestoreUUID()
  organization_id: UUID;
}
