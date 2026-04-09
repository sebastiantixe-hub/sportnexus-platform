import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { MarketingService } from './marketing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('marketing')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MarketingController {
  constructor(private readonly marketingService: MarketingService) {}

  @Post('gym/:gymId/campaigns')
  @Roles('ADMIN', 'GYM_OWNER')
  async createCampaign(@Param('gymId') gymId: string, @Body() data: any) {
    return this.marketingService.createCampaign(gymId, data);
  }

  @Get('gym/:gymId/campaigns')
  @Roles('ADMIN', 'GYM_OWNER')
  async getCampaigns(@Param('gymId') gymId: string) {
    return this.marketingService.getCampaigns(gymId);
  }
}
