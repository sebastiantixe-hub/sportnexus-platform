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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
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
    async findOneProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true, name: true, email: true, role: true,
                phone: true, dni: true, avatarUrl: true,
                isActive: true, emailVerified: true,
                lastLoginAt: true, createdAt: true, weight: true,
            },
        });
        if (!user)
            throw new common_1.NotFoundException('Usuario no encontrado.');
        let roleData = {};
        if (user.role === 'GYM_OWNER') {
            const gyms = await this.prisma.gym.findMany({
                where: { ownerId: userId },
                select: {
                    id: true, name: true, city: true, district: true, status: true, createdAt: true,
                    _count: { select: { classes: true, orders: true } },
                },
                orderBy: { createdAt: 'desc' },
                take: 10,
            });
            const totalGyms = await this.prisma.gym.count({ where: { ownerId: userId } });
            const totalOrders = await this.prisma.order.count({ where: { gym: { ownerId: userId } } });
            roleData = { gyms, stats: { totalGyms, totalOrders } };
        }
        if (user.role === 'TRAINER') {
            const profile = await this.prisma.trainerProfile.findUnique({
                where: { userId },
                select: { bio: true, specialties: true, certifications: true, experienceYears: true, hourlyRate: true, rating: true },
            });
            const services = await this.prisma.professionalService.findMany({
                where: { providerId: userId },
                select: { id: true, title: true, serviceType: true, price: true, isActive: true },
                take: 10,
            });
            const totalServices = await this.prisma.professionalService.count({ where: { providerId: userId } });
            const bookings = await this.prisma.professionalBooking.count({ where: { service: { providerId: userId } } });
            roleData = { profile, services, stats: { totalServices, bookings } };
        }
        if (user.role === 'USER') {
            const reservations = await this.prisma.reservation.findMany({
                where: { userId },
                select: {
                    id: true, status: true, bookedAt: true,
                    class: { select: { title: true, gym: { select: { name: true, district: true } } } },
                },
                orderBy: { bookedAt: 'desc' },
                take: 5,
            });
            const memberships = await this.prisma.userMembership.findMany({
                where: { userId },
                select: {
                    status: true, startedAt: true, expiresAt: true,
                    plan: { select: { name: true, gym: { select: { name: true } } } },
                },
                take: 3,
            });
            const orders = await this.prisma.order.count({ where: { userId } });
            const totalReservations = await this.prisma.reservation.count({ where: { userId } });
            roleData = { reservations, memberships, stats: { orders, totalReservations } };
        }
        if (user.role === 'ADMIN') {
            const usersCreated = await this.prisma.user.count();
            const gymsTotal = await this.prisma.gym.count();
            roleData = { stats: { usersCreated, gymsTotal } };
        }
        return { ...user, roleData };
    }
    async create(createDto) {
        if (createDto.role === client_1.UserRole.ADMIN) {
            const adminCount = await this.prisma.user.count({ where: { role: client_1.UserRole.ADMIN } });
            if (adminCount >= 4) {
                throw new common_1.ConflictException('El límite de administradores (4) ha sido alcanzado. No se pueden crear más cuentas de tipo Administrador.');
            }
        }
        const existingUser = await this.prisma.user.findUnique({
            where: { email: createDto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('El correo ya está registrado en el sistema.');
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
    async remove(id) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        if (user.role === 'ADMIN') {
            throw new common_1.ConflictException('No se puede eliminar a otro administrador desde este panel.');
        }
        await this.prisma.user.delete({ where: { id } });
        return { success: true, message: 'Usuario eliminado correctamente' };
    }
    async updateLastLogin(userId) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { lastLoginAt: new Date() },
        });
    }
    async createRoleRequest(userId, requestedRole, reason) {
        if (requestedRole === client_1.UserRole.ADMIN) {
            throw new common_1.BadRequestException('No se puede solicitar el rol de Administrador.');
        }
        if (requestedRole === client_1.UserRole.USER) {
            throw new common_1.BadRequestException('Ya tienes el rol de Atleta por defecto.');
        }
        const existing = await this.prisma.roleRequest.findFirst({
            where: { userId, status: 'PENDING' },
        });
        if (existing) {
            throw new common_1.ConflictException('Ya tienes una solicitud de rol pendiente. Espera la respuesta del administrador.');
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
    async approveRoleRequest(requestId, adminNote) {
        const request = await this.prisma.roleRequest.findUnique({
            where: { id: requestId },
            include: { user: true }
        });
        if (!request)
            throw new common_1.NotFoundException('Solicitud no encontrada.');
        if (request.status !== 'PENDING')
            throw new common_1.BadRequestException('Esta solicitud ya fue procesada.');
        if (request.requestedRole === client_1.UserRole.ADMIN) {
            const adminCount = await this.prisma.user.count({ where: { role: client_1.UserRole.ADMIN } });
            if (adminCount >= 4) {
                throw new common_1.ConflictException('El límite de 4 administradores ha sido alcanzado.');
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
    async rejectRoleRequest(requestId, adminNote) {
        const request = await this.prisma.roleRequest.findUnique({ where: { id: requestId } });
        if (!request)
            throw new common_1.NotFoundException('Solicitud no encontrada.');
        if (request.status !== 'PENDING')
            throw new common_1.BadRequestException('Esta solicitud ya fue procesada.');
        await this.prisma.roleRequest.update({
            where: { id: requestId },
            data: { status: 'REJECTED', adminNote },
        });
        return { success: true, message: 'Solicitud rechazada.' };
    }
    async getMyRoleRequest(userId) {
        return this.prisma.roleRequest.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map