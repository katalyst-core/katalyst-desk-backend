import { IsString } from 'class-validator';
import { UUID } from 'crypto';

import { RestoreUUID } from '@decorator/class-transformer';

export class InstagramCodeDTO {
  @IsString()
  code: string;

  @IsString()
  @RestoreUUID()
  organization_id: UUID;
}
