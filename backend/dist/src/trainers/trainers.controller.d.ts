import { TrainersService } from './trainers.service';
import { AssignTrainerDto, UpdateTrainerProfileDto } from './dto/trainer.dto';
export declare class TrainersController {
    private readonly trainersService;
    constructor(trainersService: TrainersService);
    upsertProfile(user: any, updateTrainerProfileDto: UpdateTrainerProfileDto): Promise<{
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
    assignToGym(gymId: string, user: any, assignTrainerDto: AssignTrainerDto): Promise<{
        id: string;
        canCreateClasses: boolean;
        joinedAt: Date;
        gymId: string;
        trainerId: string;
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
    unassignTrainer(gymId: string, trainerId: string, user: any): Promise<{
        id: string;
        canCreateClasses: boolean;
        joinedAt: Date;
        gymId: string;
        trainerId: string;
    }>;
    requestLink(gymId: string, user: any): Promise<{
        id: string;
        gymId: string;
        gymName: string;
        trainerUserId: string;
        trainerName: string;
        trainerEmail: string;
        createdAt: string;
    }>;
    getOwnerRequests(user: any): Promise<any[]>;
    getMyRequests(user: any): Promise<any[]>;
    respondRequest(requestId: string, approve: boolean, user: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
