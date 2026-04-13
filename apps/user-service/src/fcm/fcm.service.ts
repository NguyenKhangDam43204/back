import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterFcmDto } from './dto/register-fcm.dto';

@Injectable()
export class FcmService {
  constructor(private readonly prisma: PrismaService) {}

  async registerToken(userId: string, dto: RegisterFcmDto) {
    // Upsert: if token exists for another user, reassign it
    await this.prisma.fcmToken.upsert({
      where: { token: dto.token },
      update: { userId, deviceType: dto.deviceType as any },
      create: {
        userId,
        token: dto.token,
        deviceType: dto.deviceType as any,
      },
    });

    return { message: 'FCM token đã được đăng ký' };
  }

  async removeToken(userId: string, token: string) {
    await this.prisma.fcmToken.deleteMany({
      where: { userId, token },
    });

    return { message: 'FCM token đã được xoá' };
  }
}
