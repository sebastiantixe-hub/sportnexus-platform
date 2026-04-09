import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { WearablesService } from './wearables.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('wearables')
@UseGuards(JwtAuthGuard)
export class WearablesController {
  constructor(private readonly wearablesService: WearablesService) {}

  @Post('sync')
  async syncData(@Request() req, @Body() data: any) {
    const userId = req.user.id;
    return this.wearablesService.syncData(userId, data);
  }

  @Get('metrics')
  async getMetrics(@Request() req) {
    const userId = req.user.id;
    return this.wearablesService.getMetrics(userId);
  }
}
