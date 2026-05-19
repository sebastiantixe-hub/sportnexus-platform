"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            name: true,
            role: true
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: 20
    });
    console.log('📋 ÚLTIMOS 20 USUARIOS REGISTRADOS EN LA BD:');
    users.forEach((u, i) => {
        console.log(`${i + 1}. Nombre: ${u.name} | Email: ${u.email} | Rol: ${u.role}`);
    });
}
main().finally(() => prisma.$disconnect());
//# sourceMappingURL=list-users.js.map