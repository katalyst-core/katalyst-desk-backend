import { ResponseDTO } from '@dto/response-dto';
import { Expose } from 'class-transformer';

export class WelcomeMessageResponseDTO extends ResponseDTO {
  @Expose({ name: 'welcome_message' })
  welcomeMessage: string;
}
