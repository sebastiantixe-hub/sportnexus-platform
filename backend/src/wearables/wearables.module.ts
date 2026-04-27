import { Module } from '@nestjs/common';
import { WearablesController } from './wearables.controller';
import { WearablesService } from './wearables.service';
import { FitbitOAuthService } from './fitbit-oauth.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WearablesController],
  providers: [WearablesService, FitbitOAuthService],
  exports: [FitbitOAuthService, WearablesService],
})
export class WearablesModule {}
