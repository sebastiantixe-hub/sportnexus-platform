require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const gyms = await prisma.gym.findMany();
  console.log(`Total gyms in DB: ${gyms.length}`);
  const matches = gyms.filter(g => g.name.toLowerCase().includes('point') || g.name.toLowerCase().includes('tenis') || g.name.toLowerCase().includes('saturno'));
  console.log(`Found ${matches.length} matching gyms:`);
  for (const m of matches) {
    console.log(`- "${m.name}" (ID: ${m.id})`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
