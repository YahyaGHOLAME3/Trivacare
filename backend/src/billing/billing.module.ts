import { Module } from '@nestjs/common';

import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { PatientsModule } from '../patients/patients.module';
import { SecurityModule } from '../security/security.module';
import { BillingProviderAdapter } from './billing-provider.adapter';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';

@Module({
  imports: [PatientsModule, SecurityModule, AuditLogsModule],
  controllers: [BillingController],
  providers: [BillingService, BillingProviderAdapter],
})
export class BillingModule {}
