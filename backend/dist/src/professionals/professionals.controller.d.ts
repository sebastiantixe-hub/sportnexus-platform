import { ProfessionalsService } from './professionals.service';
import { CreateProfessionalDto, UpdateProfessionalDto } from './dto/professional.dto';
export declare class ProfessionalsController {
    private readonly professionalsService;
    constructor(professionalsService: ProfessionalsService);
    create(req: any, createDto: CreateProfessionalDto): Promise<{
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
    getMyBookings(req: any): Promise<({
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
    getProviderBookings(req: any): Promise<({
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
    updateBookingStatus(bookingId: string, req: any, status: string): Promise<{
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
    update(id: string, req: any, updateDto: UpdateProfessionalDto): Promise<{
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
    remove(id: string, req: any): Promise<{
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
    bookService(id: string, req: any, notes: string): Promise<{
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
