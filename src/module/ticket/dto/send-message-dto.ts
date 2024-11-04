import { IsString } from 'class-validator';

export class SendMessageDTO {
  @IsString()
  text: string;
}
