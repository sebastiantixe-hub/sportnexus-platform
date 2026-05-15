import { GymStatus } from '@prisma/client';
export declare class CreateGymDto {
    name: string;
    description?: string;
    address?: string;
    city?: string;
    district?: string;
    province?: string;
    country?: string;
    phone?: string;
    email?: string;
    website?: string;
    openTime?: string;
    closeTime?: string;
    openDays?: string;
}
export declare class UpdateGymDto {
    name?: string;
    description?: string;
    address?: string;
    city?: string;
    district?: string;
    province?: string;
    country?: string;
    phone?: string;
    email?: string;
    website?: string;
    openTime?: string;
    closeTime?: string;
    openDays?: string;
    status?: GymStatus;
}
