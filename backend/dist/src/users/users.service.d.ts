import { PrismaService } from '../prisma/prisma.service';
import { CreateUserAdminDto } from './dto/user.dto';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        email: string;
        role: import("@prisma/client").$Enums.UserRole;
        isActive: boolean;
    }[]>;
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
}
