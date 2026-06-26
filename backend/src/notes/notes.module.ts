import { Module } from '@nestjs/common';

import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { ProfessionalsModule } from '../professionals/professionals.module';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';

@Module({
  imports: [ProfessionalsModule, AuditLogsModule],
  controllers: [NotesController],
  providers: [NotesService],
})
export class NotesModule {}
