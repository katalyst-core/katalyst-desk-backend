import { Expose } from 'class-transformer';
import { UUID } from 'crypto';
import { ShortenUUID } from 'src/common/decorator/class-transformer';
import { ResponseDTO } from 'src/common/dto/response-dto';

export class TeamsResponseDTO extends ResponseDTO {
  @ShortenUUID()
  @Expose({ name: 'team_id' })
  teamId: UUID;

  @Expose()
  name: string;

  @Expose()
  timestamp: string;

  @Expose({ name: 'total_agent' })
  totalAgent;
}
