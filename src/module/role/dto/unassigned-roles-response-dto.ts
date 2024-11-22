import { Expose } from 'class-transformer';
import { UUID } from 'crypto';

import { ShortenUUID } from '@decorator/class-transformer';
import { ResponseDTO } from '@dto/response-dto';

export class UnassignedRolesResponseDTO extends ResponseDTO {
  @ShortenUUID()
  @Expose({ name: 'role_id' })
  roleId: UUID;

  @Expose({ name: 'name' })
  roleName: string;
}
