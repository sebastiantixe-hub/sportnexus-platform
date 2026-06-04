import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserAdminDto } from './dto/user.dto';
import { UserRole } from '@prisma/client';
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
        phone: true,
        dni: true,
        avatarUrl: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      }
    });
    return users;
  }

  async create(createDto: CreateUserAdminDto) {
    // ── Límite: máximo 4 administradores en la plataforma ──
    if (createDto.role === UserRole.ADMIN) {
      const adminCount = await this.prisma.user.count({ where: { role: UserRole.ADMIN } });
      if (adminCount >= 4) {
        throw new ConflictException('El límite de administradores (4) ha sido alcanzado. No se pueden crear más cuentas de tipo Administrador.');
      }
    }

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

  // ── Actualizar última sesión ────────────────────────────────────────────
  async updateLastLogin(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }

  // ── Solicitudes de Rol ─────────────────────────────────────────────────

  async createRoleRequest(userId: string, requestedRole: UserRole, reason?: string) {
    if (requestedRole === UserRole.ADMIN) {
      throw new BadRequestException('No se puede solicitar el rol de Administrador.');
    }
    if (requestedRole === UserRole.USER) {
      throw new BadRequestException('Ya tienes el rol de Atleta por defecto.');
    }

    // Verificar si ya tiene una solicitud pendiente
    const existing = await this.prisma.roleRequest.findFirst({
      where: { userId, status: 'PENDING' },
    });
    if (existing) {
      throw new ConflictException('Ya tienes una solicitud de rol pendiente. Espera la respuesta del administrador.');
    }

    return this.prisma.roleRequest.create({
      data: { userId, requestedRole, reason, status: 'PENDING' },
    });
  }

  async getAllRoleRequests() {
    return this.prisma.roleRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true, avatarUrl: true }
        }
      }
    });
  }

  async approveRoleRequest(requestId: string, adminNote?: string) {
    const request = await this.prisma.roleRequest.findUnique({
      where: { id: requestId },
      include: { user: true }
    });
    if (!request) throw new NotFoundException('Solicitud no encontrada.');
    if (request.status !== 'PENDING') throw new BadRequestException('Esta solicitud ya fue procesada.');

    // Si es ADMIN, verificar el límite de 4
    if (request.requestedRole === UserRole.ADMIN) {
      const adminCount = await this.prisma.user.count({ where: { role: UserRole.ADMIN } });
      if (adminCount >= 4) {
        throw new ConflictException('El límite de 4 administradores ha sido alcanzado.');
      }
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: request.userId },
        data: { role: request.requestedRole },
      }),
      this.prisma.roleRequest.update({
        where: { id: requestId },
        data: { status: 'APPROVED', adminNote },
      }),
    ]);

    return { success: true, message: `Solicitud aprobada. Rol ${request.requestedRole} asignado.` };
  }

  async rejectRoleRequest(requestId: string, adminNote?: string) {
    const request = await this.prisma.roleRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new NotFoundException('Solicitud no encontrada.');
    if (request.status !== 'PENDING') throw new BadRequestException('Esta solicitud ya fue procesada.');

    await this.prisma.roleRequest.update({
      where: { id: requestId },
      data: { status: 'REJECTED', adminNote },
    });

    return { success: true, message: 'Solicitud rechazada.' };
  }

  async getMyRoleRequest(userId: string) {
    return this.prisma.roleRequest.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
