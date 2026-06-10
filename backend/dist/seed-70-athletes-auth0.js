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
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
const DOMAIN = 'dev-khvop4d61s5ip8d3.us.auth0.com';
const CLIENT_ID = '3kp2ZDHZYjBxcJaqtGXZdTIShBsK3sJK';
const CONNECTION = 'Username-Password-Authentication';
const PASSWORD = 'Hercix2026!';
const DISTRICTS = ['Callao', 'Puente Piedra', 'Magdalena', 'La Molina', 'San Juan de Lurigancho', 'Los Olivos'];
const ATHLETE_NAMES = [
    'Mateo Perez', 'Ana Flores', 'Carlos Mendez', 'Sofia Vargas', 'Luis Castillo',
    'Maria Torres', 'Roberto Diaz', 'Valentina Rios', 'Javier Mora', 'Camila Garcia',
    'Diego Fuentes', 'Patricia Lopez', 'Miguel Sanchez', 'Lucia Martinez', 'Andres Gomez',
    'Rosa Herrera', 'Fernando Cruz', 'Daniela Jimenez', 'Jorge Romero', 'Carmen Guerrero',
    'Victor Chavez', 'Isabel Silva', 'Pedro Medina', 'Gabriela Vega', 'Oscar Reyes',
    'Paula Castillo', 'Eduardo Vargas', 'Beatriz Ruiz', 'Raul Aguilar', 'Natalia Soto',
    'Marco Paredes', 'Claudia Acosta', 'Felipe Castro', 'Diana Espinoza', 'Emilio Rojas',
    'Valeria Mora', 'Nicolas Pizarro', 'Isabella Navarro', 'Sebastian Calderon', 'Carla Lara',
    'Juan Vidal', 'Fabian Cabrera', 'Ignacio Montes', 'Andrea Zamora', 'Hugo Salazar',
    'Renata Delgado', 'Alejandro Suarez', 'Luciana Rivera', 'Gonzalo Ortega', 'Elena Quispe',
    'Alvaro Ponce', 'Yasmin Meza', 'Brenda Palomino', 'Kevin Huanca', 'Sandra Condori',
    'Frank Mamani', 'Lisbeth Ccopa', 'Bryan Quispe', 'Milagros Apaza', 'Cesar Mamani',
    'Diana Callata', 'Ronald Flores', 'Nancy Cutipa', 'Jhon Lipa', 'Silvia Ticona',
    'Renzo Zapana', 'Paola Coaquira', 'Wilson Turpo', 'Karina Calisaya', 'Julio Mamani'
];
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function main() {
    console.log('=== SEED 70 ATLETAS REALES (AUTH0 + NEON) ===');
    const passwordHash = await bcrypt.hash(PASSWORD, 10);
    console.log('Limpiando cuentas de atletas de prueba anteriores...');
    const existingTestAthletes = await prisma.user.findMany({
        where: {
            email: {
                startsWith: 'atleta',
                endsWith: '@testgym.pe'
            }
        },
        select: { id: true, email: true }
    });
    const deleteIds = existingTestAthletes.map(u => u.id);
    if (deleteIds.length > 0) {
        await prisma.reservation.deleteMany({ where: { userId: { in: deleteIds } } });
        await prisma.userMembership.deleteMany({ where: { userId: { in: deleteIds } } });
        await prisma.roleRequest.deleteMany({ where: { userId: { in: deleteIds } } });
        await prisma.user.deleteMany({ where: { id: { in: deleteIds } } });
        console.log(`  Eliminados ${deleteIds.length} atletas viejos de Neon.`);
    }
    for (let i = 0; i < ATHLETE_NAMES.length; i++) {
        const name = ATHLETE_NAMES[i];
        const index = i + 1;
        const email = `atleta${index.toString().padStart(2, '0')}@testgym.pe`;
        const district = DISTRICTS[i % 6];
        console.log(`[${index}/70] Registrando a ${name} (${email}) en ${district}...`);
        let auth0Id = `auth0|seeded_athlete_${index}`;
        try {
            const res = await fetch(`https://${DOMAIN}/dbconnections/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    client_id: CLIENT_ID,
                    email: email,
                    password: PASSWORD,
                    connection: CONNECTION,
                    user_metadata: {
                        name: name
                    }
                })
            });
            const data = await res.json();
            if (res.status === 200 && data && data._id) {
                auth0Id = `auth0|${data._id}`;
                console.log(`  -> Creado en Auth0 exitosamente: ${auth0Id}`);
            }
            else {
                if (data && data.code === 'user_exists') {
                    console.log(`  -> Ya existía en Auth0.`);
                }
                else {
                    console.warn(`  -> Advertencia al crear en Auth0:`, data);
                }
            }
        }
        catch (err) {
            console.error(`  -> Error al conectar con Auth0:`, err.message);
        }
        try {
            await prisma.user.create({
                data: {
                    name,
                    email,
                    passwordHash,
                    auth0Id,
                    role: client_1.UserRole.USER,
                    phone: `+51 9${Math.floor(10 + Math.random() * 90)} ${Math.floor(100 + Math.random() * 900)} ${Math.floor(100 + Math.random() * 900)}`,
                    isActive: true,
                    emailVerified: true,
                    weight: Math.floor(55 + Math.random() * 45),
                }
            });
            console.log(`  -> Guardado en Neon.`);
        }
        catch (dbErr) {
            console.error(`  -> Error al guardar en Neon:`, dbErr.message);
        }
        await delay(300);
    }
    console.log('\n=== SEED DE 70 ATLETAS COMPLETADO CON ÉXITO ===');
    process.exit(0);
}
main().catch(err => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=seed-70-athletes-auth0.js.map