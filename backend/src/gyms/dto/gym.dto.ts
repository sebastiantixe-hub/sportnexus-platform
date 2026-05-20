import {
  IsString,
  IsOptional,
  IsEmail,
  IsEnum,
  MaxLength,
} from 'class-validator';
import { GymStatus } from '@prisma/client';

export class CreateGymDto {
  @IsString()
  @MaxLength(200)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  district?: string;

  @IsString()
  @IsOptional()
  province?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  website?: string;

  @IsString()
  @IsOptional()
  openTime?: string;

  @IsString()
  @IsOptional()
  closeTime?: string;

  @IsString()
  @IsOptional()
  openDays?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;
}

export class UpdateGymDto {
  @IsString()
  @MaxLength(200)
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  district?: string;

  @IsString()
  @IsOptional()
  province?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  website?: string;

  @IsString()
  @IsOptional()
  openTime?: string;

  @IsString()
  @IsOptional()
  closeTime?: string;

  @IsString()
  @IsOptional()
  openDays?: string;

  @IsEnum(GymStatus)
  @IsOptional()
  status?: GymStatus;

  @IsString()
  @IsOptional()
  logoUrl?: string;
}
