import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto, ReplyTicketDto } from './dto/ticket.dto';
import { TicketStatus } from '@prisma/client';
export declare class TicketsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateTicketDto): Promise<{
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
    findMine(userId: string): Promise<{
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
    reply(ticketId: string, dto: ReplyTicketDto): Promise<{
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
    updateStatus(ticketId: string, status: TicketStatus): Promise<{
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
    remove(ticketId: string): Promise<{
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
    getStats(): Promise<{
        open: number;
        inReview: number;
        resolved: number;
        total: number;
    }>;
}
