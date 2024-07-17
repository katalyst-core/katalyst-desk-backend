import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class DeleteProductsDTO {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  ids: string[];
}
