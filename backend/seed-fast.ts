import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando carga de datos...');

  // 1. Create a fake gym owner
  const owner = await prisma.user.create({
    data: {
      email: `gym_owner_${Date.now()}@sportnexus.com`,
      passwordHash: 'dummy_hash',
      name: 'CEO Gym Titan',
      role: 'GYM_OWNER',
    }
  });

  // 2. Create the Gym
  const gym = await prisma.gym.create({
    data: {
      ownerId: owner.id,
      name: 'Titan Fitness Black',
      description: 'El gimnasio más moderno de todo el sector.',
      address: 'Zona Corporativa 450',
    }
  });

  // 3. Create 3 standard plans
  await prisma.membershipPlan.createMany({
    data: [
      {
        gymId: gym.id,
        name: 'Básico (Iniciante)',
        description: 'Acceso a máquinas y peso libre. Horario valle. Ideal para dar tus primeros pasos en el fitness.',
        price: 39.99,
        durationDays: 30,
        maxClasses: 0,
        includesMarketplace: false,
      },
      {
        gymId: gym.id,
        name: 'Estándar',
        description: 'Libertad absoluta. Entrena 24/7 y disfruta de algunas de nuestras clases estrella.',
        price: 59.99,
        durationDays: 30,
        maxClasses: 8,
        includesMarketplace: true,
      },
      {
        gymId: gym.id,
        name: 'Premium Élite',
        description: 'La experiencia definitiva. Acceso VIP ilimitado, rutinas personalizadas, zona wellness y spa.',
        price: 119.99,
        durationDays: 30,
        maxClasses: 999,
        includesMarketplace: true,
      }
    ]
  });

  console.log('¡Las Membresías Premium fueron inyectadas con éxito en la Base de Datos!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
