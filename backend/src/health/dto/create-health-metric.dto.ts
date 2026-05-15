import { IsEnum, IsNumber, IsString, IsDateString } from 'class-validator';
import { HealthMetricType } from '@prisma/client';

export class CreateHealthMetricDto {
  @IsEnum(HealthMetricType)
  type: HealthMetricType;

  @IsNumber()
  value: number;

  @IsString()
  unit: string;

  @IsDateString()
  date: string;
}
