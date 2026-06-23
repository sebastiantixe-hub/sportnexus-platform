import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const email = 'mateo.rios.coach1@hercix-demo.com';
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      trainerProfile: {
        include: {
          gymTrainers: {
            include: {
              gym: true
            }
          },
          classes: {
            include: {
              gym: true
            }
          }
        }
      }
    }
  });

  console.log('User info:', JSON.stringify(user, null, 2));

  // Let's also see if there are any gymTrainers at all in the database
  const gymTrainers = await prisma.gymTrainer.findMany({
    include: {
      gym: true,
      trainer: {
        include: {
          user: true
        }
      }
    }
  });
  console.log('Total Gym Trainers in DB:', gymTrainers.length);
  gymTrainers.forEach(gt => {
    console.log(`- Gym: ${gt.gym.name}, Trainer User: ${gt.trainer.user.email}`);
  });

  // Let's see if there are any classes assigned to this trainer's user ID
  const classes = await prisma.class.findMany({
    where: { trainerId: user?.trainerProfile?.id },
    include: { gym: true }
  });
  console.log('Classes assigned to this trainerProfile:', classes.length);
}

main().catch(console.error).finally(() => prisma.$disconnect());
