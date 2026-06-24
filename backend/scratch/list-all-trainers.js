const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { role: 'TRAINER' },
    include: {
      trainerProfile: {
        include: {
          gymTrainers: {
            include: {
              gym: true
            }
          }
        }
      }
    }
  });

  console.log(`Found ${users.length} trainers:`);
  for (const u of users) {
    const gyms = u.trainerProfile?.gymTrainers || [];
    console.log(`- Trainer: "${u.name}" (${u.email})`);
    console.log(`  Linked Gyms: ${gyms.map(g => g.gym.name).join(', ') || 'NONE'}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
