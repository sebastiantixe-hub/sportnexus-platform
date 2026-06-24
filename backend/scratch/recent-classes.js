require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const classes = await prisma.class.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: { gym: true }
  });

  console.log('10 most recent classes:');
  for (const c of classes) {
    console.log(`- Title: "${c.title}" (Gym: "${c.gym?.name}", ID: ${c.id}, Created: ${c.createdAt.toISOString()})`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
