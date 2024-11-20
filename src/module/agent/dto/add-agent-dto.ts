import { IsEmail } from 'class-validator';

export class AddAgentDTO {
  @IsEmail()
  email: string;
}
