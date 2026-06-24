require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const classes = await prisma.class.findMany({
    where: {
      title: { contains: 'Tenistas' }
    },
    include: {
      gym: true,
      trainer: {
        include: {
          user: true
        }
      }
    }
  });

  console.log(`Found ${classes.length} classes containing 'Tenistas':`);
  for (const c of classes) {
    console.log(`- Class: "${c.title}" (ID: ${c.id})`);
    console.log(`  Gym Name: "${c.gym?.name}" (ID: ${c.gymId})`);
    console.log(`  Trainer Name: "${c.trainer?.user?.name || 'NONE'}" (ID: ${c.trainerId})`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
