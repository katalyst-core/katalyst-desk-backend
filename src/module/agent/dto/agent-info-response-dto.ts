import { Expose } from 'class-transformer';

import { ResponseDTO } from '@dto/response-dto';

export class AgentInfoResponseDTO extends ResponseDTO {
  @Expose()
  name: string;

  @Expose()
  email: string;
}
