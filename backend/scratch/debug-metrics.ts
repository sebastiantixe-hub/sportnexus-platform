import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: 'sofia.vargas.atleta4@hercix-demo.com' },
    include: {
      healthMetrics: true,
      userGoal: true
    }
  });
  console.log('USER:', JSON.stringify(user, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
