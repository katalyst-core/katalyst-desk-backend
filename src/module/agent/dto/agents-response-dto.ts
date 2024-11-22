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

class Role extends ResponseDTO {
  @ShortenUUID()
  @Expose({ name: 'role_id' })
  role_id: UUID;

  @Expose({ name: 'name' })
  role_name: string;
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

  @TransformDTO(Role)
  @Expose({ name: 'roles' })
  roles: Role[];

  @Expose({ name: 'timestamp' })
  timestamp: Date;
}
