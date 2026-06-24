require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const gyms = await prisma.gym.findMany();
  console.log(`--- GYMS (${gyms.length}) ---`);
  gyms.forEach(g => {
    console.log(`[Gym] ID: ${g.id} | Name: "${g.name}" | OwnerID: ${g.ownerId}`);
  });

  const classes = await prisma.class.findMany({
    include: {
      gym: true,
      trainer: { include: { user: true } }
    }
  });
  console.log(`--- CLASSES (${classes.length}) ---`);
  const activeClasses = classes.filter(c => c.isActive);
  console.log(`Active classes: ${activeClasses.length}`);
  // print first 5 classes
  activeClasses.slice(0, 10).forEach(c => {
    console.log(`[Class] ID: ${c.id} | Title: "${c.title}" | Gym: "${c.gym?.name}" | Trainer: "${c.trainer?.user?.name || 'NONE'}"`);
  });

  const gymTrainers = await prisma.gymTrainer.findMany({
    include: {
      gym: true,
      trainer: { include: { user: true } }
    }
  });
  console.log(`--- GYM TRAINERS (${gymTrainers.length}) ---`);
  gymTrainers.forEach(gt => {
    console.log(`[GymTrainer] Gym: "${gt.gym?.name}" | Trainer: "${gt.trainer?.user?.name}"`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
