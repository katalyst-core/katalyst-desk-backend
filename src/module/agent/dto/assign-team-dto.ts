import { RestoreUUID } from '@decorator/class-transformer';
import { IsString } from 'class-validator';
import { UUID } from 'crypto';

export class AssignTeamDTO {
  @RestoreUUID()
  @IsString()
  team_id: UUID;

  @RestoreUUID()
  @IsString()
  agent_id: UUID;
}
