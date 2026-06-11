import { MarketingService } from './marketing.service';
import { GymsService } from '../gyms/gyms.service';
export declare class MarketingController {
    private readonly marketingService;
    private readonly gymsService;
    constructor(marketingService: MarketingService, gymsService: GymsService);
    createCampaign(gymId: string, data: any, user: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.CampaignStatus;
        title: string;
        gymId: string;
        scheduledAt: Date | null;
        subject: string | null;
        type: import("@prisma/client").$Enums.CampaignType;
        content: string;
        sentCount: number;
    }>;
    getCampaigns(gymId: string, user: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.CampaignStatus;
        title: string;
        gymId: string;
        scheduledAt: Date | null;
        subject: string | null;
        type: import("@prisma/client").$Enums.CampaignType;
        content: string;
        sentCount: number;
    }[]>;
}
