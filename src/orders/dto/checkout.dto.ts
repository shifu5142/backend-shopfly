import {
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  IsInt,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CheckoutItemDto {
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @IsInt()
  quantity!: number;
}

export class CheckoutDto {
  @IsString()
  @IsNotEmpty()
  user_id!: string;

  @IsNumber()
  total!: number;

  @IsString()
  @IsNotEmpty()
  status!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  items!: CheckoutItemDto[];
}
