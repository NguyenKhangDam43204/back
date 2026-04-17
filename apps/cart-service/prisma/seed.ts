import { config as loadEnv } from 'dotenv';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { PrismaClient } from '@prisma/client';

const rootEnvPath = [
  resolve(process.cwd(), '.env'),
  resolve(process.cwd(), '../../.env'),
  resolve(process.cwd(), '../../../.env'),
  '/app/.env',
].find((path) => existsSync(path));

if (rootEnvPath) {
  loadEnv({ path: rootEnvPath });
  console.log(`Loaded env from: ${rootEnvPath}`);
}

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding cart-service...');

  const demoUserIds = [
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
  ];

  for (const userId of demoUserIds) {
    await prisma.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
  }

  console.log(`✅ Cart seed completed successfully! Created carts for ${demoUserIds.length} users`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });