const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('💎 Iniciando Enriquecimiento de Datos de Nivel Élite (JS Version)...');

  const gyms = await prisma.gym.findMany();
  
  const athletes = await prisma.user.findMany({
    where: { 
      role: 'USER', 
      email: { contains: '@example.com' } 
    },
    take: 150
  });

  if (athletes.length === 0) {
    console.error('❌ No hay atletas para transacciones.');
    return;
  }

  for (const gym of gyms) {
    console.log(`✨ Enriqueciendo: ${gym.name}...`);

    let extraProducts = [];
    const nameLower = gym.name.toLowerCase();

    if (nameLower.includes('gym') || nameLower.includes('fitness')) {
      extraProducts = [
        { name: 'Creatina Monohidratada 500g', price: 35.0, category: 'SUPPLEMENTS', imageUrl: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400' },
        { name: 'Shaker Pro SportNexus', price: 12.0, category: 'GEAR', imageUrl: 'https://images.unsplash.com/photo-1593103445831-d8ec717be63c?w=400' },
        { name: 'Cinturón de Levantamiento', price: 45.0, category: 'GEAR', imageUrl: 'https://images.unsplash.com/photo-1620188467120-0962aa1fa3e2?w=400' },
      ];
    } else if (nameLower.includes('soccer') || nameLower.includes('academy')) {
      extraProducts = [
        { name: 'Balón de Fútbol N5 Oficial', price: 55.0, category: 'GEAR', imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400' },
        { name: 'Tacos Deportivos Pro', price: 120.0, category: 'GEAR', imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400' },
        { name: 'Medias de Compresión', price: 18.0, category: 'CLOTHING', imageUrl: 'https://images.unsplash.com/photo-1582533089852-02c3cd20119c?w=400' },
      ];
    } else {
      extraProducts = [
        { name: 'Mochila Técnica Outdoor', price: 85.0, category: 'GEAR', imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400' },
        { name: 'Smartwatch SportNexus', price: 199.0, category: 'ELECTRONICS', imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400' },
      ];
    }

    // Insertar productos
    for (const p of extraProducts) {
      await prisma.product.create({
        data: {
          ...p,
          gymId: gym.id,
          description: `Producto premium disponible en ${gym.name}.`,
          stock: 100
        }
      });
    }

    // Generar 5 ventas por negocio para Analytics
    const gymAthletes = athletes.sort(() => 0.5 - Math.random()).slice(0, 5);
    const products = await prisma.product.findMany({ where: { gymId: gym.id } });

    for (const athlete of gymAthletes) {
      const prod = products[Math.floor(Math.random() * products.length)];
      
      const order = await prisma.order.create({
        data: {
          userId: athlete.id,
          gymId: gym.id,
          status: 'PAID',
          totalAmount: prod.price,
          orderItems: {
            create: {
              productId: prod.id,
              quantity: 1,
              unitPrice: prod.price
            }
          }
        }
      });

      await prisma.payment.create({
        data: {
          userId: athlete.id,
          amount: prod.price,
          status: 'COMPLETED',
          orderId: order.id,
          description: `Compra en ${gym.name}`,
          paidAt: new Date()
        }
      });
    }
  }

  console.log('✅ Base de Datos Enriquecida al 100%.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
