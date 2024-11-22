import { RestoreUUID } from '@decorator/class-transformer';
import { IsString } from 'class-validator';
import { UUID } from 'crypto';

export class AssignRoleDTO {
  @RestoreUUID()
  @IsString()
  role_id: UUID;

  @RestoreUUID()
  @IsString()
  agent_id: UUID;
}
