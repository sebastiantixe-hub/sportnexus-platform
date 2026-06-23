import { PrismaClient } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';

const prisma = new PrismaClient();
const jwtService = new JwtService({
  secret: 'sports_saas_super_secret_jwt_key_change_in_production_000000',
});

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: 'sofia.vargas.atleta4@hercix-demo.com' },
  });
  if (!user) {
    console.error('User sofia.vargas.atleta4@hercix-demo.com not found');
    return;
  }
  const payload = { sub: user.id, email: user.email, role: user.role };
  const token = await jwtService.signAsync(payload, { expiresIn: '7d' });
  console.log('\n--- TOKEN FOR SOFIA VARGAS ---');
  console.log(token);
}

main().finally(() => prisma.$disconnect());
