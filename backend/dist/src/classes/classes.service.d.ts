import { PrismaService } from '../prisma/prisma.service';
import { CreateClassDto, UpdateClassDto } from './dto/class.dto';
import { NotificationsService } from '../notifications/notifications.service';
export declare class ClassesService {
    private prisma;
    private notificationsService;
    constructor(prisma: PrismaService, notificationsService: NotificationsService);
    create(gymId: string, currentUserId: string, dto: CreateClassDto): Promise<{
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
    findAll(gymId?: string): Promise<({
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
    book(userId: string, classId: string): Promise<{
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
    cancelBooking(userId: string, classId: string): Promise<{
        id: string;
        userId: string;
        status: import("@prisma/client").$Enums.ReservationStatus;
        bookedAt: Date;
        cancelledAt: Date | null;
        notes: string | null;
        classId: string;
    }>;
    markAttendance(reservationId: string, currentUserId: string): Promise<{
        id: string;
        userId: string;
        status: import("@prisma/client").$Enums.ReservationStatus;
        bookedAt: Date;
        cancelledAt: Date | null;
        notes: string | null;
        classId: string;
    }>;
    update(id: string, currentUserId: string, dto: UpdateClassDto): Promise<{
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
    remove(id: string, currentUserId: string): Promise<{
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
