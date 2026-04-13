import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripe: any;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
      apiVersion: '2026-03-25.dahlia' as any,
    });
  }

  async createPaymentIntent(amount: number, description?: string) {
    if (!process.env.STRIPE_SECRET_KEY) {
      // Si no hay key de Stripe en producción, evitamos que crashe y permitimos mock local
      console.warn('STRIPE_SECRET_KEY no configurado, simulando client_secret dummy');
      return { clientSecret: 'pi_dummy_secret_dummy' };
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe usa centavos
        currency: 'cop', // Peso Colombiano (o la moneda preferida)
        description: description || 'Compra en SportNexus Marketplace',
        automatic_payment_methods: {
          enabled: true,
        },
      });
      return { clientSecret: paymentIntent.client_secret };
    } catch (error) {
      console.error('Error al crear Payment Intent en Stripe:', error);
      throw error;
    }
  }
}
