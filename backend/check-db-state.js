const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const counts = await p.user.groupBy({
    by: ['role'],
    _count: { role: true }
  });
  
  console.log('\n=== USUARIOS EN LA BASE DE DATOS ===');
  counts.forEach(c => console.log(`  ${c.role}: ${c._count.role} usuarios`));
  
  const totalGyms = await p.gym.count();
  const totalClasses = await p.class.count();
  console.log(`\n  Gimnasios: ${totalGyms}`);
  console.log(`  Clases: ${totalClasses}`);
  
  // Verificar si la DB es la de Mario o la propia
  const adminUsers = await p.user.findMany({ where: { role: 'ADMIN' }, select: { email: true, name: true } });
  console.log('\n=== ADMINISTRADORES ===');
  adminUsers.forEach(a => console.log(`  ${a.name} — ${a.email}`));
}

main().finally(() => p.$disconnect());
