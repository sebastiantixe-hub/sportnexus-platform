import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfessionalDto, UpdateProfessionalDto } from './dto/professional.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ProfessionalsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService
  ) {}

  async create(providerId: string, createDto: CreateProfessionalDto) {
    return this.prisma.professionalService.create({
      data: {
        ...createDto,
        providerId,
      },
    });
  }

  async findAll() {
    return this.prisma.professionalService.findMany({
      where: { isActive: true },
      include: {
        provider: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const service = await this.prisma.professionalService.findUnique({
      where: { id },
      include: {
        provider: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });
    if (!service) throw new NotFoundException('Servicio no encontrado');
    return service;
  }

  async update(id: string, currentUserId: string, updateDto: UpdateProfessionalDto, isAdmin: boolean) {
    const service = await this.findOne(id);
    if (!isAdmin && service.providerId !== currentUserId) {
      throw new ForbiddenException('No tienes permiso para actualizar este servicio');
    }
    return this.prisma.professionalService.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: string, currentUserId: string, isAdmin: boolean) {
    const service = await this.findOne(id);
    if (!isAdmin && service.providerId !== currentUserId) {
        throw new ForbiddenException('No tienes permiso para eliminar este servicio');
    }
    return this.prisma.professionalService.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async bookService(userId: string, serviceId: string, notes?: string) {
    const service = await this.findOne(serviceId);
    const booking = await this.prisma.professionalBooking.create({
      data: {
        userId,
        serviceId,
        notes,
        status: 'PENDING',
      },
      include: {
        service: {
          include: { provider: true }
        },
        user: true,
      },
    });

    // Notify the provider
    try {
      await this.notificationsService.create(service.providerId, {
        title: 'Nueva Reserva Pendiente',
        description: `${booking.user?.name || 'Un atleta'} ha solicitado reservar tu servicio: ${service.title}`,
        type: 'RESERVATION',
      });
    } catch (err) {
      console.error('Error creating booking notification for provider:', err);
    }

    // Notify the client (athlete)
    try {
      await this.notificationsService.create(userId, {
        title: 'Reserva Solicitada',
        description: `Has solicitado reservar el servicio: ${service.title}. Espera la confirmación.`,
        type: 'RESERVATION',
      });
    } catch (err) {
      console.error('Error creating booking notification for client:', err);
    }

    return booking;
  }

  async getMyBookings(userId: string) {
    return this.prisma.professionalBooking.findMany({
      where: { userId },
      include: {
        service: {
          include: { provider: true }
        }
      },
      orderBy: { bookedAt: 'desc' },
    });
  }

  async getProviderBookings(providerId: string) {
    return this.prisma.professionalBooking.findMany({
      where: {
        service: {
          providerId: providerId
        }
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true }
        },
        service: true
      },
      orderBy: { bookedAt: 'desc' },
    });
  }

  async updateBookingStatus(bookingId: string, providerId: string, status: string, isAdmin: boolean) {
    const booking = await this.prisma.professionalBooking.findUnique({
      where: { id: bookingId },
      include: { service: true }
    });
    if (!booking) throw new NotFoundException('Reserva no encontrada');

    if (!isAdmin && booking.service.providerId !== providerId) {
      throw new ForbiddenException('No tienes permiso para actualizar esta reserva');
    }

    const updated = await this.prisma.professionalBooking.update({
      where: { id: bookingId },
      data: { status },
      include: {
        service: {
          include: { provider: true }
        },
        user: true
      }
    });

    // Notify the client about the status change
    try {
      let statusText = status === 'CONFIRMED' ? 'confirmada' : status === 'CANCELLED' ? 'cancelada' : status.toLowerCase();
      await this.notificationsService.create(updated.userId, {
        title: `Reserva de Servicio ${status === 'CONFIRMED' ? 'Confirmada' : status === 'CANCELLED' ? 'Cancelada' : 'Actualizada'}`,
        description: `Tu reserva para el servicio: ${updated.service.title} con ${updated.service.provider.name} ha sido ${statusText}.`,
        type: 'RESERVATION',
      });
    } catch (err) {
      console.error('Error creating status update notification for client:', err);
    }

    return updated;
  }
}
