export declare class EmailService {
    private readonly resend;
    private readonly logger;
    private readonly from;
    private readonly fromName;
    constructor();
    private baseTemplate;
    sendWelcome(to: string, name: string): Promise<void>;
    sendBookingConfirmation(to: string, data: {
        userName: string;
        className: string;
        gymName: string;
        date: Date;
        price: number;
    }): Promise<void>;
    sendPaymentConfirmation(to: string, data: {
        userName: string;
        amount: number;
        description: string;
        invoiceId?: string;
    }): Promise<void>;
    sendMembershipActivated(to: string, data: {
        userName: string;
        planName: string;
        gymName: string;
        expiresAt: Date;
    }): Promise<void>;
    sendMarketingCampaign(to: string, data: {
        name: string;
        subject: string;
        headline: string;
        body: string;
        ctaText: string;
        ctaUrl: string;
    }): Promise<void>;
    private send;
}
