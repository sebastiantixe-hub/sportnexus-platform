import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CampaignType, CampaignStatus } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '../notifications/email.service';

@Injectable()
export class MarketingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly emailService: EmailService
  ) {}

  async createCampaign(gymId: string, data: any) {
    let sentCount = 0;
    
    // Obtener los destinatarios reales
    let recipients: string[] = [];
    let usersToNotify: any[] = [];
    
    if (data.sendToAll) {
      const members = await this.prisma.user.findMany({
        where: { 
          OR: [
            {
              userMemberships: { some: { plan: { gymId }, status: 'ACTIVE' } }
            },
            {
              reservations: { some: { class: { gymId }, status: { in: ['CONFIRMED', 'ATTENDED'] } } }
            }
          ]
        },
        select: { id: true, email: true }
      });
      recipients = members.map(m => m.email);
      usersToNotify = members;
    } else if (data.toEmail) {
      recipients = [data.toEmail];
      const user = await this.prisma.user.findUnique({
        where: { email: data.toEmail },
        select: { id: true }
      });
      if (user) {
        usersToNotify = [user];
      }
    }

    if (recipients.length > 0 && (!data.type || data.type === 'EMAIL')) {
      try {
        // Enviar con Resend real (Production Ready)
        const sendPromises = recipients.map(recipient => 
          this.emailService.sendMarketingCampaign(recipient, {
            name: recipient,
            subject: data.subject || data.title,
            headline: data.subject || '¡Tenemos novedades para ti!',
            body: data.content,
            ctaText: 'Ir a la Plataforma',
            ctaUrl: process.env.FRONTEND_URL || 'https://hercix.com'
          }).then(() => sentCount++)
            .catch(err => console.error("Error en campaña individual", err))
        );
        
        await Promise.all(sendPromises);

        // Notificación Real en la Plataforma
        for (const user of usersToNotify) {
          await this.notificationsService.create(user.id, {
            title: data.title || data.subject,
            description: `Nueva comunicación: ${data.subject}`,
            type: 'CAMPAIGN'
          });
        }
      } catch (error) {
        console.error('Error enviando campaña masiva:', error);
      }
    }

    const campaign = await this.prisma.marketingCampaign.create({
      data: {
        gymId,
        title: data.title,
        subject: data.subject,
        content: data.content,
        type: data.type || CampaignType.EMAIL,
        status: CampaignStatus.SENT,
        sentCount: sentCount,
        scheduledAt: new Date(),
      },
    });
    return campaign;
  }

  async getCampaigns(gymId: string) {
    return this.prisma.marketingCampaign.findMany({
      where: { gymId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
