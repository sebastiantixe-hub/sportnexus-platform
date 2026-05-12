import { ClassesService } from './classes.service';
import { CreateClassDto, UpdateClassDto } from './dto/class.dto';
export declare class ClassesController {
    private readonly classesService;
    constructor(classesService: ClassesService);
    create(gymId: string, user: any, createClassDto: CreateClassDto): Promise<{
        id: string;
        createdAt: Date;
        isActive: boolean;
        updatedAt: Date;
        description: string | null;
        gymId: string;
        trainerId: string | null;
        title: string;
        classType: import("@prisma/client").$Enums.ClassType;
        capacity: number;
        durationMin: number;
        price: import("@prisma/client/runtime/library").Decimal;
        scheduledAt: Date;
        location: string | null;
        meetingUrl: string | null;
    }>;
    findAll(gymId?: string, myReservations?: string, user?: any): Promise<({
        reservations: {
            id: string;
            userId: string;
            user: {
                name: string;
            };
            status: import("@prisma/client").$Enums.ReservationStatus;
        }[];
        _count: {
            reservations: number;
        };
        gym: {
            name: string;
            city: string | null;
            ownerId: string;
        };
        trainer: ({
            user: {
                name: string;
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
        }) | null;
    } & {
        id: string;
        createdAt: Date;
        isActive: boolean;
        updatedAt: Date;
        description: string | null;
        gymId: string;
        trainerId: string | null;
        title: string;
        classType: import("@prisma/client").$Enums.ClassType;
        capacity: number;
        durationMin: number;
        price: import("@prisma/client/runtime/library").Decimal;
        scheduledAt: Date;
        location: string | null;
        meetingUrl: string | null;
    })[]>;
    findOne(id: string): Promise<{
        reservations: ({
            user: {
                name: string;
                avatarUrl: string | null;
            };
        } & {
            id: string;
            userId: string;
            status: import("@prisma/client").$Enums.ReservationStatus;
            bookedAt: Date;
            cancelledAt: Date | null;
            notes: string | null;
            classId: string;
        })[];
        gym: {
            id: string;
            createdAt: Date;
            name: string;
            email: string | null;
            phone: string | null;
            updatedAt: Date;
            description: string | null;
            address: string | null;
            city: string | null;
            country: string | null;
            latitude: number | null;
            longitude: number | null;
            logoUrl: string | null;
            website: string | null;
            status: import("@prisma/client").$Enums.GymStatus;
            ownerId: string;
        };
        trainer: ({
            user: {
                name: string;
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
        }) | null;
    } & {
        id: string;
        createdAt: Date;
        isActive: boolean;
        updatedAt: Date;
        description: string | null;
        gymId: string;
        trainerId: string | null;
        title: string;
        classType: import("@prisma/client").$Enums.ClassType;
        capacity: number;
        durationMin: number;
        price: import("@prisma/client/runtime/library").Decimal;
        scheduledAt: Date;
        location: string | null;
        meetingUrl: string | null;
    }>;
    book(id: string, user: any): Promise<{
        user: {
            name: string;
        };
        class: {
            gym: {
                id: string;
                createdAt: Date;
                name: string;
                email: string | null;
                phone: string | null;
                updatedAt: Date;
                description: string | null;
                address: string | null;
                city: string | null;
                country: string | null;
                latitude: number | null;
                longitude: number | null;
                logoUrl: string | null;
                website: string | null;
                status: import("@prisma/client").$Enums.GymStatus;
                ownerId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            isActive: boolean;
            updatedAt: Date;
            description: string | null;
            gymId: string;
            trainerId: string | null;
            title: string;
            classType: import("@prisma/client").$Enums.ClassType;
            capacity: number;
            durationMin: number;
            price: import("@prisma/client/runtime/library").Decimal;
            scheduledAt: Date;
            location: string | null;
            meetingUrl: string | null;
        };
    } & {
        id: string;
        userId: string;
        status: import("@prisma/client").$Enums.ReservationStatus;
        bookedAt: Date;
        cancelledAt: Date | null;
        notes: string | null;
        classId: string;
    }>;
    cancelBooking(id: string, user: any): Promise<{
        id: string;
        userId: string;
        status: import("@prisma/client").$Enums.ReservationStatus;
        bookedAt: Date;
        cancelledAt: Date | null;
        notes: string | null;
        classId: string;
    }>;
    markAttendance(reservationId: string, user: any): Promise<{
        id: string;
        userId: string;
        status: import("@prisma/client").$Enums.ReservationStatus;
        bookedAt: Date;
        cancelledAt: Date | null;
        notes: string | null;
        classId: string;
    }>;
    update(id: string, user: any, updateClassDto: UpdateClassDto): Promise<{
        id: string;
        createdAt: Date;
        isActive: boolean;
        updatedAt: Date;
        description: string | null;
        gymId: string;
        trainerId: string | null;
        title: string;
        classType: import("@prisma/client").$Enums.ClassType;
        capacity: number;
        durationMin: number;
        price: import("@prisma/client/runtime/library").Decimal;
        scheduledAt: Date;
        location: string | null;
        meetingUrl: string | null;
    }>;
    remove(id: string, user: any): Promise<{
        id: string;
        createdAt: Date;
        isActive: boolean;
        updatedAt: Date;
        description: string | null;
        gymId: string;
        trainerId: string | null;
        title: string;
        classType: import("@prisma/client").$Enums.ClassType;
        capacity: number;
        durationMin: number;
        price: import("@prisma/client/runtime/library").Decimal;
        scheduledAt: Date;
        location: string | null;
        meetingUrl: string | null;
    }>;
}
