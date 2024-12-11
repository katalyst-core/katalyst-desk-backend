import { IsNumber } from 'class-validator';

export class DashboardOptionsDTO {
  @IsNumber()
  month: number;

  @IsNumber()
  year: number;
}
