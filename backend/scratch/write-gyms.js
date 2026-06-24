require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  const gyms = await prisma.gym.findMany();
  let content = `Total gyms: ${gyms.length}\n`;
  for (const g of gyms) {
    content += `- Name: "${g.name}" (ID: ${g.id}) ownerId: ${g.ownerId}\n`;
  }
  fs.writeFileSync('scratch/gyms.txt', content);
  console.log('Wrote gyms to scratch/gyms.txt');
}

main().catch(console.error).finally(() => prisma.$disconnect());
