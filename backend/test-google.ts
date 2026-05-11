import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'admin@sportnexus.com' } });
  if (!user) return console.log('User not found');

  const conn = await prisma.wearableConnection.findFirst({ where: { userId: user.id } });
  
  if (!conn) {
    console.log('No connection found');
    return;
  }

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const body = {
    aggregateBy: [
      { dataTypeName: 'com.google.step_count.delta' },
      { dataTypeName: 'com.google.calories.expended' }
    ],
    bucketByTime: { durationMillis: 86400000 },
    startTimeMillis: startOfDay.getTime() - 86400000, // Look at yesterday AND today just in case
    endTimeMillis: now.getTime() + 86400000
  };

  const response = await fetch('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${conn.accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
