import { PrismaService } from '../prisma/prisma.service';
import { CreateUserAdminDto } from './dto/user.dto';
import { UserRole } from '@prisma/client';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        email: string;
        role: import("@prisma/client").$Enums.UserRole;
        phone: string | null;
        dni: string | null;
        avatarUrl: string | null;
        isActive: boolean;
        lastLoginAt: Date | null;
    }[]>;
    findOneProfile(userId: string): Promise<{
        roleData: any;
        id: string;
        createdAt: Date;
        name: string;
        email: string;
        role: import("@prisma/client").$Enums.UserRole;
        phone: string | null;
        dni: string | null;
        avatarUrl: string | null;
        isActive: boolean;
        emailVerified: boolean;
        lastLoginAt: Date | null;
        weight: number | null;
    }>;
    create(createDto: CreateUserAdminDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        email: string;
        role: import("@prisma/client").$Enums.UserRole;
    }>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    updateLastLogin(userId: string): Promise<void>;
    createRoleRequest(userId: string, requestedRole: UserRole, reason?: string): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        requestedRole: import("@prisma/client").$Enums.UserRole;
        reason: string | null;
        adminNote: string | null;
    }>;
    getAllRoleRequests(): Promise<({
        user: {
            id: string;
            name: string;
            email: string;
            role: import("@prisma/client").$Enums.UserRole;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        requestedRole: import("@prisma/client").$Enums.UserRole;
        reason: string | null;
        adminNote: string | null;
    })[]>;
    approveRoleRequest(requestId: string, adminNote?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    rejectRoleRequest(requestId: string, adminNote?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getMyRoleRequest(userId: string): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        requestedRole: import("@prisma/client").$Enums.UserRole;
        reason: string | null;
        adminNote: string | null;
    } | null>;
}
