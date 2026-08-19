import { IsString, IsObject, IsNumber, IsNotEmpty } from 'class-validator';

export class CartDto {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsString()
  @IsNotEmpty()
  productId!: string;

  @IsObject()
  @IsNotEmpty()
  item!: {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    [key: string]: any;
  };

  @IsNumber()
  price!: number;

  @IsNumber()
  quantity!: number;

  @IsNumber()
  total!: number;
}
