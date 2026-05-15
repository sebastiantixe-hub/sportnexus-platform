import { EventsService } from './events.service';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';
export declare class EventsController {
    private readonly eventsService;
    constructor(eventsService: EventsService);
    create(req: any, createDto: CreateEventDto): Promise<{
        id: string;
        date: Date;
        createdAt: Date;
        isActive: boolean;
        title: string;
        description: string | null;
        eventType: import("@prisma/client").$Enums.EventType;
        price: import("@prisma/client/runtime/library").Decimal;
        location: string | null;
        capacity: number | null;
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
        title: string;
        description: string | null;
        eventType: import("@prisma/client").$Enums.EventType;
        price: import("@prisma/client/runtime/library").Decimal;
        location: string | null;
        capacity: number | null;
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
        title: string;
        description: string | null;
        eventType: import("@prisma/client").$Enums.EventType;
        price: import("@prisma/client/runtime/library").Decimal;
        location: string | null;
        capacity: number | null;
        organizerId: string;
    }>;
    update(id: string, req: any, updateDto: UpdateEventDto): Promise<{
        id: string;
        date: Date;
        createdAt: Date;
        isActive: boolean;
        title: string;
        description: string | null;
        eventType: import("@prisma/client").$Enums.EventType;
        price: import("@prisma/client/runtime/library").Decimal;
        location: string | null;
        capacity: number | null;
        organizerId: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        date: Date;
        createdAt: Date;
        isActive: boolean;
        title: string;
        description: string | null;
        eventType: import("@prisma/client").$Enums.EventType;
        price: import("@prisma/client/runtime/library").Decimal;
        location: string | null;
        capacity: number | null;
        organizerId: string;
    }>;
}
