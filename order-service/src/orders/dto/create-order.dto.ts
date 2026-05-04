import { IsNumber, IsString, IsNotEmpty, Min } from 'class-validator';

export class CreateOrderDto {
  @IsNumber()
  @Min(1)
  productId: number;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsString()
  @IsNotEmpty()
  customerEmail: string;
}