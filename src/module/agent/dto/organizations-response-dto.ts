import { ShortenUUID } from '@decorator/class-transformer';
import { ResponseDTO } from '@dto/response-dto';
import { Expose } from 'class-transformer';
import { UUID } from 'crypto';

export class OrganizationsResponseDTO extends ResponseDTO {
  @ShortenUUID()
  @Expose({ name: 'organization_id' })
  organizationId: UUID;

  @Expose({ name: 'name' })
  name: string;
}
