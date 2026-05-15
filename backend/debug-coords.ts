import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const gyms = await prisma.gym.findMany({
    select: { id: true, name: true, latitude: true, longitude: true }
  });
  
  console.log('--- GYMS COORDINATES ---');
  console.log(JSON.stringify(gyms, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
