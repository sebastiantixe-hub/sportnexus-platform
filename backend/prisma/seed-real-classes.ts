import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Borrando clases con nombres falsos...');

  // Delete reservations first (FK constraint)
  await prisma.reservation.deleteMany({});
  console.log('   ✅ Reservas eliminadas');

  // Delete all classes
  await prisma.class.deleteMany({});
  console.log('   ✅ Clases falsas eliminadas');

  // Get gyms and trainers
  const gyms = await prisma.gym.findMany({ take: 30 });
  const trainers = await prisma.trainerProfile.findMany({ take: 10 });

  if (gyms.length === 0) {
    console.error('❌ No hay gimnasios. Ejecuta el seed principal primero.');
    return;
  }

  const getGym = (i: number) => gyms[i % gyms.length];
  const getTrainer = (i: number) => trainers.length > 0 ? trainers[i % trainers.length].id : undefined;

  const now = new Date();
  const days = (n: number) => new Date(now.getTime() + n * 24 * 60 * 60 * 1000);

  // Real sports classes
  const classes = [
    // Fútbol
    { title: 'Fútbol - Técnica Individual y Regate', sport: 'futbol', price: 25, capacity: 20, duration: 90, days: 1 },
    { title: 'Fútbol - Táctica y Posicionamiento', sport: 'futbol', price: 30, capacity: 18, duration: 90, days: 2 },
    { title: 'Fútbol - Porteros Especial', sport: 'futbol', price: 28, capacity: 8, duration: 60, days: 3 },
    { title: 'Fútbol - Físico y Resistencia', sport: 'futbol', price: 22, capacity: 22, duration: 75, days: 4 },
    { title: 'Fútbol Infantil (6-12 años)', sport: 'futbol', price: 20, capacity: 15, duration: 60, days: 5 },

    // Básquetbol
    { title: 'Básquetbol - Manejo de Balón y Dribling', sport: 'basketball', price: 25, capacity: 16, duration: 90, days: 1 },
    { title: 'Básquetbol - Tiro y Enceste', sport: 'basketball', price: 28, capacity: 14, duration: 75, days: 3 },
    { title: 'Básquetbol - Defensa Zonal y Hombre a Hombre', sport: 'basketball', price: 30, capacity: 16, duration: 90, days: 5 },
    { title: 'Básquetbol - Juego 3x3 Competitivo', sport: 'basketball', price: 20, capacity: 12, duration: 60, days: 6 },

    // Vóley
    { title: 'Vóley - Recepción y Colocación', sport: 'voley', price: 25, capacity: 18, duration: 90, days: 2 },
    { title: 'Vóley - Remate y Bloqueo', sport: 'voley', price: 28, capacity: 16, duration: 75, days: 4 },
    { title: 'Vóley - Técnica de Saque', sport: 'voley', price: 22, capacity: 18, duration: 60, days: 6 },
    { title: 'Vóley de Playa', sport: 'voley', price: 30, capacity: 12, duration: 90, days: 7 },

    // Natación
    { title: 'Natación - Estilo Libre para Principiantes', sport: 'natacion', price: 35, capacity: 10, duration: 60, days: 1 },
    { title: 'Natación - Pecho y Espalda', sport: 'natacion', price: 38, capacity: 10, duration: 60, days: 3 },
    { title: 'Natación - Mariposa Avanzado', sport: 'natacion', price: 45, capacity: 8, duration: 60, days: 5 },
    { title: 'Natación Infantil (4-8 años)', sport: 'natacion', price: 30, capacity: 8, duration: 45, days: 2 },

    // Box
    { title: 'Box - Técnica de Golpeo y Guardia', sport: 'box', price: 30, capacity: 12, duration: 60, days: 1 },
    { title: 'Box - Combinaciones y Sparring', sport: 'box', price: 35, capacity: 10, duration: 75, days: 3 },
    { title: 'Box - Cardio Boxing (sin contacto)', sport: 'box', price: 25, capacity: 20, duration: 60, days: 5 },
    { title: 'Muay Thai Básico', sport: 'box', price: 32, capacity: 12, duration: 75, days: 6 },

    // Atletismo
    { title: 'Atletismo - Velocidad y Arranque', sport: 'atletismo', price: 22, capacity: 15, duration: 75, days: 2 },
    { title: 'Atletismo - Resistencia y Fondo', sport: 'atletismo', price: 20, capacity: 20, duration: 90, days: 4 },
    { title: 'Salto de Longitud y Altura', sport: 'atletismo', price: 25, capacity: 12, duration: 60, days: 6 },

    // Gimnasio / Fitness
    { title: 'CrossFit - WOD Intensidad Alta', sport: 'gym', price: 28, capacity: 15, duration: 60, days: 1 },
    { title: 'Musculación - Tren Superior', sport: 'gym', price: 25, capacity: 12, duration: 60, days: 2 },
    { title: 'Musculación - Tren Inferior', sport: 'gym', price: 25, capacity: 12, duration: 60, days: 4 },
    { title: 'HIIT - Quema de Grasa', sport: 'gym', price: 22, capacity: 20, duration: 45, days: 3 },
    { title: 'Yoga Deportivo y Flexibilidad', sport: 'gym', price: 20, capacity: 18, duration: 60, days: 5 },
    { title: 'Spinning / Indoor Cycling', sport: 'gym', price: 22, capacity: 16, duration: 50, days: 6 },

    // Karate / Artes Marciales
    { title: 'Karate - Katas Básicas', sport: 'karate', price: 25, capacity: 14, duration: 60, days: 2 },
    { title: 'Karate - Kumite y Combate', sport: 'karate', price: 28, capacity: 12, duration: 75, days: 4 },
    { title: 'Judo Infantil (6-14 años)', sport: 'karate', price: 22, capacity: 10, duration: 60, days: 6 },
  ];

  let created = 0;
  for (let i = 0; i < classes.length; i++) {
    const c = classes[i];
    const gym = getGym(i);
    const scheduledAt = days(c.days);
    scheduledAt.setHours(7 + (i % 6) * 2, 0, 0, 0); // Hours: 7am, 9am, 11am, 1pm, 3pm, 5pm

    await prisma.class.create({
      data: {
        title: c.title,
        description: `Sesión de ${c.title}. Apta para todos los niveles. Trae ropa cómoda y agua.`,
        price: c.price,
        capacity: c.capacity,
        durationMin: c.duration,
        scheduledAt,
        gymId: gym.id,
        trainerId: getTrainer(i) ?? null,
        classType: 'IN_PERSON',
        isActive: true,
      },
    });
    console.log(`  ✅ ${c.title} → ${gym.name}`);
    created++;
  }

  console.log(`\n✅ ${created} clases deportivas reales creadas!`);
  console.log('🏆 Clases listas para la demo.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
