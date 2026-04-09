import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserInvoices(userId: string) {
    return this.prisma.invoice.findMany({
      where: { userId },
      orderBy: { issuedAt: 'desc' },
      include: { gym: { select: { name: true } } },
    });
  }

  async getGymInvoices(gymId: string) {
    return this.prisma.invoice.findMany({
      where: { gymId },
      orderBy: { issuedAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    });
  }

  async getInvoiceById(id: string) {
    return this.prisma.invoice.findUnique({
      where: { id },
      include: { 
        user: { select: { name: true, email: true } },
        gym: { select: { name: true, phone: true, address: true } }
      },
    });
  }
}
