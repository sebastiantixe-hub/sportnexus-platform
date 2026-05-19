"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🚀 Iniciando script de promoción masiva para cuentas de prueba Auth0...');
    const auth0Users = await prisma.user.findMany({
        where: {
            OR: [
                { email: { contains: 'auth0.user' } },
                { auth0Id: { startsWith: 'auth0|' } },
                { auth0Id: { startsWith: 'google-oauth2|' } }
            ]
        }
    });
    if (auth0Users.length === 0) {
        console.log('❌ No se encontraron usuarios Auth0 para promover.');
        return;
    }
    console.log(`👤 Se encontraron ${auth0Users.length} cuentas de prueba Auth0.`);
    for (const user of auth0Users) {
        await prisma.user.update({
            where: { id: user.id },
            data: { role: client_1.UserRole.GYM_OWNER }
        });
        console.log(`✅ ${user.name} (${user.email}) promovido a GYM_OWNER.`);
        const gymExists = await prisma.gym.findFirst({
            where: { ownerId: user.id }
        });
        if (!gymExists) {
            const gym = await prisma.gym.create({
                data: {
                    name: `Hercix Premium Club - Sede ${user.name}`,
                    description: 'Sede premium de alto rendimiento deportivo, equipada con tecnología de punta.',
                    address: 'Av. Javier Prado Este 456, San Isidro',
                    city: 'Lima',
                    district: 'San Isidro',
                    province: 'Lima',
                    country: 'Perú',
                    phone: '+51 987654321',
                    email: user.email,
                    logoUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=300&auto=format&fit=crop',
                    website: 'https://hercix.com',
                    openTime: '06:00 AM',
                    closeTime: '10:00 PM',
                    openDays: 'Lunes a Sábado',
                    ownerId: user.id
                }
            });
            console.log(`🏋️‍♂️ Gimnasio "${gym.name}" creado con éxito.`);
        }
        else {
            console.log(`ℹ️ ${user.name} ya tenía un gimnasio registrado.`);
        }
    }
    console.log('🎉 PROCESO MASIVO COMPLETADO CON ÉXITO. ¡Refresca la página en tu navegador! 🎉');
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=seed-usuario-owner.js.map