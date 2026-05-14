import { PrismaClient, EventType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const owner = await prisma.user.findFirst({
    where: { email: 'd1@sportnexus.com' }
  });

  if (!owner) {
    console.error('Owner d1@sportnexus.com not found');
    return;
  }

  // Delete all
  await prisma.event.deleteMany({});
  console.log('Deleted all old events');

  const events = [
    {
      title: 'Torneo de Fútbol Hercix 2026',
      description: 'El torneo relámpago más grande de Lima. ¡Inscribe a tu equipo!',
      date: new Date('2026-06-15T09:00:00Z'),
      location: 'Sede 4 - Academia D1',
      price: 100.00,
      capacity: 16,
      eventType: EventType.TOURNAMENT,
      organizerId: owner.id,
      isActive: true
    },
    {
      title: 'Masterclass: Nutrición para Atletas',
      description: 'Aprende a optimizar tu rendimiento con la alimentación correcta.',
      date: new Date('2026-06-20T11:00:00Z'),
      location: 'Online / Zoom',
      price: 25.00,
      capacity: 100,
      eventType: EventType.MASTERCLASS,
      organizerId: owner.id,
      isActive: true
    },
    {
      title: 'Workshop: Técnica de Sentadilla',
      description: 'Taller intensivo para corregir y potenciar tu sentadilla.',
      date: new Date('2026-07-05T10:00:00Z'),
      location: 'Sede 6 - Miraflores',
      price: 40.00,
      capacity: 20,
      eventType: EventType.WORKSHOP,
      organizerId: owner.id,
      isActive: true
    },
    {
      title: 'Hercix CrossFit Challenge',
      description: 'Prueba tus límites en esta competencia de CrossFit abierta.',
      date: new Date('2026-07-15T08:30:00Z'),
      location: 'Playa Agua Dulce, Chorrillos',
      price: 50.00,
      capacity: 150,
      eventType: EventType.CROSSFIT,
      organizerId: owner.id,
      isActive: true
    },
    {
      title: 'Gran Prix de Levantamiento Olímpico',
      description: 'Competencia oficial de Snatch y Clean & Jerk.',
      date: new Date('2026-08-01T09:00:00Z'),
      location: 'Coliseo Dibós',
      price: 70.00,
      capacity: 80,
      eventType: EventType.WEIGHTLIFTING,
      organizerId: owner.id,
      isActive: true
    }
  ];

  for (const event of events) {
    await prisma.event.create({ data: event });
  }
  console.log('Created 5 fresh events for d1@sportnexus.com');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
