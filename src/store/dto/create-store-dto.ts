import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateStoreDTO {
  @IsString()
  @MinLength(4)
  @MaxLength(100)
  name: string;
}
