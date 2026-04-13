import { IsOptional, IsNumber, IsString, IsBoolean } from 'class-validator';

export class UpdateVariantDto {
  @IsOptional() @IsString() color?: string;
  @IsOptional() @IsNumber() ram?: number;
  @IsOptional() @IsNumber() storage?: number;
  @IsOptional() @IsNumber() importPrice?: number;
  @IsOptional() @IsNumber() originalPrice?: number;
  @IsOptional() @IsNumber() price?: number;
  @IsOptional() @IsNumber() stockQuantity?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
