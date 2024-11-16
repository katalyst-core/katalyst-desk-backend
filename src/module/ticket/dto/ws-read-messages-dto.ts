import { IsString } from 'class-validator';
import { UUID } from 'crypto';

import { RestoreUUID } from '@decorator/class-transformer';

export class WsReadMessagesDTO {
  @IsString()
  @RestoreUUID()
  ticket_id: UUID;
}
