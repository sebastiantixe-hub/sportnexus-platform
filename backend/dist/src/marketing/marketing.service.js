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
exports.MarketingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const notifications_service_1 = require("../notifications/notifications.service");
const email_service_1 = require("../notifications/email.service");
let MarketingService = class MarketingService {
    prisma;
    notificationsService;
    emailService;
    constructor(prisma, notificationsService, emailService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
        this.emailService = emailService;
    }
    async createCampaign(gymId, data) {
        let sentCount = 0;
        let recipients = [];
        if (data.sendToAll) {
            const members = await this.prisma.user.findMany({
                where: {
                    userMemberships: { some: { plan: { gymId }, status: 'ACTIVE' } }
                },
                select: { email: true }
            });
            recipients = members.map(m => m.email);
        }
        else if (data.toEmail) {
            recipients = [data.toEmail];
        }
        if (recipients.length > 0 && (!data.type || data.type === 'EMAIL')) {
            try {
                const sendPromises = recipients.map(recipient => this.emailService.sendMarketingCampaign(recipient, {
                    name: recipient,
                    subject: data.subject || data.title,
                    headline: data.subject || '¡Tenemos novedades para ti!',
                    body: data.content,
                    ctaText: 'Ir a la Plataforma',
                    ctaUrl: process.env.FRONTEND_URL || 'https://hercix.com'
                }).then(() => sentCount++)
                    .catch(err => console.error("Error en campaña individual", err)));
                await Promise.all(sendPromises);
                const usersToNotify = await this.prisma.user.findMany({
                    where: {
                        userMemberships: { some: { plan: { gymId }, status: 'ACTIVE' } }
                    }
                });
                for (const user of usersToNotify) {
                    await this.notificationsService.create(user.id, {
                        title: data.title || data.subject,
                        description: `Nueva comunicación: ${data.subject}`,
                        type: 'CAMPAIGN'
                    });
                }
            }
            catch (error) {
                console.error('Error enviando campaña masiva:', error);
            }
        }
        const campaign = await this.prisma.marketingCampaign.create({
            data: {
                gymId,
                title: data.title,
                subject: data.subject,
                content: data.content,
                type: data.type || client_1.CampaignType.EMAIL,
                status: client_1.CampaignStatus.SENT,
                sentCount: sentCount,
                scheduledAt: new Date(),
            },
        });
        return campaign;
    }
    async getCampaigns(gymId) {
        return this.prisma.marketingCampaign.findMany({
            where: { gymId },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.MarketingService = MarketingService;
exports.MarketingService = MarketingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService,
        email_service_1.EmailService])
], MarketingService);
//# sourceMappingURL=marketing.service.js.map