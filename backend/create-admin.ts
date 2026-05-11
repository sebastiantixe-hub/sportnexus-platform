import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Buscar el primer usuario que exista en la base de datos
  const firstUser = await prisma.user.findFirst();
  
  if (firstUser) {
    await prisma.user.update({ 
      where: { id: firstUser.id }, 
      data: { role: UserRole.ADMIN } 
    });
    console.log(`¡Éxito! La cuenta principal (${firstUser.email || firstUser.id}) ahora es SUPER ADMIN.`);
  } else {
    console.log('Error: Aún no hay usuarios registrados en la base de datos.');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
