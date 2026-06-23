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
    findMETs(): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        metValue: number;
        intensity: string;
        defaultDuration: number;
    }[]>;
    createOrUpdateMET(dto: {
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
    findGoal(userId: string): Promise<{
        id: string;
        userId: string;
        targetCalories: number;
        targetSteps: number;
        targetWater: number;
        targetWeight: number | null;
    }>;
    createOrUpdateGoal(userId: string, dto: {
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
    createRecommendation(coachId: string, athleteId: string, observation: string): Promise<{
        id: string;
        createdAt: Date;
        observation: string;
        coachId: string;
        athleteId: string;
    }>;
    findRecommendations(athleteId: string): Promise<({
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
    getCoachAthletes(coachId: string): Promise<{
        id: any;
        name: any;
        email: any;
        weight: any;
        avatarUrl: any;
        totalCaloriesBurned: any;
        averageSteps: number;
        lastObservation: any;
        trainedToday: boolean;
        todaySteps: any;
        todayCalories: number;
        todayWater: any;
        lastActivityDate: any;
    }[]>;
    getOwnerStats(ownerId: string): Promise<{
        gymCount: number;
        activeAthletes: number;
        totalCaloriesBurnedInClasses: number;
        averageClassDuration: number;
    }>;
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
