import { HealthMetricType } from '@prisma/client';
export declare class CreateHealthMetricDto {
    type: HealthMetricType;
    value: number;
    unit: string;
    date: string;
}
