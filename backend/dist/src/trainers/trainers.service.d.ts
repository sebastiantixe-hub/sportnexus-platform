import { PrismaService } from '../prisma/prisma.service';
import { UpdateTrainerProfileDto } from './dto/trainer.dto';
export declare class TrainersService {
    private prisma;
    constructor(prisma: PrismaService);
    upsertProfile(userId: string, dto: UpdateTrainerProfileDto): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        userId: string;
        bio: string | null;
        specialties: string[];
        certifications: string[];
        experienceYears: number;
        hourlyRate: import("@prisma/client/runtime/library").Decimal | null;
        rating: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<({
        user: {
            id: string;
            name: string;
            email: string;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        userId: string;
        bio: string | null;
        specialties: string[];
        certifications: string[];
        experienceYears: number;
        hourlyRate: import("@prisma/client/runtime/library").Decimal | null;
        rating: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    assignToGym(gymId: string, currentOwnerId: string, trainerUserId: string, canCreateClasses: boolean): Promise<{
        id: string;
        gymId: string;
        trainerId: string;
        canCreateClasses: boolean;
        joinedAt: Date;
    }>;
    getGymTrainers(gymId: string): Promise<({
        trainer: {
            user: {
                id: string;
                name: string;
                email: string;
                avatarUrl: string | null;
            };
        } & {
            id: string;
            userId: string;
            bio: string | null;
            specialties: string[];
            certifications: string[];
            experienceYears: number;
            hourlyRate: import("@prisma/client/runtime/library").Decimal | null;
            rating: import("@prisma/client/runtime/library").Decimal;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        gymId: string;
        trainerId: string;
        canCreateClasses: boolean;
        joinedAt: Date;
    })[]>;
    unassignTrainer(gymId: string, currentOwnerId: string, trainerId: string): Promise<{
        id: string;
        gymId: string;
        trainerId: string;
        canCreateClasses: boolean;
        joinedAt: Date;
    }>;
}
