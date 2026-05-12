import { ProfessionalsService } from './professionals.service';
import { CreateProfessionalDto, UpdateProfessionalDto } from './dto/professional.dto';
export declare class ProfessionalsController {
    private readonly professionalsService;
    constructor(professionalsService: ProfessionalsService);
    create(req: any, createDto: CreateProfessionalDto): Promise<{
        id: string;
        createdAt: Date;
        isActive: boolean;
        description: string | null;
        title: string;
        durationMin: number;
        price: import("@prisma/client/runtime/library").Decimal;
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
        description: string | null;
        title: string;
        durationMin: number;
        price: import("@prisma/client/runtime/library").Decimal;
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
        description: string | null;
        title: string;
        durationMin: number;
        price: import("@prisma/client/runtime/library").Decimal;
        serviceType: import("@prisma/client").$Enums.ServiceType;
        providerId: string;
    }>;
    update(id: string, req: any, updateDto: UpdateProfessionalDto): Promise<{
        id: string;
        createdAt: Date;
        isActive: boolean;
        description: string | null;
        title: string;
        durationMin: number;
        price: import("@prisma/client/runtime/library").Decimal;
        serviceType: import("@prisma/client").$Enums.ServiceType;
        providerId: string;
    }>;
    remove(id: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        isActive: boolean;
        description: string | null;
        title: string;
        durationMin: number;
        price: import("@prisma/client/runtime/library").Decimal;
        serviceType: import("@prisma/client").$Enums.ServiceType;
        providerId: string;
    }>;
    bookService(id: string, req: any, notes: string): Promise<{
        service: {
            id: string;
            createdAt: Date;
            isActive: boolean;
            description: string | null;
            title: string;
            durationMin: number;
            price: import("@prisma/client/runtime/library").Decimal;
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
    getMyBookings(req: any): Promise<({
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
            description: string | null;
            title: string;
            durationMin: number;
            price: import("@prisma/client/runtime/library").Decimal;
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
