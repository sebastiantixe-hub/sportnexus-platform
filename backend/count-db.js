const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const gyms = await p.gym.count();
  const users = await p.user.count();
  const owners = await p.user.count({ where: { role: 'GYM_OWNER' } });
  const trainers = await p.user.count({ where: { role: 'TRAINER' } });
  const athletes = await p.user.count({ where: { role: 'USER' } });
  const admins = await p.user.count({ where: { role: 'ADMIN' } });
  const classes = await p.class.count();

  console.log(`
=== DB COUNTS ===
Gyms:     ${gyms}
Classes:  ${classes}
Total users: ${users}
  - Admins:   ${admins}
  - Owners:   ${owners}
  - Trainers: ${trainers}
  - Athletes: ${athletes}
`);
}

main().catch(console.error).finally(() => p.$disconnect());
