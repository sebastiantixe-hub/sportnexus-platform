const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const gyms = await prisma.gym.findMany({
    where: { name: { contains: 'Match Point' } }
  });
  console.log(`Found ${gyms.length} gyms matching 'Match Point':`);
  for (const g of gyms) {
    console.log(`- Name: "${g.name}" (ID: ${g.id})`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
