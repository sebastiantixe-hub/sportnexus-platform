"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const p = new client_1.PrismaClient();
async function main() {
    const gyms = await p.gym.findMany();
    console.log('GYMS:', JSON.stringify(gyms, null, 2));
}
main().finally(() => p.$disconnect());
//# sourceMappingURL=check-gyms.js.map