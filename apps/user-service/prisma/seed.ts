import { PrismaClient } from '@prisma/user-client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding roles...');

  const roles = ['admin', 'staff', 'customer'];

  for (const name of roles) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    console.log(`  ✅ Role "${name}" seeded`);
  }

  console.log('✅ Seeding complete');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
