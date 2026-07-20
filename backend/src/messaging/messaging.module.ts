import { Module } from '@nestjs/common';

import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { PatientsModule } from '../patients/patients.module';
import { MessagingController } from './messaging.controller';
import { MessagingService } from './messaging.service';

@Module({
  imports: [PatientsModule, AuditLogsModule],
  controllers: [MessagingController],
  providers: [MessagingService],
})
export class MessagingModule {}
