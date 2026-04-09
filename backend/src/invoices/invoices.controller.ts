import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get('user')
  async getUserInvoices(@Request() req) {
    return this.invoicesService.getUserInvoices(req.user.id);
  }

  @Get('gym/:gymId')
  @Roles('ADMIN', 'GYM_OWNER')
  async getGymInvoices(@Param('gymId') gymId: string) {
    return this.invoicesService.getGymInvoices(gymId);
  }

  @Get(':id')
  async getInvoiceDetails(@Param('id') id: string) {
    return this.invoicesService.getInvoiceById(id);
  }
}
