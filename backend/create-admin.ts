import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@sportnexus.com';
  const password = 'password123';
  
  // Check if admin exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.update({ 
      where: { email }, 
      data: { 
        role: UserRole.ADMIN,
        passwordHash
      } 
    });
    console.log('Role updated to ADMIN and password reset to password123.');
  } else {
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: 'Super Admin',
        role: UserRole.ADMIN,
      },
    });
    console.log('Admin user created successfully.');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
