"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const user = await prisma.user.findFirst({
        where: { email: 'atleta1@correo.com' }
    });
    if (!user) {
        console.log('❌ No se encontró atleta1@correo.com');
        return;
    }
    console.log('👤 DATOS DEL USUARIO EN LA BD:');
    console.log(JSON.stringify(user, null, 2));
    const roles = ['USER'];
    if (user.role === 'ADMIN') {
        roles.push('ADMIN');
    }
    const gymCount = await prisma.gym.count({ where: { ownerId: user.id } });
    if (gymCount > 0 || user.role === 'GYM_OWNER') {
        roles.push('GYM_OWNER');
    }
    const trainerProfile = await prisma.trainerProfile.findUnique({ where: { userId: user.id } });
    if (trainerProfile || user.role === 'TRAINER') {
        roles.push('TRAINER');
    }
    console.log('📋 ROLES CALCULADOS POR EL BACKEND (roles):');
    console.log(roles);
}
main().finally(() => prisma.$disconnect());
//# sourceMappingURL=test-roles.js.map