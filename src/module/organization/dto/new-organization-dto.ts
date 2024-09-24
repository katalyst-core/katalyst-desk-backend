import { IsString, MaxLength, MinLength } from 'class-validator';

export class NewOrganizationDTO {
  @IsString()
  @MinLength(2)
  @MaxLength(128)
  name: string;
}
