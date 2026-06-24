require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: 'luis.rodriguez.owner2@hercix-demo.com' },
    include: {
      gyms: {
        include: {
          gymTrainers: {
            include: {
              trainer: {
                include: {
                  user: true
                }
              }
            }
          },
          classes: {
            include: {
              trainer: {
                include: {
                  user: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (!user) {
    console.log('Owner not found');
    return;
  }

  console.log('Owner Name:', user.name);
  console.log(`Owned gyms: ${user.gyms.length}`);
  for (const gym of user.gyms) {
    console.log(`- Gym Name: "${gym.name}" (ID: ${gym.id})`);
    console.log(`  Trainers:`);
    for (const gt of gym.gymTrainers) {
      console.log(`    * Trainer: "${gt.trainer.user.name}" (Can Create: ${gt.canCreateClasses})`);
    }
    console.log(`  Classes:`);
    for (const c of gym.classes) {
      console.log(`    * Class: "${c.title}" Trainer: "${c.trainer?.user?.name || 'NONE'}" (ID: ${c.id})`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
