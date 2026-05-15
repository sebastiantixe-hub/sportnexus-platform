"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const users = await prisma.user.findMany({
        where: { role: 'GYM_OWNER' },
        select: { id: true, name: true, email: true }
    });
    console.log('--- USERS (OWNERS) ---');
    console.log(JSON.stringify(users, null, 2));
    const gyms = await prisma.gym.findMany({
        select: { id: true, name: true, ownerId: true }
    });
    console.log('\n--- GYMS ---');
    console.log(JSON.stringify(gyms, null, 2));
}
main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
//# sourceMappingURL=debug-gyms.js.map