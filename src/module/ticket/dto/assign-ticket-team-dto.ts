import { IsString } from 'class-validator';
import { UUID } from 'crypto';

import { RestoreUUID } from '@decorator/class-transformer';

export class AssignTicketTeamDTO {
  @RestoreUUID()
  @IsString()
  ticket_id: UUID;

  @RestoreUUID()
  @IsString()
  team_id: UUID;
}
