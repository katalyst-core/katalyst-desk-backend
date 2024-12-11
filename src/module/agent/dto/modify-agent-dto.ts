import { IsString, MinLength, MaxLength } from 'class-validator';

export class ModifyAgentDTO {
  @IsString()
  @MinLength(2)
  @MaxLength(128)
  name: string;
}
