"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const firstUser = await prisma.user.findFirst();
    if (firstUser) {
        await prisma.user.update({
            where: { id: firstUser.id },
            data: { role: client_1.UserRole.ADMIN }
        });
        console.log(`¡Éxito! La cuenta principal (${firstUser.email || firstUser.id}) ahora es SUPER ADMIN.`);
    }
    else {
        console.log('Error: Aún no hay usuarios registrados en la base de datos.');
    }
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=create-admin.js.map