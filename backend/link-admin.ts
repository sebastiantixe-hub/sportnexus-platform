import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  // 1. Borrar usuarios fantasma creados por error
  const deleted = await prisma.user.deleteMany({
    where: { 
      OR: [
        { email: { contains: '@auth0.user' } },
        { auth0Id: 'auth0|6a0750f98835db81decb9816' }
      ]
    }
  });
  console.log(`Borrados ${deleted.count} usuarios fantasma.`);

  // 2. Vincular el Admin real
  await prisma.user.update({
    where: { email: 'admin@sportnexus.com' },
    data: { auth0Id: 'auth0|6a0750f98835db81decb9816' }
  });
  console.log('ADMIN VINCULADO CON EXITO A AUTH0 ID: auth0|6a0750f98835db81decb9816');
}
main().catch(console.error).finally(() => prisma.$disconnect());
