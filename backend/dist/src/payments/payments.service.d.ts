export declare class PaymentsService {
    createPaymeSignature(amount: number, description?: string): Promise<{
        acquirerId: string;
        idCommerce: string;
        purchaseOperationNumber: string;
        purchaseAmount: string;
        purchaseCurrencyCode: string;
        purchaseVerification: string;
        description: string;
    }>;
}
