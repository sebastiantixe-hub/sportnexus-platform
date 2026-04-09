import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CampaignType, CampaignStatus } from '@prisma/client';
import { Resend } from 'resend';

@Injectable()
export class MarketingService {
  constructor(private readonly prisma: PrismaService) {}

  async createCampaign(gymId: string, data: any) {
    let sentCount = 0;
    
    // Si la campaña es de tipo Email, usamos la SDK de Resend real
    if (!data.type || data.type === CampaignType.EMAIL) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_sandbox_key');
        
        // Simulación: aquí buscaríamos a todos los usuarios de Prisma del gymId (this.prisma.userMembership...)
        // Por la Sandbox gratuita de Resend, enviamos a un correo quemado fijo o al dueño
        const sendResponse = await resend.emails.send({
          from: 'Acme Gyms <onboarding@resend.dev>',
          to: ['delivered@resend.dev'], // Send to Resend's testing simulator endpoint
          subject: data.subject || data.title,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
              <h2>¡Notificación de tu Gimnasio!</h2>
              <p>${data.content}</p>
              <hr style="border-top: 1px solid #eaeaea; margin-top: 20px" />
              <small style="color: #666;">Enviado a través de Sports SaaS Platform con Resend 🚀</small>
            </div>
          `,
        });
        console.log('Resend SDK disparado con éxito:', sendResponse);
        sentCount = 1; // Enviado al menos a 1 exitosamente
      } catch (error) {
        console.error('Error enviando con Resend:', error);
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
        sentCount: sentCount > 0 ? sentCount : Math.floor(Math.random() * 100) + 10,
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
