import { Injectable, NotFoundException } from '@nestjs/common';

import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import {
  createPaginationMeta,
  getPagination,
} from '../common/utils/pagination.util';
import { PrismaService } from '../prisma/prisma.service';
import { publicUserSelect } from '../users/user.select';
import { UpsertPatientProfileDto } from './dto/upsert-patient-profile.dto';

@Injectable()
export class PatientsService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfileByUserIdOrThrow(userId: string) {
    const profile = await this.prisma.patientProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: publicUserSelect,
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Patient profile not found');
    }

    return profile;
  }

  async getProfileByIdOrThrow(id: string) {
    const profile = await this.prisma.patientProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: publicUserSelect,
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Patient profile not found');
    }

    return profile;
  }

  async upsertMe(userId: string, dto: UpsertPatientProfileDto) {
    return this.prisma.patientProfile.upsert({
      where: { userId },
      update: {
        dateOfBirth: dto.dateOfBirth,
        gender: dto.gender,
        address: dto.address,
        emergencyContactName: dto.emergencyContactName,
        emergencyContactPhone: dto.emergencyContactPhone,
      },
      create: {
        userId,
        dateOfBirth: dto.dateOfBirth,
        gender: dto.gender,
        address: dto.address,
        emergencyContactName: dto.emergencyContactName,
        emergencyContactPhone: dto.emergencyContactPhone,
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

  async getMyCareRequests(userId: string, dto: PaginationQueryDto) {
    const profile = await this.getProfileByUserIdOrThrow(userId);
    const { page, limit } = dto;
    const { skip, take } = getPagination(page, limit);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.careRequest.findMany({
        where: { patientId: profile.id },
        include: {
          clinic: true,
          professional: {
            include: {
              user: {
                select: publicUserSelect,
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take,
      }),
      this.prisma.careRequest.count({
        where: { patientId: profile.id },
      }),
    ]);

    return {
      data: items,
      meta: createPaginationMeta(page, limit, total),
    };
  }

  async getMyAppointments(userId: string, dto: PaginationQueryDto) {
    const profile = await this.getProfileByUserIdOrThrow(userId);
    const { page, limit } = dto;
    const { skip, take } = getPagination(page, limit);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.appointment.findMany({
        where: { patientId: profile.id },
        include: {
          clinic: true,
          careRequest: true,
          professional: {
            include: {
              user: {
                select: publicUserSelect,
              },
            },
          },
        },
        orderBy: {
          scheduledAt: 'desc',
        },
        skip,
        take,
      }),
      this.prisma.appointment.count({
        where: { patientId: profile.id },
      }),
    ]);

    return {
      data: items,
      meta: createPaginationMeta(page, limit, total),
    };
  }

  async getMyDocuments(userId: string, dto: PaginationQueryDto) {
    const profile = await this.getProfileByUserIdOrThrow(userId);
    const { page, limit } = dto;
    const { skip, take } = getPagination(page, limit);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.medicalDocument.findMany({
        where: { patientId: profile.id },
        include: {
          careRequest: true,
          uploadedBy: {
            select: publicUserSelect,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take,
      }),
      this.prisma.medicalDocument.count({
        where: { patientId: profile.id },
      }),
    ]);

    return {
      data: items,
      meta: createPaginationMeta(page, limit, total),
    };
  }
}
