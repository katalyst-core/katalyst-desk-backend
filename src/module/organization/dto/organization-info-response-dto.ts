import { Expose } from 'class-transformer';
import { UUID } from 'crypto';

import { ResponseDTO } from '@dto/response-dto';
import { ShortenUUID } from '@decorator/class-transformer';

export class OrganizationInfoResponseDTO extends ResponseDTO {
  @ShortenUUID()
  @Expose({ name: 'organization_id' })
  organizationId: UUID;

  @Expose({ name: 'name' })
  name: string;

  @Expose({ name: 'permission' })
  permission: string;
}
