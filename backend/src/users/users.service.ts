import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserAdminDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        isActive: true,
      }
    });
    return users;
  }

  async create(createDto: CreateUserAdminDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createDto.email },
    });

    if (existingUser) {
      throw new ConflictException('El correo ya está registrado en el sistema.');
    }

    const passwordHash = await bcrypt.hash(createDto.password, 10);

    const newUser = await this.prisma.user.create({
      data: {
        name: createDto.name,
        email: createDto.email,
        passwordHash,
        role: createDto.role,
        phone: createDto.phone,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      }
    });

    return newUser;
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (user.role === 'ADMIN') {
      throw new ConflictException('No se puede eliminar a otro administrador desde este panel.');
    }

    await this.prisma.user.delete({ where: { id } });
    return { success: true, message: 'Usuario eliminado correctamente' };
  }
}
