"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Listing all database users...');
    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            auth0Id: true
        }
    });
    console.table(users);
}
main().finally(() => prisma.$disconnect());
//# sourceMappingURL=list-users.js.map