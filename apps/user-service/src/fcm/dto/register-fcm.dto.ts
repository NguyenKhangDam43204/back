import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum DeviceTypeEnum {
  ANDROID = 'android',
  IOS = 'ios',
  WEB = 'web',
}

export class RegisterFcmDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsEnum(DeviceTypeEnum, { message: 'deviceType phải là android, ios hoặc web' })
  deviceType: DeviceTypeEnum;
}
