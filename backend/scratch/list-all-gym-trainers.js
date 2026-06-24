const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const assignments = await prisma.gymTrainer.findMany({
    include: {
      gym: true,
      trainer: {
        include: {
          user: true
        }
      }
    }
  });

  console.log(`Found ${assignments.length} GymTrainer assignments:`);
  for (const a of assignments) {
    console.log(`- Gym: "${a.gym?.name}" (ID: ${a.gymId})`);
    console.log(`  Trainer: "${a.trainer?.user?.name}" (ID: ${a.trainerId})`);
    console.log(`  Trainer User ID: "${a.trainer?.userId}"`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
