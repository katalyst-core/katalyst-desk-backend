import { IsString } from 'class-validator';
import { UUID } from 'crypto';
import { RestoreUUID } from 'src/common/decorator/class-transformer';

export class InstagramCodeDTO {
  @IsString()
  code: string;

  @IsString()
  @RestoreUUID()
  organization_id: UUID;
}
