const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const gym = await prisma.gym.findFirst({
    where: { name: { contains: 'EliteFit' } }
  });
  console.log('Gym:', gym?.name, 'ID:', gym?.id);
  if (!gym) return;

  // Find the plan we created
  const plan = await prisma.membershipPlan.findFirst({
    where: { gymId: gym.id, name: 'Plan Mensual Premium' }
  });

  if (plan) {
    // Delete memberships first
    const deletedMemberships = await prisma.userMembership.deleteMany({
      where: { planId: plan.id }
    });
    console.log(`Deleted ${deletedMemberships.count} user memberships.`);

    // Delete membership plan
    await prisma.membershipPlan.delete({
      where: { id: plan.id }
    });
    console.log('Deleted MembershipPlan.');
  } else {
    console.log('No plan found to delete.');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
