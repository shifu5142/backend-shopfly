import { IsNumber } from 'class-validator';

export class DashboardDto {
  @IsNumber()
  users!: number;

  @IsNumber()
  products!: number;

  @IsNumber()
  orders!: number;

  @IsNumber()
  revenue!: number;
}
