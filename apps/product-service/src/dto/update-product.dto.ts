import { IsString, IsUUID, IsOptional, IsBoolean } from 'class-validator';

export class UpdateProductDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsUUID() categoryId?: string;
  @IsOptional() @IsUUID() modelId?: string;
  @IsOptional() @IsString() imgUrl?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
