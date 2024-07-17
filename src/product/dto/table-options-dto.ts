import { IsInt, IsOptional, IsString, Matches, Min } from 'class-validator';

export class TableOptionsDTO {
  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z0-9_\:]+$/)
  sort: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  page: number;

  @IsOptional()
  @IsInt()
  limit: number;
}
