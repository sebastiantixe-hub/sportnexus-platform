"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const deleted = await prisma.user.deleteMany({
        where: {
            OR: [
                { email: { contains: '@auth0.user' } },
                { auth0Id: 'auth0|6a0750f98835db81decb9816' }
            ]
        }
    });
    console.log(`Borrados ${deleted.count} usuarios fantasma.`);
    await prisma.user.update({
        where: { email: 'admin@sportnexus.com' },
        data: { auth0Id: 'auth0|6a0750f98835db81decb9816' }
    });
    console.log('ADMIN VINCULADO CON EXITO A AUTH0 ID: auth0|6a0750f98835db81decb9816');
}
main().catch(console.error).finally(() => prisma.$disconnect());
//# sourceMappingURL=link-admin.js.map