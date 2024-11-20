import { Expose } from 'class-transformer';
import { UUID } from 'crypto';

import { ShortenUUID, TransformDTO } from '@decorator/class-transformer';
import { ResponseDTO } from '@dto/response-dto';

class Team extends ResponseDTO {
  @ShortenUUID()
  @Expose({ name: 'team_id' })
  team_id: UUID;

  @Expose({ name: 'name' })
  name: string;
}

export class AgentsResponseDTO extends ResponseDTO {
  @ShortenUUID()
  @Expose({ name: 'agent_id' })
  agentId: UUID;

  @Expose({ name: 'name' })
  name: string;

  @Expose({ name: 'email' })
  email: string;

  @TransformDTO(Team)
  @Expose({ name: 'teams' })
  teams: Team[];

  @Expose({ name: 'timestamp' })
  timestamp: Date;
}
