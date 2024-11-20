import { Expose } from 'class-transformer';
import { UUID } from 'crypto';

import { ShortenUUID } from '@decorator/class-transformer';
import { ResponseDTO } from '@dto/response-dto';

export class UnassignedTeamsResponseDTO extends ResponseDTO {
  @ShortenUUID()
  @Expose({ name: 'team_id' })
  teamId: UUID;

  @Expose({ name: 'name' })
  name: string;
}
