"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const events = await prisma.event.findMany({
        include: { organizer: true }
    });
    console.log('--- EVENTS IN DATABASE ---');
    console.log(JSON.stringify(events, null, 2));
}
main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
//# sourceMappingURL=debug-events.js.map