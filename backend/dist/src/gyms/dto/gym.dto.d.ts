import { GymStatus } from '@prisma/client';
export declare class CreateGymDto {
    latitude?: number;
    longitude?: number;
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
    logoUrl?: string;
}
export declare class UpdateGymDto {
    latitude?: number;
    longitude?: number;
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
    logoUrl?: string;
}
