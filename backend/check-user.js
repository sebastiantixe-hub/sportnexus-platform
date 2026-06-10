const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const requests = await prisma.roleRequest.findMany({
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true }
      }
    }
  });
  console.log('ALL ROLE REQUESTS:', requests);
  process.exit(0);
}

check().catch(err => {
  console.error(err);
  process.exit(1);
});
