require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    orderBy: { email: 'asc' }
  });

  console.log(`Total users: ${users.length}`);
  for (const u of users) {
    console.log(`- ${u.email} (${u.role}) ID: ${u.id}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
