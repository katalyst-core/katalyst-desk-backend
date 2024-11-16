import { IsString } from 'class-validator';
import { UUID } from 'crypto';

import { RestoreUUID } from '@decorator/class-transformer';

export class WhatsAppAuthDTO {
  @IsString()
  phone_number_id: string;

  @IsString()
  waba_id: string;

  @IsString()
  code: string;

  @RestoreUUID()
  @IsString()
  organization_id: UUID;
}
