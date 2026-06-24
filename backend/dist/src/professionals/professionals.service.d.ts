import { PrismaService } from '../prisma/prisma.service';
import { CreateProfessionalDto, UpdateProfessionalDto } from './dto/professional.dto';
import { NotificationsService } from '../notifications/notifications.service';
export declare class ProfessionalsService {
    private prisma;
    private notificationsService;
    constructor(prisma: PrismaService, notificationsService: NotificationsService);
    create(providerId: string, createDto: CreateProfessionalDto): Promise<{
        id: string;
        title: string;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        serviceType: import("@prisma/client").$Enums.ServiceType;
        durationMin: number;
        isActive: boolean;
        createdAt: Date;
        providerId: string;
    }>;
    findAll(): Promise<({
        provider: {
            id: string;
            name: string;
            email: string;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        title: string;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        serviceType: import("@prisma/client").$Enums.ServiceType;
        durationMin: number;
        isActive: boolean;
        createdAt: Date;
        providerId: string;
    })[]>;
    findOne(id: string): Promise<{
        provider: {
            id: string;
            name: string;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        title: string;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        serviceType: import("@prisma/client").$Enums.ServiceType;
        durationMin: number;
        isActive: boolean;
        createdAt: Date;
        providerId: string;
    }>;
    update(id: string, currentUserId: string, updateDto: UpdateProfessionalDto, isAdmin: boolean): Promise<{
        id: string;
        title: string;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        serviceType: import("@prisma/client").$Enums.ServiceType;
        durationMin: number;
        isActive: boolean;
        createdAt: Date;
        providerId: string;
    }>;
    remove(id: string, currentUserId: string, isAdmin: boolean): Promise<{
        id: string;
        title: string;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        serviceType: import("@prisma/client").$Enums.ServiceType;
        durationMin: number;
        isActive: boolean;
        createdAt: Date;
        providerId: string;
    }>;
    bookService(userId: string, serviceId: string, notes?: string): Promise<{
        user: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            name: string;
            auth0Id: string | null;
            email: string;
            passwordHash: string | null;
            role: import("@prisma/client").$Enums.UserRole;
            phone: string | null;
            dni: string | null;
            avatarUrl: string | null;
            emailVerified: boolean;
            lastLoginAt: Date | null;
            updatedAt: Date;
            weight: number | null;
        };
        service: {
            provider: {
                id: string;
                isActive: boolean;
                createdAt: Date;
                name: string;
                auth0Id: string | null;
                email: string;
                passwordHash: string | null;
                role: import("@prisma/client").$Enums.UserRole;
                phone: string | null;
                dni: string | null;
                avatarUrl: string | null;
                emailVerified: boolean;
                lastLoginAt: Date | null;
                updatedAt: Date;
                weight: number | null;
            };
        } & {
            id: string;
            title: string;
            description: string | null;
            price: import("@prisma/client/runtime/library").Decimal;
            serviceType: import("@prisma/client").$Enums.ServiceType;
            durationMin: number;
            isActive: boolean;
            createdAt: Date;
            providerId: string;
        };
    } & {
        id: string;
        status: string;
        bookedAt: Date;
        notes: string | null;
        userId: string;
        serviceId: string;
    }>;
    getMyBookings(userId: string): Promise<({
        service: {
            provider: {
                id: string;
                isActive: boolean;
                createdAt: Date;
                name: string;
                auth0Id: string | null;
                email: string;
                passwordHash: string | null;
                role: import("@prisma/client").$Enums.UserRole;
                phone: string | null;
                dni: string | null;
                avatarUrl: string | null;
                emailVerified: boolean;
                lastLoginAt: Date | null;
                updatedAt: Date;
                weight: number | null;
            };
        } & {
            id: string;
            title: string;
            description: string | null;
            price: import("@prisma/client/runtime/library").Decimal;
            serviceType: import("@prisma/client").$Enums.ServiceType;
            durationMin: number;
            isActive: boolean;
            createdAt: Date;
            providerId: string;
        };
    } & {
        id: string;
        status: string;
        bookedAt: Date;
        notes: string | null;
        userId: string;
        serviceId: string;
    })[]>;
    getProviderBookings(providerId: string): Promise<({
        user: {
            id: string;
            name: string;
            email: string;
            phone: string | null;
        };
        service: {
            id: string;
            title: string;
            description: string | null;
            price: import("@prisma/client/runtime/library").Decimal;
            serviceType: import("@prisma/client").$Enums.ServiceType;
            durationMin: number;
            isActive: boolean;
            createdAt: Date;
            providerId: string;
        };
    } & {
        id: string;
        status: string;
        bookedAt: Date;
        notes: string | null;
        userId: string;
        serviceId: string;
    })[]>;
    updateBookingStatus(bookingId: string, providerId: string, status: string, isAdmin: boolean): Promise<{
        user: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            name: string;
            auth0Id: string | null;
            email: string;
            passwordHash: string | null;
            role: import("@prisma/client").$Enums.UserRole;
            phone: string | null;
            dni: string | null;
            avatarUrl: string | null;
            emailVerified: boolean;
            lastLoginAt: Date | null;
            updatedAt: Date;
            weight: number | null;
        };
        service: {
            provider: {
                id: string;
                isActive: boolean;
                createdAt: Date;
                name: string;
                auth0Id: string | null;
                email: string;
                passwordHash: string | null;
                role: import("@prisma/client").$Enums.UserRole;
                phone: string | null;
                dni: string | null;
                avatarUrl: string | null;
                emailVerified: boolean;
                lastLoginAt: Date | null;
                updatedAt: Date;
                weight: number | null;
            };
        } & {
            id: string;
            title: string;
            description: string | null;
            price: import("@prisma/client/runtime/library").Decimal;
            serviceType: import("@prisma/client").$Enums.ServiceType;
            durationMin: number;
            isActive: boolean;
            createdAt: Date;
            providerId: string;
        };
    } & {
        id: string;
        status: string;
        bookedAt: Date;
        notes: string | null;
        userId: string;
        serviceId: string;
    }>;
}
