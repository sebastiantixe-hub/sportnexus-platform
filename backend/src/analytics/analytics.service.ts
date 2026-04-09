import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats(gymId: string) {
    // Basic analytics logic
    const activeMembers = await this.prisma.userMembership.count({
      where: { plan: { gymId }, status: 'ACTIVE' },
    });

    const mrrAggregate = await this.prisma.userMembership.aggregate({
      where: { plan: { gymId }, status: 'ACTIVE' },
      _sum: {
        classesUsed: true, // we could calculate price based on plan price
      },
    });

    const activePlans = await this.prisma.userMembership.findMany({
      where: { plan: { gymId }, status: 'ACTIVE' },
      include: { plan: true },
    });
    
    const mrr = activePlans.reduce((sum, member) => sum + Number(member.plan.price), 0);

    const totalClasses = await this.prisma.class.count({
      where: { gymId },
    });

    const reservationsCount = await this.prisma.reservation.count({
      where: { class: { gymId } },
    });

    // Mock Retention Rate
    const retentionRate = 92.5;

    return {
      activeMembers,
      monthlyRecurringRevenue: mrr,
      totalClasses,
      reservationsCount,
      retentionRate,
    };
  }
}
