"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const faker_1 = require("@faker-js/faker");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
const OWNER_CONFIGS = [
    { name: 'Academia de Fútbol', locations: 10, prefix: 'Fútbol' },
    { name: 'Academia de Fútbol', locations: 1, prefix: 'Fútbol' },
    { name: 'Gimnasio', locations: 1, prefix: 'Gym' },
    { name: 'Gimnasio', locations: 5, prefix: 'Gym' },
    { name: 'Gimnasio', locations: 20, prefix: 'Gym' },
    { name: 'Academia de Vóley', locations: 1, prefix: 'Vóley' },
    { name: 'Academia de Vóley', locations: 5, prefix: 'Vóley' },
    { name: 'Academia de Vóley', locations: 15, prefix: 'Vóley' },
    { name: 'Academia de Básquetbol', locations: 1, prefix: 'Básquet' },
    { name: 'Academia de Básquetbol', locations: 5, prefix: 'Básquet' },
    { name: 'Academia de Básquetbol', locations: 15, prefix: 'Básquet' },
    { name: 'Academia de Tenis', locations: 1, prefix: 'Tenis' },
    { name: 'Academia de Tenis', locations: 5, prefix: 'Tenis' },
    { name: 'Academia de Tenis', locations: 15, prefix: 'Tenis' },
    { name: 'Academia de Atletismo', locations: 1, prefix: 'Atletismo' },
    { name: 'Academia de Atletismo', locations: 5, prefix: 'Atletismo' },
    { name: 'Academia de Atletismo', locations: 15, prefix: 'Atletismo' },
    { name: 'Academia de Natación', locations: 1, prefix: 'Natación' },
    { name: 'Academia de Natación', locations: 5, prefix: 'Natación' },
    { name: 'Academia de Natación', locations: 15, prefix: 'Natación' },
    { name: 'Academia de Box', locations: 1, prefix: 'Box' },
];
async function main() {
    console.log('🚀 Iniciando Seed Comercial Masivo...');
    console.log('🧹 Limpiando base de datos (preservando Administradores)...');
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.userMembership.deleteMany();
    await prisma.membershipPlan.deleteMany();
    await prisma.product.deleteMany();
    await prisma.reservation.deleteMany();
    await prisma.class.deleteMany();
    await prisma.gymTrainer.deleteMany();
    await prisma.trainerProfile.deleteMany();
    await prisma.marketingCampaign.deleteMany();
    await prisma.crmNote.deleteMany();
    await prisma.vendorApplication.deleteMany();
    await prisma.sponsorshipDeal.deleteMany();
    await prisma.gym.deleteMany();
    await prisma.user.deleteMany({
        where: { role: { not: client_1.UserRole.ADMIN } }
    });
    const passwordHash = await bcrypt.hash('password123', 10);
    console.log('👥 Creando 50 Instructores...');
    const trainers = [];
    for (let i = 0; i < 50; i++) {
        const trainerUser = await prisma.user.create({
            data: {
                name: `Instructor ${faker_1.fakerES.person.firstName()} ${faker_1.fakerES.person.lastName()}`,
                email: faker_1.fakerES.internet.email().toLowerCase(),
                passwordHash,
                role: client_1.UserRole.TRAINER,
                phone: faker_1.fakerES.phone.number(),
                isActive: true,
                trainerProfile: {
                    create: {
                        bio: faker_1.fakerES.lorem.paragraph(),
                        specialties: [faker_1.fakerES.helpers.arrayElement(['CrossFit', 'Personal Training', 'Yoga', 'HIIT', 'Técnica'])],
                        certifications: ['Certificación Nacional'],
                        experienceYears: faker_1.fakerES.number.int({ min: 1, max: 15 }),
                        rating: faker_1.fakerES.number.float({ min: 4.0, max: 5.0, fractionDigits: 1 })
                    }
                }
            },
            include: { trainerProfile: true }
        });
        trainers.push(trainerUser);
    }
    console.log('🏢 Creando 21 Dueños y sus 143 Locales...');
    const allGyms = [];
    for (let i = 0; i < OWNER_CONFIGS.length; i++) {
        const config = OWNER_CONFIGS[i];
        const owner = await prisma.user.create({
            data: {
                name: `Dueño ${i + 1} (${config.name})`,
                email: `dueno${i + 1}@sportnexus.com`,
                passwordHash,
                role: client_1.UserRole.GYM_OWNER,
                phone: faker_1.fakerES.phone.number(),
                isActive: true,
            }
        });
        const brandName = `${faker_1.fakerES.company.name()} ${config.prefix}`;
        for (let j = 0; j < config.locations; j++) {
            const gym = await prisma.gym.create({
                data: {
                    ownerId: owner.id,
                    name: `${brandName} - Sede ${faker_1.fakerES.location.city()}`,
                    description: faker_1.fakerES.lorem.paragraph(),
                    address: faker_1.fakerES.location.streetAddress(),
                    city: faker_1.fakerES.location.city(),
                    phone: faker_1.fakerES.phone.number(),
                    email: faker_1.fakerES.internet.email().toLowerCase(),
                    status: 'ACTIVE'
                }
            });
            allGyms.push(gym);
            const numTrainers = faker_1.fakerES.number.int({ min: 1, max: 3 });
            const selectedTrainers = faker_1.fakerES.helpers.arrayElements(trainers, numTrainers);
            for (const t of selectedTrainers) {
                await prisma.gymTrainer.create({
                    data: {
                        gymId: gym.id,
                        trainerId: t.trainerProfile.id,
                        canCreateClasses: true
                    }
                });
            }
        }
    }
    console.log('📅 Generando miles de clases (esto puede tardar un poco)...');
    const allClasses = [];
    const now = new Date();
    for (const gym of allGyms) {
        const numClasses = faker_1.fakerES.number.int({ min: 10, max: 30 });
        const gymTrainers = await prisma.gymTrainer.findMany({
            where: { gymId: gym.id },
            include: { trainer: true }
        });
        const gymTrainerIds = gymTrainers.map(gt => gt.trainerId);
        const classData = [];
        for (let c = 0; c < numClasses; c++) {
            const daysToAdd = faker_1.fakerES.number.int({ min: -2, max: 10 });
            const hour = faker_1.fakerES.number.int({ min: 6, max: 21 });
            const scheduledAt = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysToAdd, hour, 0, 0);
            const assignedTrainerId = gymTrainerIds.length > 0 ? faker_1.fakerES.helpers.arrayElement(gymTrainerIds) : null;
            classData.push({
                gymId: gym.id,
                trainerId: assignedTrainerId,
                title: `Clase de ${faker_1.fakerES.commerce.department()} - Nivel ${faker_1.fakerES.helpers.arrayElement(['Básico', 'Intermedio', 'Avanzado'])}`,
                description: faker_1.fakerES.lorem.sentence(),
                classType: 'IN_PERSON',
                capacity: faker_1.fakerES.number.int({ min: 10, max: 50 }),
                durationMin: faker_1.fakerES.helpers.arrayElement([45, 60, 90]),
                price: faker_1.fakerES.number.int({ min: 10, max: 50 }),
                scheduledAt: scheduledAt,
                isActive: true,
            });
        }
        const created = await prisma.class.createManyAndReturn({
            data: classData
        });
        allClasses.push(...created);
    }
    console.log('🏃‍♂️ Creando 50 Atletas...');
    const athletes = [];
    for (let i = 0; i < 50; i++) {
        const athlete = await prisma.user.create({
            data: {
                name: `Atleta ${faker_1.fakerES.person.firstName()}`,
                email: `atleta${i + 1}@correo.com`,
                passwordHash,
                role: client_1.UserRole.USER,
                phone: faker_1.fakerES.phone.number(),
                isActive: true,
            }
        });
        athletes.push(athlete);
    }
    console.log('🎟️ Generando tráfico de reservas cruzadas...');
    const reservationsData = [];
    for (const athlete of athletes) {
        const numReservations = faker_1.fakerES.number.int({ min: 5, max: 15 });
        const selectedClasses = faker_1.fakerES.helpers.arrayElements(allClasses, numReservations);
        for (const cls of selectedClasses) {
            reservationsData.push({
                userId: athlete.id,
                classId: cls.id,
                status: faker_1.fakerES.helpers.arrayElement(['CONFIRMED', 'ATTENDED', 'CONFIRMED']),
            });
        }
    }
    let reservationCount = 0;
    for (const res of reservationsData) {
        try {
            await prisma.reservation.create({ data: res });
            reservationCount++;
        }
        catch (e) {
        }
    }
    console.log(`\n✅ ¡Seed Comercial Completado con Éxito!`);
    console.log(`- Instructores: 50`);
    console.log(`- Dueños: 21`);
    console.log(`- Gimnasios/Sucursales: ${allGyms.length}`);
    console.log(`- Clases Programadas: ${allClasses.length}`);
    console.log(`- Atletas: 50`);
    console.log(`- Reservas Realizadas: ${reservationCount}`);
    console.log(`\n¡El Sr. Mario va a alucinar con este volumen de datos!`);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed-commercial.js.map