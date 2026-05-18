import { PrismaService } from '../prisma/prisma.service';
import { CreateHealthMetricDto } from './dto/create-health-metric.dto';
export declare class HealthService {
    private prisma;
    constructor(prisma: PrismaService);
    createOrUpdate(userId: string, dto: CreateHealthMetricDto): Promise<{
        id: string;
        userId: string;
        date: Date;
        createdAt: Date;
        type: import("@prisma/client").$Enums.HealthMetricType;
        value: number;
        unit: string;
    }>;
    findAll(userId: string): Promise<{
        id: string;
        userId: string;
        date: Date;
        createdAt: Date;
        type: import("@prisma/client").$Enums.HealthMetricType;
        value: number;
        unit: string;
    }[]>;
    calculateCaloriesFromClass(userId: string, classTitle: string, durationMin: number): Promise<{
        id: string;
        userId: string;
        date: Date;
        createdAt: Date;
        type: import("@prisma/client").$Enums.HealthMetricType;
        value: number;
        unit: string;
    } | null>;
}
