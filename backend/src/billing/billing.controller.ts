import { Body, Controller, Get, Headers, Param, Post, Query } from '@nestjs/common';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { RequestUser } from '../common/interfaces/request-user.interface';
import { BillingService } from './billing.service';
import { ApproveQuoteDto } from './dto/approve-quote.dto';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { ProviderEventDto } from './dto/provider-event.dto';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('summary')
  async summary(
    @CurrentUser() user: RequestUser,
    @Query('clinicId') clinicId?: string,
  ) {
    return this.billingService.summary(user, clinicId);
  }

  @Get('quotes')
  async quotes(
    @CurrentUser() user: RequestUser,
    @Query('clinicId') clinicId?: string,
  ) {
    return this.billingService.listQuotes(user, clinicId);
  }

  @Get('invoices')
  async invoices(
    @CurrentUser() user: RequestUser,
    @Query('clinicId') clinicId?: string,
  ) {
    return this.billingService.listInvoices(user, clinicId);
  }

  @Post('quotes/:id/approve')
  async approveQuote(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: ApproveQuoteDto,
  ) {
    return this.billingService.approveQuote(user, id, dto);
  }

  @Post('payment-intents')
  async createPaymentIntent(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreatePaymentIntentDto,
  ) {
    return this.billingService.createPaymentIntent(user, dto);
  }

  @Post('provider-events')
  @Public()
  async providerEvent(
    @Body() dto: ProviderEventDto,
    @Headers('x-trivacare-signature') signature?: string,
    @Headers('x-trivacare-timestamp') timestamp?: string,
  ) {
    return this.billingService.ingestProviderEvent(dto, signature, timestamp);
  }
}
