import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Restaurando Atleta 1 a su rol original de USER...');

  const athlete = await prisma.user.findFirst({
    where: { email: 'atleta1@correo.com' }
  });

  if (athlete) {
    await prisma.user.update({
      where: { id: athlete.id },
      data: { role: UserRole.USER }
    });
    console.log('✅ Atleta 1 (atleta1@correo.com) restaurado a USER con éxito.');
  } else {
    console.log('❌ No se encontró atleta1@correo.com');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
