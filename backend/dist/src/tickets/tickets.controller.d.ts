import { TicketsService } from './tickets.service';
import { CreateTicketDto, ReplyTicketDto } from './dto/ticket.dto';
import { TicketStatus } from '@prisma/client';
export declare class TicketsController {
    private readonly ticketsService;
    constructor(ticketsService: TicketsService);
    create(user: any, dto: CreateTicketDto): Promise<{
        user: {
            name: string;
            email: string;
        };
    } & {
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        status: import("@prisma/client").$Enums.TicketStatus;
        gymId: string | null;
        category: import("@prisma/client").$Enums.TicketCategory;
        subject: string;
        adminReply: string | null;
        repliedAt: Date | null;
    }>;
    findAll(status?: TicketStatus): Promise<({
        user: {
            name: string;
            email: string;
            role: import("@prisma/client").$Enums.UserRole;
        };
    } & {
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        status: import("@prisma/client").$Enums.TicketStatus;
        gymId: string | null;
        category: import("@prisma/client").$Enums.TicketCategory;
        subject: string;
        adminReply: string | null;
        repliedAt: Date | null;
    })[]>;
    getStats(): Promise<{
        open: number;
        inReview: number;
        resolved: number;
        total: number;
    }>;
    findMine(user: any): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        status: import("@prisma/client").$Enums.TicketStatus;
        gymId: string | null;
        category: import("@prisma/client").$Enums.TicketCategory;
        subject: string;
        adminReply: string | null;
        repliedAt: Date | null;
    }[]>;
    reply(id: string, dto: ReplyTicketDto): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        status: import("@prisma/client").$Enums.TicketStatus;
        gymId: string | null;
        category: import("@prisma/client").$Enums.TicketCategory;
        subject: string;
        adminReply: string | null;
        repliedAt: Date | null;
    }>;
    updateStatus(id: string, status: TicketStatus): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        status: import("@prisma/client").$Enums.TicketStatus;
        gymId: string | null;
        category: import("@prisma/client").$Enums.TicketCategory;
        subject: string;
        adminReply: string | null;
        repliedAt: Date | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        status: import("@prisma/client").$Enums.TicketStatus;
        gymId: string | null;
        category: import("@prisma/client").$Enums.TicketCategory;
        subject: string;
        adminReply: string | null;
        repliedAt: Date | null;
    }>;
}
