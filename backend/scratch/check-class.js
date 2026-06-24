const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const classes = await prisma.class.findMany({
    include: {
      gym: true,
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
    console.log(`  Gym: "${c.gym?.name}"`);
    console.log(`  Trainer Name: "${c.trainer?.user?.name || 'NONE'}"`);
    console.log(`  Trainer ID: "${c.trainerId || 'NONE'}"`);
    console.log(`  Trainer User ID: "${c.trainer?.userId || 'NONE'}"`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
