import { IsDateString, IsEnum, IsOptional, IsString, IsUrl, Matches } from 'class-validator';

export enum GenderEnum {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  userName?: string;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsUrl({}, { message: 'URL avatar không hợp lệ' })
  avatarUrl?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Ngày sinh không hợp lệ (YYYY-MM-DD)' })
  dateOfBirth?: string;

  @IsOptional()
  @IsEnum(GenderEnum, { message: 'Giới tính phải là male, female hoặc other' })
  gender?: GenderEnum;

  @IsOptional()
  @Matches(/^[0-9]{10,11}$/, { message: 'Số điện thoại không hợp lệ' })
  phoneNumber?: string;
}
