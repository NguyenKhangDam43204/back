// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

@Injectable()
export class PrismaService 
  extends PrismaClient 
  implements OnModuleInit, OnModuleDestroy 
{
  constructor() {
    const adapter = new PrismaMariaDb({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',                    // để '' nếu root không có mật khẩu
      database: 'product_db',
      connectionLimit: 10,
      acquireTimeout: 20000,           // tăng timeout
    });

    super({
      adapter,
      log: ['query', 'error'],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      console.log('✅ Prisma connected successfully with root user');
    } catch (error: any) {
      console.error('❌ Prisma connection failed:', error.message);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}