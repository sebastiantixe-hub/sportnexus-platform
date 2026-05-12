import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🏥 Seeding professional services...');

  // Use existing TRAINER or ADMIN users as providers
  const providers = await prisma.user.findMany({
    where: { role: { in: ['TRAINER', 'ADMIN'] } },
    take: 5,
  });

  if (providers.length === 0) {
    console.error('No trainers/admin found. Run main seed first.');
    return;
  }

  const getProvider = (i: number) => providers[i % providers.length];

  const services = [
    // Fisioterapia x10
    { title: 'Fisioterapia Deportiva - Evaluación Inicial', serviceType: 'PHYSIOTHERAPY', price: 80, durationMin: 60, description: 'Evaluación completa del sistema musculoesquelético. Diagnóstico y plan de rehabilitación personalizado.' },
    { title: 'Fisioterapia - Rehabilitación de Rodilla', serviceType: 'PHYSIOTHERAPY', price: 65, durationMin: 45, description: 'Tratamiento especializado en lesiones de ligamentos cruzados, menisco y rótula.' },
    { title: 'Fisioterapia - Espalda y Columna', serviceType: 'PHYSIOTHERAPY', price: 70, durationMin: 50, description: 'Corrección postural y tratamiento de hernias discales, contracturas y lumbalgia.' },
    { title: 'Electroterapia y Ultrasonido', serviceType: 'PHYSIOTHERAPY', price: 45, durationMin: 30, description: 'Aplicación de corrientes TENS y ultrasonido para reducir inflamación y dolor muscular.' },
    { title: 'Masaje Deportivo Descontracturante', serviceType: 'PHYSIOTHERAPY', price: 55, durationMin: 60, description: 'Masaje profundo para liberar tensiones musculares post-competencia o entrenamiento intenso.' },
    { title: 'Kinesiotaping y Vendaje Funcional', serviceType: 'PHYSIOTHERAPY', price: 35, durationMin: 30, description: 'Aplicación de cintas neuromusculares para estabilización articular y prevención de lesiones.' },
    { title: 'Fisioterapia - Hombro y Manguito Rotador', serviceType: 'PHYSIOTHERAPY', price: 70, durationMin: 50, description: 'Tratamiento de tendinitis, bursitis y roturas parciales del manguito rotador.' },
    { title: 'Rehabilitación Post-Operatoria', serviceType: 'PHYSIOTHERAPY', price: 90, durationMin: 60, description: 'Protocolo de recuperación tras cirugías ortopédicas. Sesiones progresivas y personalizadas.' },
    { title: 'Fisioterapia Preventiva - Atletas de Alto Rendimiento', serviceType: 'PHYSIOTHERAPY', price: 75, durationMin: 60, description: 'Sesión de screening funcional para detectar y prevenir lesiones antes de la temporada.' },
    { title: 'Terapia Manual y Movilización Articular', serviceType: 'PHYSIOTHERAPY', price: 60, durationMin: 45, description: 'Técnicas osteopáticas y de movilización para recuperar rangos de movimiento articular.' },

    // Nutrición x10
    { title: 'Consulta Nutrición Deportiva - Primera Vez', serviceType: 'NUTRITION_PLAN', price: 60, durationMin: 60, description: 'Evaluación nutricional completa. Antropometría, análisis de hábitos y plan alimenticio personalizado.' },
    { title: 'Plan Nutricional para Ganar Masa Muscular', serviceType: 'NUTRITION_PLAN', price: 75, durationMin: 45, description: 'Dieta hipercalórica estructurada con macros calculados para maximizar hipertrofia.' },
    { title: 'Plan Nutricional para Pérdida de Grasa', serviceType: 'NUTRITION_PLAN', price: 75, durationMin: 45, description: 'Protocolo de déficit calórico controlado manteniendo músculo. Incluye plan de suplementación.' },
    { title: 'Nutrición para Deportes de Resistencia', serviceType: 'NUTRITION_PLAN', price: 70, durationMin: 50, description: 'Plan para maratonistas, ciclistas y triatletas. Estrategia de carbohidratos y electrolitos.' },
    { title: 'Seguimiento Nutricional Mensual', serviceType: 'NUTRITION_PLAN', price: 40, durationMin: 30, description: 'Consulta de control con ajuste de plan según evolución. Medición de composición corporal.' },
    { title: 'Plan Nutricional Vegetariano/Vegano', serviceType: 'NUTRITION_PLAN', price: 65, durationMin: 45, description: 'Optimización de proteínas y micronutrientes clave para deportistas con dieta plant-based.' },
    { title: 'Nutrición Clínica - Diabetes y Deporte', serviceType: 'NUTRITION_PLAN', price: 80, durationMin: 60, description: 'Plan adaptado para diabéticos tipo 1 y 2 que practican deportes. Control glucémico.' },
    { title: 'Suplementación Deportiva Guiada', serviceType: 'NUTRITION_PLAN', price: 45, durationMin: 30, description: 'Asesoría sobre proteínas, creatina, BCAA y otros suplementos. Sin publicidad de marcas.' },
    { title: 'Preparación Nutricional Pre-Competencia', serviceType: 'NUTRITION_PLAN', price: 70, durationMin: 45, description: 'Estrategia de carga de carbohidratos, hidratación y timing nutricional para el día de competencia.' },
    { title: 'Plan Nutricional Familiar Activo', serviceType: 'NUTRITION_PLAN', price: 85, durationMin: 60, description: 'Plan alimenticio para familias activas. Incluye niños deportistas y adultos mayores.' },

    // Personal Trainer x10
    { title: 'Personal Training - Evaluación y Plan', serviceType: 'PERSONAL_TRAINING', price: 55, durationMin: 60, description: 'Evaluación de condición física, prueba de fuerza y flexibilidad. Diseño de programa mensual.' },
    { title: 'Entrenamiento Funcional 1 a 1', serviceType: 'PERSONAL_TRAINING', price: 45, durationMin: 60, description: 'Sesión de entrenamiento con peso corporal y accesorios. Mejora de movilidad y fuerza.' },
    { title: 'Entrenamiento de Fuerza y Hipertrofia', serviceType: 'PERSONAL_TRAINING', price: 50, durationMin: 60, description: 'Programa de pesas con periodización. Técnica correcta en todos los movimientos.' },
    { title: 'HIIT y Cardio Personalizado', serviceType: 'PERSONAL_TRAINING', price: 40, durationMin: 45, description: 'Intervalos de alta intensidad adaptados a tu nivel. Máxima quema de grasa en menos tiempo.' },
    { title: 'Entrenamiento para Adultos Mayores', serviceType: 'PERSONAL_TRAINING', price: 45, durationMin: 45, description: 'Ejercicios de equilibrio, movilidad y fuerza para mejorar calidad de vida. Ritmo pausado.' },
    { title: 'Preparación Física para Fútbol', serviceType: 'PERSONAL_TRAINING', price: 55, durationMin: 60, description: 'Velocidad, agilidad, resistencia y fuerza específicas para futbolistas de todos los niveles.' },
    { title: 'CrossFit y Entrenamiento Funcional', serviceType: 'PERSONAL_TRAINING', price: 50, durationMin: 60, description: 'WODs personalizados con énfasis en técnica. Para principiantes hasta nivel competitivo.' },
    { title: 'Yoga y Flexibilidad', serviceType: 'PERSONAL_TRAINING', price: 40, durationMin: 60, description: 'Sesión privada de yoga adaptado. Mejora de flexibilidad, respiración y bienestar mental.' },
    { title: 'Boxeo y Defensa Personal', serviceType: 'PERSONAL_TRAINING', price: 55, durationMin: 60, description: 'Técnica de golpeo, pasos y combinaciones. Incluye trabajo de saco y mitones.' },
    { title: 'Entrenamiento Online / Remoto', serviceType: 'PERSONAL_TRAINING', price: 30, durationMin: 45, description: 'Sesión virtual vía Zoom. Plan enviado con video-demostraciones. Soporte durante la semana.' },
  ];

  let created = 0;
  for (let i = 0; i < services.length; i++) {
    const s = services[i];
    await prisma.professionalService.create({
      data: {
        providerId: getProvider(i).id,
        title: s.title,
        serviceType: s.serviceType as any,
        price: s.price,
        durationMin: s.durationMin,
        description: s.description,
        isActive: true,
      },
    });
    created++;
    console.log(`  ✅ ${s.title}`);
  }

  console.log(`\n✅ ${created} servicios profesionales creados!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
