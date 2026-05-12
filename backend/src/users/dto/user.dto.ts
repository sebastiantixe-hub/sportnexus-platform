import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '@prisma/client';

export class CreateUserAdminDto {
  @ApiProperty({ description: 'Nombre completo del usuario' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Correo electrónico' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Contraseña del usuario (mínimo 6 caracteres)' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'Rol asignado al usuario', enum: UserRole })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiPropertyOptional({ description: 'Teléfono' })
  @IsString()
  @IsOptional()
  phone?: string;
}
