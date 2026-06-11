import { UsersService } from './users.service';
import { CreateUserAdminDto } from './dto/user.dto';
import { UserRole } from '@prisma/client';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
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
    findOneProfile(id: string): Promise<{
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
    update(id: string, updateDto: {
        name: string;
        email: string;
        phone?: string;
        dni?: string;
        role: UserRole;
        isActive: boolean;
    }): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        email: string;
        role: import("@prisma/client").$Enums.UserRole;
        phone: string | null;
        dni: string | null;
        isActive: boolean;
    }>;
    createRoleRequest(user: {
        id: string;
    }, dto: {
        requestedRole: UserRole;
        reason?: string;
    }): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        requestedRole: import("@prisma/client").$Enums.UserRole;
        reason: string | null;
        adminNote: string | null;
    }>;
    getMyRoleRequest(user: {
        id: string;
    }): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        requestedRole: import("@prisma/client").$Enums.UserRole;
        reason: string | null;
        adminNote: string | null;
    } | null>;
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
    approveRoleRequest(id: string, dto: {
        adminNote?: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    rejectRoleRequest(id: string, dto: {
        adminNote?: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
}
