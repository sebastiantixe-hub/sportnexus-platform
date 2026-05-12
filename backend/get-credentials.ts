import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('\n=== DUEÑOS (GYM_OWNER) ===');
  const owners = await prisma.user.findMany({ where: { role: 'GYM_OWNER' }, select: { name: true, email: true }, take: 10 });
  owners.forEach(o => console.log(`  ${o.name}  |  ${o.email}`));

  console.log('\n=== ATLETAS (USER) ===');
  const users = await prisma.user.findMany({ where: { role: 'USER' }, select: { name: true, email: true }, take: 5 });
  users.forEach(u => console.log(`  ${u.name}  |  ${u.email}`));

  console.log('\n=== ENTRENADORES (TRAINER) ===');
  const trainers = await prisma.user.findMany({ where: { role: 'TRAINER' }, select: { name: true, email: true }, take: 5 });
  trainers.forEach(t => console.log(`  ${t.name}  |  ${t.email}`));
}

main().finally(() => prisma.$disconnect());
