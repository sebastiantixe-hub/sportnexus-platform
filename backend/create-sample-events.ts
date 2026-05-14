import { PrismaClient, EventType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const owner = await prisma.user.findFirst({
    where: { role: 'GYM_OWNER' }
  });

  if (!owner) {
    console.error('No owner found');
    return;
  }

  const events = [
    {
      title: 'Campeonato Nacional de Levantamiento de Pesas',
      description: 'Competencia oficial de levantamiento olímpico. Snatch y Clean & Jerk.',
      date: new Date('2026-06-25T10:00:00Z'),
      location: 'Coliseo Dibós, San Borja',
      price: 60.00,
      capacity: 150,
      eventType: EventType.WEIGHTLIFTING,
      organizerId: owner.id,
      isActive: true
    },
    {
      title: 'WOD Hercix: Reto CrossFit 2026',
      description: 'Prueba tus límites en este WOD especial. ¡Comunidad y sudor!',
      date: new Date('2026-07-20T08:00:00Z'),
      location: 'Parque de la Exposición, Lima',
      price: 45.00,
      capacity: 250,
      eventType: EventType.CROSSFIT,
      organizerId: owner.id,
      isActive: true
    },
    {
      title: 'Seminario de Nutrición Deportiva',
      description: 'Aprende a alimentar tus músculos para el máximo rendimiento.',
      date: new Date('2026-08-10T11:00:00Z'),
      location: 'Online / Zoom',
      price: 30.00,
      capacity: 500,
      eventType: EventType.MASTERCLASS,
      organizerId: owner.id,
      isActive: true
    }
  ];

  for (const event of events) {
    await prisma.event.create({ data: event });
    console.log(`Created event: ${event.title}`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
