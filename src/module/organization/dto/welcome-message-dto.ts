import { IsString } from 'class-validator';

export class WelcomeMessageDTO {
  @IsString()
  message: string;
}
