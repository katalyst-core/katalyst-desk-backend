import { UUID } from 'crypto';
import { Expose } from 'class-transformer';

import { ShortenUUID } from '@decorator/class-transformer';
import { ResponseDTO } from '@dto/response-dto';

export class NewOrganizationResponseDTO extends ResponseDTO {
  @ShortenUUID()
  @Expose({ name: 'organization_id' })
  organizationId: UUID;
}
