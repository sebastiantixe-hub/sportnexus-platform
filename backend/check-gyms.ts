import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function main() {
  const gyms = await p.gym.findMany();
  console.log('GYMS:', JSON.stringify(gyms, null, 2));
}
main().finally(() => p.$disconnect());
