import { Injectable, NotFoundException } from '@nestjs/common';

import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import {
  createPaginationMeta,
  getPagination,
} from '../common/utils/pagination.util';
import { PrismaService } from '../prisma/prisma.service';
import { publicUserSelect } from '../users/user.select';
import { UpsertProfessionalProfileDto } from './dto/upsert-professional-profile.dto';

@Injectable()
export class ProfessionalsService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfileByUserIdOrThrow(userId: string) {
    const profile = await this.prisma.professionalProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: publicUserSelect,
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Professional profile not found');
    }

    return profile;
  }

  async getProfileByIdOrThrow(id: string) {
    const profile = await this.prisma.professionalProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: publicUserSelect,
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Professional profile not found');
    }

    return profile;
  }

  async upsertMe(userId: string, dto: UpsertProfessionalProfileDto) {
    return this.prisma.professionalProfile.upsert({
      where: { userId },
      update: {
        specialty: dto.specialty,
        licenseNumber: dto.licenseNumber,
        bio: dto.bio,
      },
      create: {
        userId,
        specialty: dto.specialty,
        licenseNumber: dto.licenseNumber,
        bio: dto.bio,
      },
      include: {
        user: {
          select: publicUserSelect,
        },
      },
    });
  }

  async getMe(userId: string) {
    return this.getProfileByUserIdOrThrow(userId);
  }

  async getMyAppointments(userId: string, dto: PaginationQueryDto) {
    const profile = await this.getProfileByUserIdOrThrow(userId);
    const { page, limit } = dto;
    const { skip, take } = getPagination(page, limit);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.appointment.findMany({
        where: {
          professionalId: profile.id,
        },
        include: {
          patient: {
            include: {
              user: {
                select: publicUserSelect,
              },
            },
          },
          clinic: true,
          careRequest: true,
        },
        orderBy: {
          scheduledAt: 'desc',
        },
        skip,
        take,
      }),
      this.prisma.appointment.count({
        where: {
          professionalId: profile.id,
        },
      }),
    ]);

    return {
      data: items,
      meta: createPaginationMeta(page, limit, total),
    };
  }

  async getMyPatients(userId: string, dto: PaginationQueryDto) {
    const profile = await this.getProfileByUserIdOrThrow(userId);
    const { page, limit } = dto;
    const { skip, take } = getPagination(page, limit);
    const where = {
      OR: [
        {
          careRequests: {
            some: {
              professionalId: profile.id,
            },
          },
        },
        {
          appointments: {
            some: {
              professionalId: profile.id,
            },
          },
        },
      ],
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.patientProfile.findMany({
        where,
        include: {
          user: {
            select: publicUserSelect,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take,
      }),
      this.prisma.patientProfile.count({ where }),
    ]);

    return {
      data: items,
      meta: createPaginationMeta(page, limit, total),
    };
  }
}
