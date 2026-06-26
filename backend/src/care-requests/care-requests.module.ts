import { Module } from '@nestjs/common';

import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { PatientsModule } from '../patients/patients.module';
import { CareRequestsController } from './care-requests.controller';
import { CareRequestsService } from './care-requests.service';

@Module({
  imports: [PatientsModule, AuditLogsModule],
  controllers: [CareRequestsController],
  providers: [CareRequestsService],
})
export class CareRequestsModule {}
