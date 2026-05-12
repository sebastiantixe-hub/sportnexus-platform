import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';
export declare class EventsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(organizerId: string, createDto: CreateEventDto): Promise<{
        id: string;
        date: Date;
        createdAt: Date;
        isActive: boolean;
        description: string | null;
        title: string;
        capacity: number | null;
        price: import("@prisma/client/runtime/library").Decimal;
        location: string | null;
        eventType: import("@prisma/client").$Enums.EventType;
        organizerId: string;
    }>;
    findAll(): Promise<({
        organizer: {
            id: string;
            name: string;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        date: Date;
        createdAt: Date;
        isActive: boolean;
        description: string | null;
        title: string;
        capacity: number | null;
        price: import("@prisma/client/runtime/library").Decimal;
        location: string | null;
        eventType: import("@prisma/client").$Enums.EventType;
        organizerId: string;
    })[]>;
    findOne(id: string): Promise<{
        organizer: {
            id: string;
            name: string;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        date: Date;
        createdAt: Date;
        isActive: boolean;
        description: string | null;
        title: string;
        capacity: number | null;
        price: import("@prisma/client/runtime/library").Decimal;
        location: string | null;
        eventType: import("@prisma/client").$Enums.EventType;
        organizerId: string;
    }>;
    update(id: string, currentUserId: string, updateDto: UpdateEventDto, isAdmin: boolean): Promise<{
        id: string;
        date: Date;
        createdAt: Date;
        isActive: boolean;
        description: string | null;
        title: string;
        capacity: number | null;
        price: import("@prisma/client/runtime/library").Decimal;
        location: string | null;
        eventType: import("@prisma/client").$Enums.EventType;
        organizerId: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        date: Date;
        createdAt: Date;
        isActive: boolean;
        description: string | null;
        title: string;
        capacity: number | null;
        price: import("@prisma/client/runtime/library").Decimal;
        location: string | null;
        eventType: import("@prisma/client").$Enums.EventType;
        organizerId: string;
    }>;
}
