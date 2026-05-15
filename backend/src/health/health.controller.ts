import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { HealthService } from './health.service';
import { CreateHealthMetricDto } from './dto/create-health-metric.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('health')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Post('metrics')
  @ApiOperation({ summary: 'Create or update a health metric' })
  async create(@Request() req, @Body() dto: CreateHealthMetricDto) {
    return this.healthService.createOrUpdate(req.user.userId, dto);
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Get all health metrics for current user' })
  async findAll(@Request() req) {
    return this.healthService.findAll(req.user.userId);
  }
}
