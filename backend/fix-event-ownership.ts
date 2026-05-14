import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const owner = await prisma.user.findFirst({
    where: { role: 'GYM_OWNER', email: 'd1@sportnexus.com' }
  });

  if (!owner) {
    console.error('Owner d1@sportnexus.com not found');
    return;
  }

  const result = await prisma.event.updateMany({
    data: {
      organizerId: owner.id,
      isActive: true
    }
  });

  console.log(`Updated ${result.count} events to be owned by ${owner.email}`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
