import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '../notifications/email.service';
export declare class MarketingService {
    private readonly prisma;
    private readonly notificationsService;
    private readonly emailService;
    constructor(prisma: PrismaService, notificationsService: NotificationsService, emailService: EmailService);
    createCampaign(gymId: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.CampaignStatus;
        gymId: string;
        title: string;
        scheduledAt: Date | null;
        type: import("@prisma/client").$Enums.CampaignType;
        subject: string | null;
        content: string;
        sentCount: number;
    }>;
    getCampaigns(gymId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.CampaignStatus;
        gymId: string;
        title: string;
        scheduledAt: Date | null;
        type: import("@prisma/client").$Enums.CampaignType;
        subject: string | null;
        content: string;
        sentCount: number;
    }[]>;
}
