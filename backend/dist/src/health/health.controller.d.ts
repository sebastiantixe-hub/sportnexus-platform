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
    findGoal(req: any): Promise<{
        id: string;
        userId: string;
        targetCalories: number;
        targetSteps: number;
        targetWater: number;
        targetWeight: number | null;
    }>;
    updateGoal(req: any, dto: {
        targetCalories: number;
        targetSteps: number;
        targetWater: number;
        targetWeight?: number;
    }): Promise<{
        id: string;
        userId: string;
        targetCalories: number;
        targetSteps: number;
        targetWater: number;
        targetWeight: number | null;
    }>;
    getMETs(): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        metValue: number;
        intensity: string;
        defaultDuration: number;
    }[]>;
    upsertMET(dto: {
        name: string;
        metValue: number;
        intensity: string;
        defaultDuration?: number;
    }): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        metValue: number;
        intensity: string;
        defaultDuration: number;
    }>;
    deleteMET(id: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        metValue: number;
        intensity: string;
        defaultDuration: number;
    }>;
    addRecommendation(req: any, dto: {
        athleteId: string;
        observation: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        observation: string;
        coachId: string;
        athleteId: string;
    }>;
    getRecommendations(athleteId: string): Promise<({
        coach: {
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        observation: string;
        coachId: string;
        athleteId: string;
    })[]>;
    getCoachAthletes(req: any): Promise<{
        id: string;
        name: string;
        email: string;
        weight: number;
        avatarUrl: string | null;
        totalCaloriesBurned: number;
        averageSteps: number;
        lastObservation: string;
    }[]>;
    getOwnerStats(req: any): Promise<{
        gymCount: number;
        activeAthletes: number;
        totalCaloriesBurnedInClasses: number;
        averageClassDuration: number;
    }>;
}
