import { IsString } from 'class-validator';
import { UUID } from 'crypto';
import { RestoreUUID } from 'src/common/decorator/class-transformer';

export class WsReadMessagesDTO {
  @IsString()
  @RestoreUUID()
  ticket_id: UUID;
}
