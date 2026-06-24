"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfessionalsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
let ProfessionalsService = class ProfessionalsService {
    prisma;
    notificationsService;
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
    }
    async create(providerId, createDto) {
        return this.prisma.professionalService.create({
            data: {
                ...createDto,
                providerId,
            },
        });
    }
    async findAll() {
        return this.prisma.professionalService.findMany({
            where: { isActive: true },
            include: {
                provider: {
                    select: { id: true, name: true, email: true, avatarUrl: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const service = await this.prisma.professionalService.findUnique({
            where: { id },
            include: {
                provider: {
                    select: { id: true, name: true, avatarUrl: true },
                },
            },
        });
        if (!service)
            throw new common_1.NotFoundException('Servicio no encontrado');
        return service;
    }
    async update(id, currentUserId, updateDto, isAdmin) {
        const service = await this.findOne(id);
        if (!isAdmin && service.providerId !== currentUserId) {
            throw new common_1.ForbiddenException('No tienes permiso para actualizar este servicio');
        }
        return this.prisma.professionalService.update({
            where: { id },
            data: updateDto,
        });
    }
    async remove(id, currentUserId, isAdmin) {
        const service = await this.findOne(id);
        if (!isAdmin && service.providerId !== currentUserId) {
            throw new common_1.ForbiddenException('No tienes permiso para eliminar este servicio');
        }
        return this.prisma.professionalService.update({
            where: { id },
            data: { isActive: false },
        });
    }
    async bookService(userId, serviceId, notes) {
        const service = await this.findOne(serviceId);
        const booking = await this.prisma.professionalBooking.create({
            data: {
                userId,
                serviceId,
                notes,
                status: 'PENDING',
            },
            include: {
                service: {
                    include: { provider: true }
                },
                user: true,
            },
        });
        try {
            await this.notificationsService.create(service.providerId, {
                title: 'Nueva Reserva Pendiente',
                description: `${booking.user?.name || 'Un atleta'} ha solicitado reservar tu servicio: ${service.title}`,
                type: 'RESERVATION',
            });
        }
        catch (err) {
            console.error('Error creating booking notification for provider:', err);
        }
        try {
            await this.notificationsService.create(userId, {
                title: 'Reserva Solicitada',
                description: `Has solicitado reservar el servicio: ${service.title}. Espera la confirmación.`,
                type: 'RESERVATION',
            });
        }
        catch (err) {
            console.error('Error creating booking notification for client:', err);
        }
        return booking;
    }
    async getMyBookings(userId) {
        return this.prisma.professionalBooking.findMany({
            where: { userId },
            include: {
                service: {
                    include: { provider: true }
                }
            },
            orderBy: { bookedAt: 'desc' },
        });
    }
    async getProviderBookings(providerId) {
        return this.prisma.professionalBooking.findMany({
            where: {
                service: {
                    providerId: providerId
                }
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true, phone: true }
                },
                service: true
            },
            orderBy: { bookedAt: 'desc' },
        });
    }
    async updateBookingStatus(bookingId, providerId, status, isAdmin) {
        const booking = await this.prisma.professionalBooking.findUnique({
            where: { id: bookingId },
            include: { service: true }
        });
        if (!booking)
            throw new common_1.NotFoundException('Reserva no encontrada');
        if (!isAdmin && booking.service.providerId !== providerId) {
            throw new common_1.ForbiddenException('No tienes permiso para actualizar esta reserva');
        }
        const updated = await this.prisma.professionalBooking.update({
            where: { id: bookingId },
            data: { status },
            include: {
                service: {
                    include: { provider: true }
                },
                user: true
            }
        });
        try {
            let statusText = status === 'CONFIRMED' ? 'confirmada' : status === 'CANCELLED' ? 'cancelada' : status.toLowerCase();
            await this.notificationsService.create(updated.userId, {
                title: `Reserva de Servicio ${status === 'CONFIRMED' ? 'Confirmada' : status === 'CANCELLED' ? 'Cancelada' : 'Actualizada'}`,
                description: `Tu reserva para el servicio: ${updated.service.title} con ${updated.service.provider.name} ha sido ${statusText}.`,
                type: 'RESERVATION',
            });
        }
        catch (err) {
            console.error('Error creating status update notification for client:', err);
        }
        return updated;
    }
};
exports.ProfessionalsService = ProfessionalsService;
exports.ProfessionalsService = ProfessionalsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], ProfessionalsService);
//# sourceMappingURL=professionals.service.js.map