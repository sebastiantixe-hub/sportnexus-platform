import { PrismaService } from '../prisma/prisma.service';
import { CreateProfessionalDto, UpdateProfessionalDto } from './dto/professional.dto';
export declare class ProfessionalsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(providerId: string, createDto: CreateProfessionalDto): Promise<{
        id: string;
        createdAt: Date;
        isActive: boolean;
        title: string;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        durationMin: number;
        serviceType: import("@prisma/client").$Enums.ServiceType;
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
        createdAt: Date;
        isActive: boolean;
        title: string;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        durationMin: number;
        serviceType: import("@prisma/client").$Enums.ServiceType;
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
        createdAt: Date;
        isActive: boolean;
        title: string;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        durationMin: number;
        serviceType: import("@prisma/client").$Enums.ServiceType;
        providerId: string;
    }>;
    update(id: string, currentUserId: string, updateDto: UpdateProfessionalDto, isAdmin: boolean): Promise<{
        id: string;
        createdAt: Date;
        isActive: boolean;
        title: string;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        durationMin: number;
        serviceType: import("@prisma/client").$Enums.ServiceType;
        providerId: string;
    }>;
    remove(id: string, currentUserId: string, isAdmin: boolean): Promise<{
        id: string;
        createdAt: Date;
        isActive: boolean;
        title: string;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        durationMin: number;
        serviceType: import("@prisma/client").$Enums.ServiceType;
        providerId: string;
    }>;
    bookService(userId: string, serviceId: string, notes?: string): Promise<{
        service: {
            id: string;
            createdAt: Date;
            isActive: boolean;
            title: string;
            description: string | null;
            price: import("@prisma/client/runtime/library").Decimal;
            durationMin: number;
            serviceType: import("@prisma/client").$Enums.ServiceType;
            providerId: string;
        };
    } & {
        id: string;
        userId: string;
        status: string;
        bookedAt: Date;
        notes: string | null;
        serviceId: string;
    }>;
    getMyBookings(userId: string): Promise<({
        service: {
            provider: {
                id: string;
                createdAt: Date;
                name: string;
                auth0Id: string | null;
                email: string;
                passwordHash: string | null;
                role: import("@prisma/client").$Enums.UserRole;
                phone: string | null;
                avatarUrl: string | null;
                isActive: boolean;
                emailVerified: boolean;
                updatedAt: Date;
            };
        } & {
            id: string;
            createdAt: Date;
            isActive: boolean;
            title: string;
            description: string | null;
            price: import("@prisma/client/runtime/library").Decimal;
            durationMin: number;
            serviceType: import("@prisma/client").$Enums.ServiceType;
            providerId: string;
        };
    } & {
        id: string;
        userId: string;
        status: string;
        bookedAt: Date;
        notes: string | null;
        serviceId: string;
    })[]>;
}
