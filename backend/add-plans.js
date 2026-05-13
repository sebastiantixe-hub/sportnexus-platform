const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addPlans() {
  const gym = await prisma.gym.findFirst();
  if(!gym) return;
  await prisma.membershipPlan.createMany({
    data: [
      { name: 'Plan Básico', description: 'Acceso a la red. Máximo 4 clases al mes.', price: 15, durationDays: 30, maxClasses: 4, includesMarketplace: false, gymId: gym.id },
      { name: 'Estándar', description: '12 clases al mes y 5% de descuento en Tienda.', price: 30, durationDays: 30, maxClasses: 12, includesMarketplace: true, gymId: gym.id },
      { name: 'Premium Élite', description: 'Clases ilimitadas, 15% dscto en Tienda y reportes de salud.', price: 50, durationDays: 30, maxClasses: 999, includesMarketplace: true, gymId: gym.id }
    ]
  });
  console.log('✅ 3 Planes de Membresías Globales creados');
}

addPlans().finally(() => prisma.$disconnect());
