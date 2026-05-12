import { TicketCategory } from '@prisma/client';
export declare class CreateTicketDto {
    subject: string;
    description: string;
    category?: TicketCategory;
    gymId?: string;
}
export declare class ReplyTicketDto {
    adminReply: string;
}
