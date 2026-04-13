// src/prisma/prisma.module.ts
import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()   // Cho phép inject PrismaService ở mọi nơi mà không cần import module nhiều lần
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}