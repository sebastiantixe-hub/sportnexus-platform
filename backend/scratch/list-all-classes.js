require('dotenv').config();
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

  console.log(`Total classes in DB: ${classes.length}`);
  const matchPointClasses = classes.filter(c => c.gym?.name.toLowerCase().includes('match') || c.title.toLowerCase().includes('tenis') || c.title.toLowerCase().includes('preparación'));
  console.log(`Found ${matchPointClasses.length} match point or tenis classes:`);
  for (const c of matchPointClasses) {
    console.log(`- Class: "${c.title}"`);
    console.log(`  Gym Name: "${c.gym?.name}"`);
    console.log(`  Trainer Name: "${c.trainer?.user?.name || 'NONE'}"`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
