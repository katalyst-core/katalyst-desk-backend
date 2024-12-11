import { IsString, MaxLength, MinLength } from 'class-validator';

export class ModifyOrganizationDTO {
  @IsString()
  @MinLength(2)
  @MaxLength(128)
  name: string;
}
