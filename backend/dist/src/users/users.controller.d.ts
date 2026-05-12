import { UsersService } from './users.service';
import { CreateUserAdminDto } from './dto/user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
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
