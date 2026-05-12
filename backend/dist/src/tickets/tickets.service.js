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
exports.TicketsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let TicketsService = class TicketsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        return this.prisma.supportTicket.create({
            data: {
                userId,
                subject: dto.subject,
                description: dto.description,
                category: dto.category ?? 'GENERAL',
                gymId: dto.gymId ?? null,
            },
            include: {
                user: { select: { name: true, email: true } },
            },
        });
    }
    async findAll(status) {
        return this.prisma.supportTicket.findMany({
            where: status ? { status } : {},
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { name: true, email: true, role: true } },
            },
        });
    }
    async findMine(userId) {
        return this.prisma.supportTicket.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async reply(ticketId, dto) {
        const ticket = await this.prisma.supportTicket.findUnique({ where: { id: ticketId } });
        if (!ticket)
            throw new common_1.NotFoundException('Ticket no encontrado');
        return this.prisma.supportTicket.update({
            where: { id: ticketId },
            data: {
                adminReply: dto.adminReply,
                repliedAt: new Date(),
                status: client_1.TicketStatus.IN_REVIEW,
            },
        });
    }
    async updateStatus(ticketId, status) {
        const ticket = await this.prisma.supportTicket.findUnique({ where: { id: ticketId } });
        if (!ticket)
            throw new common_1.NotFoundException('Ticket no encontrado');
        return this.prisma.supportTicket.update({
            where: { id: ticketId },
            data: { status },
        });
    }
    async remove(ticketId) {
        return this.prisma.supportTicket.delete({ where: { id: ticketId } });
    }
    async getStats() {
        const [open, inReview, resolved, total] = await Promise.all([
            this.prisma.supportTicket.count({ where: { status: 'OPEN' } }),
            this.prisma.supportTicket.count({ where: { status: 'IN_REVIEW' } }),
            this.prisma.supportTicket.count({ where: { status: 'RESOLVED' } }),
            this.prisma.supportTicket.count(),
        ]);
        return { open, inReview, resolved, total };
    }
};
exports.TicketsService = TicketsService;
exports.TicketsService = TicketsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TicketsService);
//# sourceMappingURL=tickets.service.js.map