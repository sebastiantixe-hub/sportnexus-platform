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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
const client_1 = require("@prisma/client");
const email_service_1 = require("../notifications/email.service");
let AuthService = class AuthService {
    prisma;
    jwtService;
    config;
    emailService;
    constructor(prisma, jwtService, config, emailService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.config = config;
        this.emailService = emailService;
    }
    async register(dto) {
        const exists = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (exists) {
            throw new common_1.ConflictException('El email ya está registrado');
        }
        const role = dto.role === client_1.UserRole.ADMIN ? client_1.UserRole.USER : (dto.role ?? client_1.UserRole.USER);
        const passwordHash = await bcrypt.hash(dto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                passwordHash,
                role,
                phone: dto.phone,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });
        const tokens = await this.generateTokens(user.id, user.email, user.role);
        this.emailService.sendWelcome(user.email, user.name).catch(() => { });
        return { user, ...tokens };
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Credenciales incorrectas');
        }
        const passwordValid = await bcrypt.compare(dto.password, user.passwordHash || '');
        if (!passwordValid) {
            throw new common_1.UnauthorizedException('Credenciales incorrectas');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('Cuenta desactivada');
        }
        const { passwordHash: _pw, ...safeUser } = user;
        const tokens = await this.generateTokens(user.id, user.email, user.role);
        return { user: safeUser, ...tokens };
    }
    async refreshTokens(userId, refreshToken) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user || !user.isActive) {
            throw new common_1.UnauthorizedException('Acceso denegado o usuario inactivo');
        }
        const savedTokens = await this.prisma.refreshToken.findMany({
            where: { userId, expiresAt: { gt: new Date() } }
        });
        let tokenValid = false;
        for (const token of savedTokens) {
            const isValid = await bcrypt.compare(refreshToken, token.tokenHash);
            if (isValid) {
                tokenValid = true;
                break;
            }
        }
        if (!tokenValid) {
            throw new common_1.UnauthorizedException('Refresh token inválido o expirado');
        }
        const { passwordHash: _pw, ...safeUser } = user;
        const tokens = await this.generateTokens(user.id, user.email, user.role);
        return { user: safeUser, ...tokens };
    }
    async getMe(userId) {
        return this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                dni: true,
                avatarUrl: true,
                isActive: true,
                emailVerified: true,
                createdAt: true,
            },
        });
    }
    async updateProfile(userId, data) {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                name: data.name,
                phone: data.phone,
                dni: data.dni,
                ...(data.role ? { role: data.role } : {}),
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                dni: true,
                avatarUrl: true,
            }
        });
    }
    async getDashboardStats(userId, role) {
        const userRole = role.toUpperCase();
        if (userRole === 'ADMIN') {
            const [totalGyms, totalClasses, totalUsers, totalReservations, recentReservations] = await Promise.all([
                this.prisma.gym.count({ where: { status: 'ACTIVE' } }),
                this.prisma.class.count({ where: { isActive: true } }),
                this.prisma.user.count(),
                this.prisma.reservation.count({ where: { status: 'CONFIRMED' } }),
                this.prisma.reservation.findMany({
                    where: { status: 'CONFIRMED' },
                    orderBy: { bookedAt: 'desc' },
                    take: 5,
                    include: {
                        user: { select: { name: true } },
                        class: { select: { title: true, gym: { select: { name: true } } } },
                    },
                }),
            ]);
            const activities = recentReservations.map(res => ({
                id: res.id,
                type: 'RESERVATION',
                title: `Reserva: ${res.class.title}`,
                description: `${res.user.name} → ${res.class.gym.name}`,
                date: res.bookedAt,
            }));
            return {
                gyms: totalGyms,
                classes: totalClasses,
                members: totalUsers,
                revenue: totalReservations,
                activities,
                isAdmin: true,
            };
        }
        if (userRole === 'GYM_OWNER') {
            const gyms = await this.prisma.gym.findMany({
                where: { ownerId: userId },
                include: {
                    classes: {
                        include: {
                            _count: {
                                select: { reservations: { where: { status: 'CONFIRMED' } } },
                            },
                            reservations: {
                                where: { status: 'CONFIRMED' },
                            },
                        },
                    },
                },
            });
            let totalRevenue = 0;
            const uniqueMembers = new Set();
            let activeClassesCount = 0;
            gyms.forEach((gym) => {
                gym.classes.forEach((cls) => {
                    activeClassesCount++;
                    const confirmedCount = Number(cls._count.reservations);
                    totalRevenue += confirmedCount * Number(cls.price);
                    cls.reservations.forEach((res) => uniqueMembers.add(res.userId));
                });
            });
            const recentActivities = [];
            gyms.forEach(gym => {
                gym.classes.forEach(cls => {
                    cls.reservations.forEach(res => {
                        recentActivities.push({
                            id: res.id,
                            type: 'RESERVATION',
                            title: `Nueva reserva: ${cls.title}`,
                            description: `El atleta ha reservado en ${gym.name}`,
                            date: res.bookedAt,
                        });
                    });
                });
            });
            const sortedActivities = recentActivities
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 5);
            return {
                gyms: gyms.length,
                classes: activeClassesCount,
                members: uniqueMembers.size,
                revenue: totalRevenue,
                activities: sortedActivities,
            };
        }
        else {
            const reservations = await this.prisma.reservation.findMany({
                where: { userId, status: 'CONFIRMED' },
                include: { class: { include: { gym: true } } },
                orderBy: { bookedAt: 'desc' },
                take: 5,
            });
            const activities = reservations.map(res => ({
                id: res.id,
                type: 'RESERVATION',
                title: `Clase reservada: ${res.class.title}`,
                description: `En el gimnasio ${res.class.gym.name}`,
                date: res.bookedAt,
            }));
            const profBookings = await this.prisma.professionalBooking.findMany({
                where: { userId, status: 'CONFIRMED' },
                include: { service: { include: { provider: true } } },
                orderBy: { bookedAt: 'desc' },
                take: 5,
            });
            const profActivities = profBookings.map(b => ({
                id: b.id,
                type: 'PROFESSIONAL_SERVICE',
                title: `Cita Profesional: ${b.service.title}`,
                description: `Con ${b.service.provider.name || 'Especialista'}`,
                date: b.bookedAt,
            }));
            const allActivities = [...activities, ...profActivities].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);
            const gymsCount = await this.prisma.gym.count({
                where: { status: 'ACTIVE' },
            });
            return {
                reservations: reservations.length + profBookings.length,
                gyms: gymsCount,
                points: Math.floor((reservations.length + profBookings.length) * 125),
                months: 1,
                activities: allActivities,
            };
        }
    }
    async findOrCreateAuth0User(params) {
        const { auth0Id, email, name, avatarUrl } = params;
        let user = await this.prisma.user.findUnique({
            where: { auth0Id },
            select: { id: true, name: true, email: true, role: true, isActive: true, avatarUrl: true },
        });
        if (user) {
            return user;
        }
        const existing = await this.prisma.user.findFirst({
            where: {
                email: {
                    equals: email,
                    mode: 'insensitive'
                }
            },
        });
        if (existing) {
            console.log(`Encontrado usuario existente por email (case-insensitive): ${existing.email}. Vinculando a Auth0 ID: ${auth0Id}`);
            user = await this.prisma.user.update({
                where: { id: existing.id },
                data: {
                    auth0Id,
                    avatarUrl: avatarUrl ?? existing.avatarUrl,
                },
                select: { id: true, name: true, email: true, role: true, isActive: true, avatarUrl: true },
            });
            return user;
        }
        const invitation = await this.prisma.invitation.findFirst({
            where: {
                email: {
                    equals: email,
                    mode: 'insensitive'
                },
                status: 'PENDING',
                expiresAt: { gt: new Date() }
            }
        });
        let assignedRole = client_1.UserRole.USER;
        let gymIdToLink = null;
        if (invitation) {
            console.log(`Invitación encontrada para ${email}. Asignando rol: ${invitation.role}`);
            assignedRole = invitation.role;
            gymIdToLink = invitation.gymId;
        }
        else {
            console.log(`No hay invitación para ${email}. Creando atleta público (USER)`);
        }
        const newUser = await this.prisma.user.create({
            data: {
                auth0Id,
                email: email.toLowerCase(),
                name,
                avatarUrl,
                role: assignedRole,
                emailVerified: true,
            },
            select: { id: true, name: true, email: true, role: true, isActive: true, avatarUrl: true },
        });
        if (invitation) {
            await this.prisma.invitation.update({
                where: { id: invitation.id },
                data: { status: 'ACCEPTED' }
            });
            if (assignedRole === client_1.UserRole.TRAINER && gymIdToLink) {
                const trainerProf = await this.prisma.trainerProfile.create({
                    data: {
                        userId: newUser.id,
                        bio: 'Entrenador invitado',
                        experienceYears: 1
                    }
                });
                await this.prisma.gymTrainer.create({
                    data: {
                        gymId: gymIdToLink,
                        trainerId: trainerProf.id,
                        canCreateClasses: true
                    }
                });
                console.log(`TrainerProfile creado y vinculado al gimnasio ${gymIdToLink}`);
            }
        }
        this.emailService.sendWelcome(email, name).catch(() => { });
        return newUser;
    }
    async generateTokens(userId, email, role) {
        const payload = { sub: userId, email, role };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.config.get('JWT_SECRET'),
                expiresIn: (this.config.get('JWT_EXPIRES_IN') || '15m'),
            }),
            this.jwtService.signAsync(payload, {
                secret: this.config.get('JWT_REFRESH_SECRET'),
                expiresIn: (this.config.get('JWT_REFRESH_EXPIRES_IN') || '7d'),
            }),
        ]);
        const tokenHash = await bcrypt.hash(refreshToken, 10);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await this.prisma.refreshToken.create({
            data: { userId, tokenHash, expiresAt },
        });
        return { accessToken, refreshToken };
    }
    async inviteUser(invitedBy, email, role, gymId) {
        if (role === client_1.UserRole.ADMIN || role === client_1.UserRole.GYM_OWNER) {
            if (invitedBy.role !== client_1.UserRole.ADMIN) {
                throw new common_1.UnauthorizedException('Solo los administradores de Hercix pueden invitar a dueños de gimnasios.');
            }
        }
        const userExists = await this.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (userExists) {
            throw new common_1.ConflictException('Este correo electrónico ya está registrado como usuario activo.');
        }
        await this.prisma.invitation.deleteMany({
            where: { email: email.toLowerCase() },
        });
        const token = require('crypto').randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        const invitation = await this.prisma.invitation.create({
            data: {
                email: email.toLowerCase(),
                role,
                gymId,
                token,
                invitedById: invitedBy.id,
                expiresAt,
            },
        });
        const invitationLink = `http://localhost:5173/login?inviteToken=${token}&email=${encodeURIComponent(email)}`;
        await this.emailService.sendInvitation(email.toLowerCase(), role, invitationLink).catch(() => { });
        return {
            message: 'Invitación creada y enviada con éxito',
            invitationId: invitation.id,
            expiresAt: invitation.expiresAt,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService,
        email_service_1.EmailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map