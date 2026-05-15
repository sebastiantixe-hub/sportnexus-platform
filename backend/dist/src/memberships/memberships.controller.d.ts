import { MembershipsService } from './memberships.service';
import { CreateMembershipPlanDto, SubscribeDto } from './dto/membership.dto';
export declare class MembershipsController {
    private readonly membershipsService;
    constructor(membershipsService: MembershipsService);
    createPlan(gymId: string, user: any, dto: CreateMembershipPlanDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        isActive: boolean;
        updatedAt: Date;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        gymId: string;
        durationDays: number;
        maxClasses: number | null;
        includesMarketplace: boolean;
    }>;
    findAllPlans(gymId?: string): Promise<({
        gym: {
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        name: string;
        isActive: boolean;
        updatedAt: Date;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        gymId: string;
        durationDays: number;
        maxClasses: number | null;
        includesMarketplace: boolean;
    })[]>;
    subscribe(user: any, dto: SubscribeDto): Promise<{
        plan: {
            id: string;
            createdAt: Date;
            name: string;
            isActive: boolean;
            updatedAt: Date;
            description: string | null;
            price: import("@prisma/client/runtime/library").Decimal;
            gymId: string;
            durationDays: number;
            maxClasses: number | null;
            includesMarketplace: boolean;
        };
    } & {
        id: string;
        userId: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.MembershipStatus;
        expiresAt: Date;
        planId: string;
        startedAt: Date;
        classesUsed: number;
    }>;
    getMyMemberships(user: any): Promise<({
        plan: {
            gym: {
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            name: string;
            isActive: boolean;
            updatedAt: Date;
            description: string | null;
            price: import("@prisma/client/runtime/library").Decimal;
            gymId: string;
            durationDays: number;
            maxClasses: number | null;
            includesMarketplace: boolean;
        };
    } & {
        id: string;
        userId: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.MembershipStatus;
        expiresAt: Date;
        planId: string;
        startedAt: Date;
        classesUsed: number;
    })[]>;
}
