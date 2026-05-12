import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserAdminDto } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los usuarios (Solo Admin)' })
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo usuario manualmente (Solo Admin)' })
  create(@Body() createDto: CreateUserAdminDto) {
    return this.usersService.create(createDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un usuario del sistema (Solo Admin)' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
