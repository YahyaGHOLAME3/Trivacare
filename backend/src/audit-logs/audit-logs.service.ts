import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { createPaginationMeta, getPagination } from '../common/utils/pagination.util';
import { PrismaService } from '../prisma/prisma.service';
import { QueryAuditLogsDto } from './dto/query-audit-logs.dto';

interface CreateAuditLogInput {
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Prisma.InputJsonValue;
}

@Injectable()
export class AuditLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateAuditLogInput) {
    return this.prisma.auditLog.create({
      data: {
        actorId: input.actorId ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        metadata: input.metadata,
      },
    });
  }

  async list(dto: QueryAuditLogsDto) {
    const where: Prisma.AuditLogWhereInput = {};

    if (dto.actorId) {
      where.actorId = dto.actorId;
    }

    if (dto.action) {
      where.action = dto.action;
    }

    if (dto.entityType) {
      where.entityType = dto.entityType;
    }

    const { page, limit } = dto;
    const { skip, take } = getPagination(page, limit);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,
        include: {
          actor: {
            select: {
              id: true,
              email: true,
              role: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: items,
      meta: createPaginationMeta(page, limit, total),
    };
  }
}
