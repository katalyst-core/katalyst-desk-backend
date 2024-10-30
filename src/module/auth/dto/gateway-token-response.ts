import { Expose } from 'class-transformer';
import { ResponseDTO } from 'src/common/dto/response-dto';

export class GatewayTokenResponseDTO extends ResponseDTO {
  @Expose({ name: 'auth_token' })
  gatewayToken: string;
}
