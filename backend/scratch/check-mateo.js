const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: 'mateo.rios.coach1@hercix-demo.com' },
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

  console.log('User:', user?.name);
  console.log('TrainerProfile ID:', user?.trainerProfile?.id);
  const gyms = user?.trainerProfile?.gymTrainers || [];
  console.log(`Linked gyms count: ${gyms.length}`);
  for (const gt of gyms) {
    console.log(`- Gym Name: "${gt.gym.name}" (ID: ${gt.gym.id})`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
