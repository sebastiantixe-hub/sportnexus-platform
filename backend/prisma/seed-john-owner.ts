import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando script de elevación a Dueño Multi-Perfil...');

  // Buscar el usuario de la sesión actual
  // Buscamos primero por email 'john.smith@gmail.com' (del rol del extranjero)
  // O en su defecto 'usuario@hercix.com' (si usaron el usuario por defecto)
  let emailToPromote = 'john.smith@gmail.com';
  
  let targetUser = await prisma.user.findFirst({
    where: {
      email: {
        contains: 'john',
        mode: 'insensitive'
      }
    }
  });

  if (!targetUser) {
    // Buscar cualquier otro usuario recién creado o alternativo
    targetUser = await prisma.user.findFirst({
      where: {
        email: {
          contains: 'usuario',
          mode: 'insensitive'
        }
      }
    });
  }

  if (!targetUser) {
    // Si no se encuentra, buscar el primer usuario en la BD que no sea ADMIN
    targetUser = await prisma.user.findFirst({
      where: {
        role: { not: 'ADMIN' }
      }
    });
  }

  if (!targetUser) {
    console.log('❌ No se encontró ningún usuario para promover.');
    return;
  }

  emailToPromote = targetUser.email;
  console.log(`👤 Usuario encontrado para promover: ${targetUser.name} (${emailToPromote})`);

  // 1. Cambiar su rol en la base de datos a GYM_OWNER
  // Al cambiarlo a GYM_OWNER, el backend dinámicamente le dará acceso a:
  // - USER (Atleta)
  // - GYM_OWNER (Dueño)
  await prisma.user.update({
    where: { id: targetUser.id },
    data: { role: UserRole.GYM_OWNER }
  });
  console.log('✅ Rol de base de datos cambiado a GYM_OWNER.');

  // 2. Crearle un gimnasio hermoso para que lo gestione en su Owner Dashboard
  const gymExists = await prisma.gym.findFirst({
    where: { ownerId: targetUser.id }
  });

  if (!gymExists) {
    console.log('🏋️‍♂️ Creando gimnasio de demostración para el usuario...');
    const gym = await prisma.gym.create({
      data: {
        name: `Hercix International Club - ${targetUser.name}`,
        description: 'Las mejores instalaciones de entrenamiento funcional y rendimiento deportivo del continente.',
        address: 'Calle de los Atletas 123, Sector Premium',
        city: 'Lima',
        district: 'Miraflores',
        province: 'Lima',
        country: 'Perú',
        phone: targetUser.phone || '+34 612 345 678',
        email: emailToPromote,
        logoUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=300&auto=format&fit=crop',
        website: 'https://hercix.com',
        openTime: '05:00 AM',
        closeTime: '11:00 PM',
        openDays: 'Lunes a Domingo',
        ownerId: targetUser.id
      }
    });
    console.log(`✅ Gimnasio "${gym.name}" creado con éxito.`);
  } else {
    console.log('ℹ️ El usuario ya poseía un gimnasio registrado.');
  }

  console.log('🎉 PROCESO COMPLETADO. ¡El usuario ya es un usuario Multi-Perfil de verdad! 🎉');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
