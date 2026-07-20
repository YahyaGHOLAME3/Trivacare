import { Module } from '@nestjs/common';

import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { SecurityController } from './security.controller';
import { SecurityService } from './security.service';

@Module({
  imports: [AuditLogsModule],
  controllers: [SecurityController],
  providers: [SecurityService],
  exports: [SecurityService],
})
export class SecurityModule {}
