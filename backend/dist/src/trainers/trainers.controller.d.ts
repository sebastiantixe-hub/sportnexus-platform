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
        bio: string | null;
        specialties: string[];
        certifications: string[];
        experienceYears: number;
        hourlyRate: import("@prisma/client/runtime/library").Decimal | null;
        rating: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
    }>;
    assignToGym(gymId: string, user: any, assignTrainerDto: AssignTrainerDto): Promise<{
        id: string;
        gymId: string;
        trainerId: string;
        canCreateClasses: boolean;
        joinedAt: Date;
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
    unassignTrainer(gymId: string, trainerId: string, user: any): Promise<{
        id: string;
        gymId: string;
        trainerId: string;
        canCreateClasses: boolean;
        joinedAt: Date;
    }>;
}
