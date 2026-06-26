import { Module } from '@nestjs/common';

import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { PatientsModule } from '../patients/patients.module';
import { ProfessionalsModule } from '../professionals/professionals.module';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';

@Module({
  imports: [PatientsModule, ProfessionalsModule, AuditLogsModule],
  controllers: [DocumentsController],
  providers: [DocumentsService],
})
export class DocumentsModule {}
