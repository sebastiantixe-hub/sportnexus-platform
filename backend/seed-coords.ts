import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const gyms = await prisma.gym.findMany();
  
  console.log(`Updating ${gyms.length} gyms with coordinates in Lima...`);

  for (const gym of gyms) {
    // Generate random coords around Lima center [-12.0464, -77.0428]
    const lat = -12.0464 + (Math.random() - 0.5) * 0.1;
    const lng = -77.0428 + (Math.random() - 0.5) * 0.1;

    await prisma.gym.update({
      where: { id: gym.id },
      data: { latitude: lat, longitude: lng }
    });
  }

  console.log('All gyms updated with coordinates.');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
