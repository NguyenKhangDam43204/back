import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class AddToCartDto {
  @IsString()
  productId: string;

  @IsOptional()
  @IsString()
  variantId?: string;

  @IsNumber()
  @Min(1)
  @Transform(({ value }) => parseInt(value, 10))
  quantity: number;

  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  price: number; // Giá tại thời điểm thêm vào giỏ
}