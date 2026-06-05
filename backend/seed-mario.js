const { PrismaClient, UserRole, ServiceType } = require('@prisma/client');
const bcrypt = require('bcrypt');
const fs = require('fs');

const prisma = new PrismaClient();

const DISTRICTS = ['Callao', 'Puente Piedra', 'Magdalena', 'La Molina', 'San Juan de Lurigancho', 'Los Olivos'];
const COORDS = {
  'Callao': { lat: -12.0566, lng: -77.1184 },
  'Puente Piedra': { lat: -11.8677, lng: -77.0774 },
  'Magdalena': { lat: -12.0918, lng: -77.0714 },
  'La Molina': { lat: -12.0772, lng: -76.9341 },
  'San Juan de Lurigancho': { lat: -12.0017, lng: -76.9997 },
  'Los Olivos': { lat: -11.9938, lng: -77.0664 },
};

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const gymNames = ['Iron Forge Gym','EliteFit Center','PowerHouse Fitness','Peak Performance','Urban Athletics','FitLife Studio','Olympus Gym','Thunder Fitness','Nexus Sport Club','Apex Gym','Titan Fitness','Velocity Sport','Vanguard Gym','Summit Fitness','Core & Beyond','ProZone Fitness','Eclipse Gym','Kinetic Sport','Zenith Athletics','Meridian Fitness','Forge Athletic','Alpha Gym','Delta Fitness','Omega Sport','Hercules Gym','Atlas Fitness','Spartan Club','Phoenix Gym','Gladiator Fitness','Champion Zone'];
const classNames = ['CrossFit Avanzado','Spinning Intenso','Yoga Dinamico','Zumba Energia','Box con Guantes','Pilates Core','Funcional Extremo','TRX Suspension','Kickboxing Basico','Aerobicos Ritmo','Musculacion Pesada','HIIT Quema Total','GAP Express','Estiramiento Profundo','Salsa Sport','Muay Thai Iniciantes','Calistenia Outdoor','Power Lifting','Atletismo Basico','Natacion Adultos'];
const productNames = ['Proteina Whey 2kg','Creatina Monohidrato 500g','BCAA 8:1:1 300g','Pre-Workout Explosion','Glutamina Pura 300g','Multivitaminico Sport','Omega-3 120 capsulas','Colageno Hidrolizado','Barra de Proteina x12','Camiseta Hercix Performance','Short Compresion','Guantes de Gym','Banda de Resistencia Kit','Cuerda para Saltar Pro','Botella Termica 1L'];
const firstNames = ['Carlos','Luis','Javier','Andres','Miguel','Roberto','Diego','Sebastian','Alejandro','Fernando','Maria','Lucia','Valentina','Daniela','Ana','Carmen','Rosa','Patricia','Gabriela','Sofia'];
const lastNames = ['Garcia','Rodriguez','Lopez','Martinez','Gonzalez','Perez','Sanchez','Ramirez','Torres','Flores','Rivera','Gomez','Diaz','Cruz','Morales'];

function randomName() { return `${pick(firstNames)} ${pick(lastNames)}`; }
function randomEmail(name, suffix) { return `${name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z.]/g,'')}.${suffix}@hercix-demo.com`; }

function reportProgress(status, percent) {
  try {
    fs.writeFileSync('seed-progress.json', JSON.stringify({ status, percent, timestamp: new Date() }), 'utf8');
    console.log(`[PROGRESS] ${percent}% - ${status}`);
  } catch (e) {
    console.error('Error writing progress file:', e);
  }
}

async function main() {
  reportProgress('Iniciando sembrado de base de datos...', 5);
  const hash = await bcrypt.hash('Hercix2026!', 10);

  // 1. Admins
  reportProgress('Registrando administradores...', 10);
  const adminData = [
    { name: 'Mario Solis (Super Admin)', email: 'mario123q@gmail.com' },
    { name: 'Sebastian Tixe (Dev)', email: 'sebastian.admin@hercix-demo.com' },
    { name: 'Soporte Tecnico Hercix', email: 'soporte.tecnico@hercix-demo.com' },
    { name: 'Gerente Plataforma', email: 'gerente.plataforma@hercix-demo.com' },
  ];
  for (const ad of adminData) {
    const ex = await prisma.user.findUnique({ where: { email: ad.email } });
    if (!ex) await prisma.user.create({ data: { name: ad.name, email: ad.email, passwordHash: hash, role: UserRole.ADMIN, isActive: true, emailVerified: true } });
    console.log(`  Admin: ${ad.name}`);
  }

  // 2. Owners (30) in parallel batches of 5 to avoid pool limits
  for (let i = 0; i < 30; i += 5) {
    reportProgress(`Creando dueños de gimnasio y locales: ${i}/30...`, 15 + Math.floor(i / 30 * 45));
    const batchPromises = [];
    for (let j = i; j < i + 5 && j < 30; j++) {
      batchPromises.push((async () => {
        const name = randomName();
        const email = randomEmail(name, `owner${j + 1}`);
        const district = DISTRICTS[j % 6];
        const { lat, lng } = COORDS[district];
        let owner = await prisma.user.findUnique({ where: { email } });
        if (!owner) owner = await prisma.user.create({ data: { name, email, passwordHash: hash, role: UserRole.GYM_OWNER, phone: `+51 9${rnd(10,99)} ${rnd(100,999)} ${rnd(100,999)}`, isActive: true, emailVerified: true } });
        
        const numGyms = j < 5 ? 1 : rnd(2, 10);
        for (let g = 0; g < numGyms; g++) {
          const gymName = g === 0 ? pick(gymNames) : `${pick(gymNames)} Sede ${g+1}`;
          const ex = await prisma.gym.findFirst({ where: { ownerId: owner.id, name: gymName } });
          if (!ex) {
            const gym = await prisma.gym.create({ data: { ownerId: owner.id, name: gymName, description: `Gimnasio en ${district}.`, address: `Av. Principal ${rnd(100,999)}, ${district}`, city: 'Lima', district, province: 'Lima', country: 'Peru', latitude: lat + (Math.random()-0.5)*0.02, longitude: lng + (Math.random()-0.5)*0.02, phone: `+51 1 ${rnd(100,999)}-${rnd(1000,9999)}`, status: 'ACTIVE' } });
            
            const numClasses = rnd(2, 10);
            const classes = [...classNames].sort(() => Math.random()-0.5).slice(0, numClasses);
            const base = new Date();
            const classPromises = [];
            for (let ci = 0; ci < classes.length; ci++) {
              const scheduledAt = new Date(base.getTime() + (ci+1) * 86400000);
              classPromises.push(prisma.class.create({ data: { gymId: gym.id, title: classes[ci], description: `Clase en ${gymName}.`, classType: pick(['IN_PERSON','ONLINE','HYBRID']), capacity: rnd(10,30), durationMin: pick([45,60,75,90]), price: rnd(20,80), scheduledAt } }));
            }
            await Promise.all(classPromises);
            
            const numProd = rnd(1, 2);
            const prods = [...productNames].sort(() => Math.random()-0.5).slice(0, numProd);
            const prodPromises = [];
            for (const pname of prods) {
              prodPromises.push(prisma.product.create({ data: { gymId: gym.id, name: pname, description: `Producto en ${gymName}.`, price: rnd(25,250), stock: rnd(10,100), category: pick(['Suplementos','Ropa','Accesorios']) } }));
            }
            await Promise.all(prodPromises);
          }
        }
      })());
    }
    await Promise.all(batchPromises);
  }

  // 3. Coaches (20) in parallel
  reportProgress('Creando entrenadores y perfiles profesionales...', 65);
  const coachPromises = [];
  for (let i = 0; i < 20; i++) {
    const name = randomName();
    const email = randomEmail(name, `coach${i+1}`);
    coachPromises.push((async () => {
      let coach = await prisma.user.findUnique({ where: { email } });
      if (!coach) {
        coach = await prisma.user.create({ data: { name, email, passwordHash: hash, role: UserRole.TRAINER, phone: `+51 9${rnd(10,99)} ${rnd(100,999)} ${rnd(100,999)}`, isActive: true, emailVerified: true } });
        await prisma.trainerProfile.create({ data: { userId: coach.id, bio: `Entrenador con ${rnd(2,15)} anos de experiencia.`, specialties: ['Musculacion','Cardio','CrossFit'].slice(0,rnd(2,3)), certifications: ['ACE Certified','NASM CPT'].slice(0,rnd(1,2)), experienceYears: rnd(2,15), hourlyRate: rnd(30,120), rating: rnd(35,50)/10 } });
        
        const numSvc = rnd(2, 10);
        const svcPromises = [];
        for (let s = 0; s < numSvc; s++) {
          svcPromises.push(prisma.professionalService.create({ data: { providerId: coach.id, title: `${pick(['Entrenamiento','Plan','Sesion'])} ${pick(['Personal','Grupal','Online'])} - ${coach.name.split(' ')[0]}`, description: `Servicio profesional. ${rnd(4,12)} semanas.`, serviceType: pick([ServiceType.PERSONAL_TRAINING, ServiceType.NUTRITION_PLAN, ServiceType.PHYSIOTHERAPY, ServiceType.CONSULTATION]), price: rnd(80,500), durationMin: rnd(30,120) } }));
        }
        await Promise.all(svcPromises);
      }
    })());
  }
  await Promise.all(coachPromises);

  // 4. Athletes (70) in parallel
  reportProgress('Creando atletas y distribuyéndolos en distritos...', 85);
  const athletePromises = [];
  for (let i = 0; i < 70; i++) {
    const name = randomName();
    const district = DISTRICTS[i % 6];
    const email = randomEmail(name, `atleta${i+1}`);
    athletePromises.push((async () => {
      const ex = await prisma.user.findUnique({ where: { email } });
      if (!ex) await prisma.user.create({ data: { name, email, passwordHash: hash, role: UserRole.USER, phone: `+51 9${rnd(10,99)} ${rnd(100,999)} ${rnd(100,999)}`, isActive: true, emailVerified: true, weight: rnd(55,100) } });
    })());
  }
  await Promise.all(athletePromises);

  const tu = await prisma.user.count();
  const tg = await prisma.gym.count();
  const tc = await prisma.class.count();
  
  reportProgress(`Sembrado completado: ${tu} usuarios, ${tg} gimnasios, ${tc} clases creados.`, 100);
}

main().catch(e => {
  reportProgress(`Error: ${e.message}`, -1);
  console.error(e);
  process.exit(1);
}).finally(() => prisma.$disconnect());
