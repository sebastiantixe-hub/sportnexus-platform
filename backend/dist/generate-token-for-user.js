"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const jwt_1 = require("@nestjs/jwt");
const prisma = new client_1.PrismaClient();
const jwtService = new jwt_1.JwtService({
    secret: 'sports_saas_super_secret_jwt_key_change_in_production_000000',
});
async function main() {
    const user = await prisma.user.findUnique({
        where: { email: 'st@gmail.com' },
    });
    if (!user) {
        console.error('User st@gmail.com not found');
        return;
    }
    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = await jwtService.signAsync(payload, { expiresIn: '7d' });
    console.log('\n--- TOKEN FOR MATEO LUIS (GYM_OWNER) ---');
    console.log(token);
}
main().finally(() => prisma.$disconnect());
//# sourceMappingURL=generate-token-for-user.js.map