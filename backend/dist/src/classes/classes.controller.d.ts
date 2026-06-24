import { ClassesService } from './classes.service';
import { CreateClassDto, UpdateClassDto } from './dto/class.dto';
export declare class ClassesController {
    private readonly classesService;
    constructor(classesService: ClassesService);
    create(gymId: string, user: any, createClassDto: CreateClassDto): Promise<{
        id: string;
        title: string;
        description: string | null;
        classType: import("@prisma/client").$Enums.ClassType;
        capacity: number;
        durationMin: number;
        price: import("@prisma/client/runtime/library").Decimal;
        scheduledAt: Date;
        location: string | null;
        meetingUrl: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        gymId: string;
        trainerId: string | null;
    }>;
    findAll(gymId?: string, myReservations?: string, user?: any): Promise<({
        gym: {
            name: string;
            ownerId: string;
            city: string | null;
        };
        trainer: ({
            user: {
                name: string;
                avatarUrl: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            bio: string | null;
            specialties: string[];
            certifications: string[];
            experienceYears: number;
            hourlyRate: import("@prisma/client/runtime/library").Decimal | null;
            rating: import("@prisma/client/runtime/library").Decimal;
        }) | null;
        reservations: {
            id: string;
            userId: string;
            user: {
                id: string;
                name: string;
                email: string;
                role: import("@prisma/client").$Enums.UserRole;
                dni: string | null;
                avatarUrl: string | null;
            };
            status: import("@prisma/client").$Enums.ReservationStatus;
        }[];
        _count: {
            reservations: number;
        };
    } & {
        id: string;
        title: string;
        description: string | null;
        classType: import("@prisma/client").$Enums.ClassType;
        capacity: number;
        durationMin: number;
        price: import("@prisma/client/runtime/library").Decimal;
        scheduledAt: Date;
        location: string | null;
        meetingUrl: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        gymId: string;
        trainerId: string | null;
    })[]>;
    findOne(id: string): Promise<{
        gym: {
            id: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            status: import("@prisma/client").$Enums.GymStatus;
            ownerId: string;
            address: string | null;
            city: string | null;
            district: string | null;
            province: string | null;
            country: string | null;
            latitude: number | null;
            longitude: number | null;
            phone: string | null;
            email: string | null;
            logoUrl: string | null;
            website: string | null;
            openTime: string | null;
            closeTime: string | null;
            openDays: string | null;
        };
        trainer: ({
            user: {
                name: string;
                avatarUrl: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            bio: string | null;
            specialties: string[];
            certifications: string[];
            experienceYears: number;
            hourlyRate: import("@prisma/client/runtime/library").Decimal | null;
            rating: import("@prisma/client/runtime/library").Decimal;
        }) | null;
        reservations: ({
            user: {
                id: string;
                name: string;
                email: string;
                role: import("@prisma/client").$Enums.UserRole;
                dni: string | null;
                avatarUrl: string | null;
            };
        } & {
            id: string;
            userId: string;
            classId: string;
            status: import("@prisma/client").$Enums.ReservationStatus;
            bookedAt: Date;
            cancelledAt: Date | null;
            notes: string | null;
        })[];
    } & {
        id: string;
        title: string;
        description: string | null;
        classType: import("@prisma/client").$Enums.ClassType;
        capacity: number;
        durationMin: number;
        price: import("@prisma/client/runtime/library").Decimal;
        scheduledAt: Date;
        location: string | null;
        meetingUrl: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        gymId: string;
        trainerId: string | null;
    }>;
    book(id: string, user: any): Promise<{
        user: {
            name: string;
        };
        class: {
            gym: {
                id: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                status: import("@prisma/client").$Enums.GymStatus;
                ownerId: string;
                address: string | null;
                city: string | null;
                district: string | null;
                province: string | null;
                country: string | null;
                latitude: number | null;
                longitude: number | null;
                phone: string | null;
                email: string | null;
                logoUrl: string | null;
                website: string | null;
                openTime: string | null;
                closeTime: string | null;
                openDays: string | null;
            };
        } & {
            id: string;
            title: string;
            description: string | null;
            classType: import("@prisma/client").$Enums.ClassType;
            capacity: number;
            durationMin: number;
            price: import("@prisma/client/runtime/library").Decimal;
            scheduledAt: Date;
            location: string | null;
            meetingUrl: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            gymId: string;
            trainerId: string | null;
        };
    } & {
        id: string;
        userId: string;
        classId: string;
        status: import("@prisma/client").$Enums.ReservationStatus;
        bookedAt: Date;
        cancelledAt: Date | null;
        notes: string | null;
    }>;
    cancelBooking(id: string, user: any): Promise<{
        id: string;
        userId: string;
        classId: string;
        status: import("@prisma/client").$Enums.ReservationStatus;
        bookedAt: Date;
        cancelledAt: Date | null;
        notes: string | null;
    }>;
    markAttendance(reservationId: string, user: any): Promise<{
        id: string;
        userId: string;
        classId: string;
        status: import("@prisma/client").$Enums.ReservationStatus;
        bookedAt: Date;
        cancelledAt: Date | null;
        notes: string | null;
    }>;
    unmarkAttendance(reservationId: string, user: any): Promise<{
        id: string;
        userId: string;
        classId: string;
        status: import("@prisma/client").$Enums.ReservationStatus;
        bookedAt: Date;
        cancelledAt: Date | null;
        notes: string | null;
    }>;
    removeReservation(reservationId: string, user: any): Promise<{
        id: string;
        userId: string;
        classId: string;
        status: import("@prisma/client").$Enums.ReservationStatus;
        bookedAt: Date;
        cancelledAt: Date | null;
        notes: string | null;
    }>;
    update(id: string, user: any, updateClassDto: UpdateClassDto): Promise<{
        id: string;
        title: string;
        description: string | null;
        classType: import("@prisma/client").$Enums.ClassType;
        capacity: number;
        durationMin: number;
        price: import("@prisma/client/runtime/library").Decimal;
        scheduledAt: Date;
        location: string | null;
        meetingUrl: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        gymId: string;
        trainerId: string | null;
    }>;
    remove(id: string, user: any): Promise<{
        id: string;
        title: string;
        description: string | null;
        classType: import("@prisma/client").$Enums.ClassType;
        capacity: number;
        durationMin: number;
        price: import("@prisma/client/runtime/library").Decimal;
        scheduledAt: Date;
        location: string | null;
        meetingUrl: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        gymId: string;
        trainerId: string | null;
    }>;
}
