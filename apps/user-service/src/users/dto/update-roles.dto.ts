import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class UpdateRolesDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  roles: string[];
}
