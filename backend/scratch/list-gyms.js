const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const gyms = await prisma.gym.findMany();
  console.log(`Found ${gyms.length} gyms:`);
  for (const g of gyms) {
    console.log(`- Name: "${g.name}" (ID: ${g.id})`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
