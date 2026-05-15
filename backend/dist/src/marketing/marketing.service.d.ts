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
        title: string;
        status: import("@prisma/client").$Enums.CampaignStatus;
        gymId: string;
        scheduledAt: Date | null;
        subject: string | null;
        type: import("@prisma/client").$Enums.CampaignType;
        content: string;
        sentCount: number;
    }>;
    getCampaigns(gymId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        status: import("@prisma/client").$Enums.CampaignStatus;
        gymId: string;
        scheduledAt: Date | null;
        subject: string | null;
        type: import("@prisma/client").$Enums.CampaignType;
        content: string;
        sentCount: number;
    }[]>;
}
