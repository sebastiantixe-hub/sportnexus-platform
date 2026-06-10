const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const result = await p.membershipPlan.findMany({
    where: {
      isActive: true,
    },
    include: {
      gym: { select: { name: true } },
    },
  });
  console.log("findAllPlans result:", result);
}

main().catch(console.error).finally(() => p.$disconnect());
