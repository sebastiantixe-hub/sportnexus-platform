import { PrismaService } from './prisma/prisma.service';
export declare class AppController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    healthCheck(): {
        status: string;
        app: string;
        timestamp: string;
    };
    dbDebug(): Promise<{
        status: string;
        database: string;
        userCount: number;
        dbUrlHidden: string;
        message?: undefined;
        stack?: undefined;
        env?: undefined;
    } | {
        status: string;
        message: any;
        stack: any;
        env: {
            DATABASE_URL_EXISTS: boolean;
            DATABASE_URL_VAL: string;
        };
        database?: undefined;
        userCount?: undefined;
        dbUrlHidden?: undefined;
    }>;
}
