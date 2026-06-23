const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Find Luis's gym
  const gym = await prisma.gym.findFirst({
    where: { name: { contains: 'EliteFit' } }
  });
  console.log('Gym:', gym?.name, 'ID:', gym?.id);
  if (!gym) return;

  // Let's ensure a MembershipPlan exists for this gym
  let plan = await prisma.membershipPlan.findFirst({
    where: { gymId: gym.id }
  });

  if (!plan) {
    plan = await prisma.membershipPlan.create({
      data: {
        gymId: gym.id,
        name: 'Plan Mensual Premium',
        price: 99.90,
        durationDays: 30,
        isActive: true,
      }
    });
    console.log('Created MembershipPlan:', plan.name);
  } else {
    console.log('Found existing MembershipPlan:', plan.name);
  }

  // Find the athletes
  const athletes = await prisma.user.findMany({
    where: { role: 'USER' }
  });
  console.log(`Found ${athletes.length} athletes.`);

  for (const athlete of athletes) {
    const existing = await prisma.userMembership.findFirst({
      where: { planId: plan.id, userId: athlete.id }
    });

    if (!existing) {
      await prisma.userMembership.create({
        data: {
          userId: athlete.id,
          planId: plan.id,
          status: 'ACTIVE',
          startedAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      });
      console.log(`Linked athlete ${athlete.name} to active membership.`);
    } else if (existing.status !== 'ACTIVE') {
      await prisma.userMembership.update({
        where: { id: existing.id },
        data: { status: 'ACTIVE' }
      });
      console.log(`Activated membership for athlete ${athlete.name}.`);
    } else {
      console.log(`Athlete ${athlete.name} already has active membership.`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
