import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.update({
    where: { email: 'atleta1@correo.com' },
    data: {
      phone: null,
      dni: null,
    }
  });
  console.log('Reset complete for atleta1@correo.com:', user.email, 'dni:', user.dni, 'phone:', user.phone);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
