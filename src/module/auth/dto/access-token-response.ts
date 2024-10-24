import { Expose } from 'class-transformer';
import { ResponseDTO } from 'src/common/dto/response-dto';

export class AccessTokenResponseDTO extends ResponseDTO {
  @Expose({ name: 'auth_token' })
  accessToken: string;
}
