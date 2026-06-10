const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const email = 'atleta001@testgym.pe';
  
  // 1. Buscamos o creamos el usuario
  let user = await prisma.user.findUnique({
    where: { email }
  });
  
  if (!user) {
    console.log(`Usuario ${email} no encontrado en la base de datos local. Creándolo...`);
    user = await prisma.user.create({
      data: {
        email: email,
        name: 'Atleta Test Gym',
        role: 'USER',
        phone: '987654321',
        dni: '12345678',
        isActive: true,
        emailVerified: true,
      }
    });
  } else {
    console.log(`Usuario ${email} encontrado (ID: ${user.id}).`);
  }
  
  // 2. Aseguramos que tenga solicitudes de rol aprobadas para GYM_OWNER y TRAINER
  const rolesToApprove = ['GYM_OWNER', 'TRAINER'];
  
  for (const role of rolesToApprove) {
    const existingRequest = await prisma.roleRequest.findFirst({
      where: {
        userId: user.id,
        requestedRole: role,
      }
    });
    
    if (existingRequest) {
      if (existingRequest.status !== 'APPROVED') {
        await prisma.roleRequest.update({
          where: { id: existingRequest.id },
          data: { status: 'APPROVED', adminNote: 'Aprobado automáticamente por script de desarrollo' }
        });
        console.log(`Solicitud de rol existente para ${role} actualizada a APPROVED.`);
      } else {
        console.log(`Solicitud de rol para ${role} ya estaba APPROVED.`);
      }
    } else {
      await prisma.roleRequest.create({
        data: {
          userId: user.id,
          requestedRole: role,
          status: 'APPROVED',
          reason: 'Pruebas de desarrollo local',
          adminNote: 'Aprobado automáticamente por script de desarrollo'
        }
      });
      console.log(`Nueva solicitud de rol aprobada para ${role} creada.`);
    }
  }
  
  console.log('¡Seeding completado con éxito!');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
