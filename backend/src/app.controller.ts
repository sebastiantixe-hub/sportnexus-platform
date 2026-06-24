import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      app: 'Sports SaaS Platform API',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health/db-debug')
  async dbDebug() {
    try {
      const userCount = await this.prisma.user.count();
      return {
        status: 'ok',
        database: 'connected',
        userCount,
        dbUrlHidden: process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/:[^:@]+@/, ':***@') : 'not-set',
      };
    } catch (err: any) {
      return {
        status: 'error',
        message: err.message,
        stack: err.stack,
        env: {
          DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
          DATABASE_URL_VAL: process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/:[^:@]+@/, ':***@') : 'not-set',
        },
      };
    }
  }
}

