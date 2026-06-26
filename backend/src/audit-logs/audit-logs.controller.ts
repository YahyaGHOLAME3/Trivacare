import { Controller, Get, Query } from '@nestjs/common';
import { Role } from '@prisma/client';

import { Roles } from '../common/decorators/roles.decorator';
import { QueryAuditLogsDto } from './dto/query-audit-logs.dto';
import { AuditLogsService } from './audit-logs.service';

@Controller('audit-logs')
@Roles(Role.SUPER_ADMIN)
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  async list(@Query() dto: QueryAuditLogsDto) {
    return this.auditLogsService.list(dto);
  }
}
