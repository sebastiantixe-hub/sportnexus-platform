"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const gyms = await prisma.gym.findMany();
    console.log(`Updating ${gyms.length} gyms with coordinates in Lima...`);
    for (const gym of gyms) {
        const lat = -12.0464 + (Math.random() - 0.5) * 0.1;
        const lng = -77.0428 + (Math.random() - 0.5) * 0.1;
        await prisma.gym.update({
            where: { id: gym.id },
            data: { latitude: lat, longitude: lng }
        });
    }
    console.log('All gyms updated with coordinates.');
}
main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
//# sourceMappingURL=seed-coords.js.map