import { PrismaClient } from '@prisma/client';
import { seedUserData } from './init/user';

const prisma = new PrismaClient();

async function main() {
  await seedUserData(prisma);
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
