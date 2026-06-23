import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const trainers = await prisma.user.findMany({
    where: { role: 'TRAINER' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      trainerProfile: true
    }
  });
  console.log('Trainer Users:', JSON.stringify(trainers, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
