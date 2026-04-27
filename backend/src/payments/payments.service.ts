import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {

  async createPaymeSignature(amount: number, description?: string) {
    const acquirerId = process.env.PAYME_ACQUIRER_ID || '148';
    const idCommerce = process.env.PAYME_COMMERCE_ID || '8259';
    const purchaseCurrencyCode = '604'; // Moneda COP/PEN, 604 es Soles (prueba)
    const apiKey = process.env.PAYME_API_KEY || '123456789';
    
    // Pay-me requiere monto en entero (ej. 10.00 = 1000)
    const purchaseAmount = Math.round(amount * 100).toString();
    
    // Número random de operación de 6 dígitos
    const purchaseOperationNumber = Math.floor(Math.random() * 999999).toString().padStart(6, '0');

    // CONCATENAR EN ESTE ORDEN EXACTO (Según docs Pay-me)
    const dataToSign = `${acquirerId}${idCommerce}${purchaseOperationNumber}${purchaseAmount}${purchaseCurrencyCode}${apiKey}`;
    
    // ENCRIPTACION SHA512
    const purchaseVerification = crypto.createHash('sha512').update(dataToSign).digest('hex');

    return {
      acquirerId,
      idCommerce,
      purchaseOperationNumber,
      purchaseAmount,
      purchaseCurrencyCode,
      purchaseVerification,
      description: description || 'Compra en SportNexus'
    };
  }
}
