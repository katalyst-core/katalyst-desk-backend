import { IsString } from 'class-validator';

export class ResetPasswordDTO {
  @IsString()
  token: string;

  @IsString()
  new_password: string;
}
