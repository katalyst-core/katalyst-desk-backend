import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class NewAgentDTO {
  @IsString()
  @MinLength(2)
  @MaxLength(128)
  name: string;

  @IsEmail()
  @MinLength(6)
  @MaxLength(256)
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;
}
