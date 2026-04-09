import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateMembershipPlanDto,
  UpdateMembershipPlanDto,
  SubscribeDto,
} from './dto/membership.dto';
import { MembershipStatus, PaymentStatus, InvoiceStatus } from '@prisma/client';
import { randomUUID } from 'crypto';

@Injectable()
export class MembershipsService {
  constructor(private prisma: PrismaService) {}

  async createPlan(gymId: string, ownerId: string, dto: CreateMembershipPlanDto) {
    const gym = await this.prisma.gym.findUnique({ where: { id: gymId } });
    if (!gym) throw new NotFoundException('Gimnasio no encontrado');
    if (gym.ownerId !== ownerId) {
      throw new ForbiddenException('No eres el dueño de este gimnasio');
    }

    return this.prisma.membershipPlan.create({
      data: {
        ...dto,
        gymId,
      },
    });
  }

  async findAllPlans(gymId?: string) {
    return this.prisma.membershipPlan.findMany({
      where: {
        ...(gymId ? { gymId } : {}),
        isActive: true,
      },
      include: {
        gym: { select: { name: true } },
      },
    });
  }

  async subscribe(userId: string, dto: SubscribeDto) {
    // 1. Get plan
    const plan = await this.prisma.membershipPlan.findUnique({
      where: { id: dto.planId },
    });

    if (!plan) throw new NotFoundException('Plan no encontrado');
    if (!plan.isActive) throw new BadRequestException('Este plan no está disponible');

    // 2. Calculate expiration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + plan.durationDays);

    // 3. Create membership, payment and invoice with a transaction
    return this.prisma.$transaction(async (tx) => {
      const membership = await tx.userMembership.create({
        data: {
          userId,
          planId: plan.id,
          status: MembershipStatus.ACTIVE,
          expiresAt,
        },
        include: {
          plan: true,
        },
      });

      const payment = await tx.payment.create({
        data: {
          userId,
          amount: plan.price,
          status: PaymentStatus.COMPLETED,
          method: 'CREDIT_CARD',
          gatewayTxId: `tx_${randomUUID()}`,
          description: `Suscripción a ${plan.name}`,
          membershipId: membership.id,
          paidAt: new Date(),
        },
      });

      const invoiceAmount = Number(plan.price);
      const taxAmount = invoiceAmount * 0.19; // 19% IVA simulated
      const totalAmount = invoiceAmount + taxAmount;

      await tx.invoice.create({
        data: {
          paymentId: payment.id,
          userId,
          gymId: plan.gymId,
          invoiceNum: `INV-${Date.now().toString().slice(-6)}`,
          amount: invoiceAmount,
          tax: taxAmount,
          total: totalAmount,
          status: InvoiceStatus.ISSUED,
          pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', // Mock PDF
        },
      });

      return membership;
    });
  }

  async getUserMemberships(userId: string) {
    return this.prisma.userMembership.findMany({
      where: { userId },
      include: {
        plan: {
          include: { gym: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
