import { UserRole } from '@prisma/client';
export declare class CreateUserAdminDto {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    phone?: string;
}
