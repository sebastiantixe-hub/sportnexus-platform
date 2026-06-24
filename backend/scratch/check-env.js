require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  const gymsCount = await prisma.gym.count();
  console.log('Gyms count:', gymsCount);
}

main().catch(console.error).finally(() => prisma.$disconnect());
