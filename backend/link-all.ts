import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  // 1. Limpieza de fantasmas
  await prisma.user.deleteMany({
    where: { email: { contains: '@auth0.user' } }
  });
  console.log('Fantasmas eliminados.');

  // 2. Vinculación masiva
  const mappings = [
    { email: 'd1@sportnexus.com', auth0Id: 'auth0|6a075fc45d4bc8903a9d3ebd' },
    { email: 'atleta1@correo.com', auth0Id: 'auth0|6a075fec8835db81decba79c' },
    { email: 'entrenador@sportnexus.com', auth0Id: 'auth0|6a0760125a7089ef502ff9b7' }
  ];

  for (const m of mappings) {
    await prisma.user.update({
      where: { email: m.email },
      data: { auth0Id: m.auth0Id }
    });
    console.log(`Vinculado ${m.email} con éxito.`);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
