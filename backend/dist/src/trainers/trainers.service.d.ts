import { PrismaService } from '../prisma/prisma.service';
import { UpdateTrainerProfileDto } from './dto/trainer.dto';
export declare class TrainersService {
    private prisma;
    constructor(prisma: PrismaService);
    private readonly filepath;
    private readPendingRequests;
    private writePendingRequests;
    upsertProfile(userId: string, dto: UpdateTrainerProfileDto): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        bio: string | null;
        specialties: string[];
        certifications: string[];
        experienceYears: number;
        hourlyRate: import("@prisma/client/runtime/library").Decimal | null;
        rating: import("@prisma/client/runtime/library").Decimal;
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
        createdAt: Date;
        updatedAt: Date;
        bio: string | null;
        specialties: string[];
        certifications: string[];
        experienceYears: number;
        hourlyRate: import("@prisma/client/runtime/library").Decimal | null;
        rating: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    assignToGym(gymId: string, currentOwnerId: string, trainerUserId: string, canCreateClasses: boolean): Promise<{
        id: string;
        canCreateClasses: boolean;
        joinedAt: Date;
        gymId: string;
        trainerId: string;
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
            createdAt: Date;
            updatedAt: Date;
            bio: string | null;
            specialties: string[];
            certifications: string[];
            experienceYears: number;
            hourlyRate: import("@prisma/client/runtime/library").Decimal | null;
            rating: import("@prisma/client/runtime/library").Decimal;
        };
    } & {
        id: string;
        canCreateClasses: boolean;
        joinedAt: Date;
        gymId: string;
        trainerId: string;
    })[]>;
    unassignTrainer(gymId: string, currentOwnerId: string, trainerId: string): Promise<{
        id: string;
        canCreateClasses: boolean;
        joinedAt: Date;
        gymId: string;
        trainerId: string;
    }>;
    requestLinkToGym(gymId: string, trainerUserId: string): Promise<{
        id: string;
        gymId: string;
        gymName: string;
        trainerUserId: string;
        trainerName: string;
        trainerEmail: string;
        createdAt: string;
    }>;
    getPendingRequestsForOwner(ownerUserId: string): Promise<any[]>;
    getPendingRequestsForTrainer(trainerUserId: string): Promise<any[]>;
    respondToRequest(requestId: string, ownerUserId: string, approve: boolean): Promise<{
        success: boolean;
        message: string;
    }>;
}
