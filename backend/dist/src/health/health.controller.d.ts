import { HealthService } from './health.service';
import { CreateHealthMetricDto } from './dto/create-health-metric.dto';
export declare class HealthController {
    private readonly healthService;
    constructor(healthService: HealthService);
    create(req: any, dto: CreateHealthMetricDto): Promise<{
        id: string;
        userId: string;
        date: Date;
        createdAt: Date;
        type: import("@prisma/client").$Enums.HealthMetricType;
        value: number;
        unit: string;
    }>;
    findAll(req: any): Promise<{
        id: string;
        userId: string;
        date: Date;
        createdAt: Date;
        type: import("@prisma/client").$Enums.HealthMetricType;
        value: number;
        unit: string;
    }[]>;
}
