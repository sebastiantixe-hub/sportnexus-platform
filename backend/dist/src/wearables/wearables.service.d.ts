import { PrismaService } from '../prisma/prisma.service';
export declare class WearablesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    syncData(userId: string, data: any): Promise<{
        id: string;
        userId: string;
        deviceType: string;
        steps: number;
        heartRateAvg: number | null;
        calories: number;
        date: Date;
        createdAt: Date;
    }>;
    getMetrics(userId: string): Promise<{
        id: string;
        userId: string;
        deviceType: string;
        steps: number;
        heartRateAvg: number | null;
        calories: number;
        date: Date;
        createdAt: Date;
    }[]>;
}
