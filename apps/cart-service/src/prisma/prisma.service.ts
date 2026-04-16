import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
// ✅ Fix: import từ '.prisma/client/cart' (có dấu chấm ở đầu, KHÔNG có @)
// Đây là đường dẫn Prisma generate ra tại node_modules/.prisma/client/cart
import { PrismaClient } from '.prisma/client/cart';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('✅ Prisma connected to cart database');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('❌ Prisma disconnected from cart database');
  }
}