import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const emailArg = process.argv.find(arg => arg.startsWith('--email='));
  if (!emailArg) {
    console.error('❌ Error: Por favor especifica el correo usando --email=tu-correo@ejemplo.com');
    process.exit(1);
  }

  const email = emailArg.split('=')[1].toLowerCase().trim();

  // Find or create the user as ADMIN
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: { role: UserRole.ADMIN }
    });
    console.log(`\n✅ ¡Usuario existente promocionado con éxito!`);
    console.log(`📧 Correo: ${email}`);
    console.log(`🛡️ Rol actual: ADMIN`);
  } else {
    // Pre-seed user as ADMIN in Postgres
    await prisma.user.create({
      data: {
        email,
        name: 'Super Admin Pre-sembrado',
        role: UserRole.ADMIN,
        emailVerified: true
      }
    });
    console.log(`\n✅ ¡Super Admin pre-sembrado con éxito en la base de datos!`);
    console.log(`📧 Correo: ${email}`);
    console.log(`💡 Siguiente paso: Inicia sesión en Hercix Health usando Google o Auth0 con este mismo correo (${email}) y entrarás directamente como SUPER ADMIN.`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Error ejecutando el script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
