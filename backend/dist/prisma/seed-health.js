"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const ACTIVITIES_SEED = [
    { name: 'CrossFit', metValue: 9.0, intensity: 'ALTA', defaultDuration: 60 },
    { name: 'Running', metValue: 8.0, intensity: 'ALTA', defaultDuration: 45 },
    { name: 'Pesas / Musculación', metValue: 6.0, intensity: 'MEDIA', defaultDuration: 60 },
    { name: 'Natación', metValue: 8.0, intensity: 'ALTA', defaultDuration: 60 },
    { name: 'Yoga / Pilates', metValue: 3.0, intensity: 'BAJA', defaultDuration: 60 },
    { name: 'Fútbol', metValue: 7.0, intensity: 'MEDIA', defaultDuration: 90 },
    { name: 'Spinning / Ciclismo', metValue: 7.5, intensity: 'MEDIA', defaultDuration: 45 },
    { name: 'Boxeo / HIIT', metValue: 9.0, intensity: 'ALTA', defaultDuration: 60 },
    { name: 'Zumba / Baile', metValue: 5.0, intensity: 'MEDIA', defaultDuration: 60 },
];
async function main() {
    console.log('🌱 Iniciando Seeding de Hercix Health...');
    for (const act of ACTIVITIES_SEED) {
        await prisma.activityMET.upsert({
            where: { name: act.name },
            update: {
                metValue: act.metValue,
                intensity: act.intensity,
                defaultDuration: act.defaultDuration,
            },
            create: act,
        });
    }
    console.log(`✅ Seeding de ${ACTIVITIES_SEED.length} Actividades MET completado.`);
    const users = await prisma.user.findMany({
        select: { id: true, name: true, email: true }
    });
    for (const u of users) {
        await prisma.userGoal.upsert({
            where: { userId: u.id },
            update: {},
            create: {
                userId: u.id,
                targetCalories: 600,
                targetSteps: 10000,
                targetWater: 8,
                targetWeight: 72.5,
            }
        });
    }
    console.log(`✅ Seeding de Metas por defecto completado para ${users.length} usuarios.`);
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=seed-health.js.map