import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const metrics = await prisma.wearableMetric.findMany({
    orderBy: { date: 'desc' },
    include: { user: true }
  });
  console.log('All WearableMetrics in DB:');
  for (const m of metrics) {
    console.log(`User: ${m.user?.email || 'N/A'} | Date: ${m.date} | Steps: ${m.steps} | Cals: ${m.calories} | HR: ${m.heartRateAvg}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
