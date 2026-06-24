const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const gym = await prisma.gym.findFirst({
    where: { name: { contains: 'Match Point' } }
  });
  console.log('Gym:', gym?.name, 'ID:', gym?.id);
  if (!gym) return;

  const classes = await prisma.class.findMany({
    where: { gymId: gym.id },
    include: {
      trainer: {
        include: {
          user: true
        }
      }
    }
  });

  console.log(`Found ${classes.length} classes:`);
  for (const c of classes) {
    console.log(`- Class: "${c.title}"`);
    console.log(`  Trainer Name: "${c.trainer?.user?.name || 'NONE'}"`);
    console.log(`  Trainer ID: "${c.trainerId || 'NONE'}"`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
