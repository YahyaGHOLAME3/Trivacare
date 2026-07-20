import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

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

  async getDashboard(userId: string) {
    const profile = await this.getProfileByUserIdOrThrow(userId);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
    const patientWhere = this.professionalPatientWhere(profile.id);

    const [
      assignedPatientRows,
      todayAppointments,
      upcomingAppointments,
      recentNotes,
      documentCount,
      unreadMessages,
    ] = await this.prisma.$transaction([
      this.prisma.patientProfile.findMany({
        where: patientWhere,
        select: { id: true },
        distinct: ['id'],
      }),
      this.prisma.appointment.count({
        where: {
          professionalId: profile.id,
          scheduledAt: { gte: startOfToday, lt: startOfTomorrow },
        },
      }),
      this.prisma.appointment.findMany({
        where: {
          professionalId: profile.id,
          scheduledAt: { gte: now },
          status: { in: ['REQUESTED', 'CONFIRMED'] },
        },
        include: this.appointmentInclude,
        orderBy: { scheduledAt: 'asc' },
        take: 5,
      }),
      this.prisma.clinicalNote.findMany({
        where: { professionalId: profile.id },
        include: this.noteInclude,
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.medicalDocument.count({
        where: this.professionalDocumentWhere(profile.id),
      }),
      this.prisma.messageReceipt.count({
        where: {
          userId,
          status: 'UNREAD',
        },
      }),
    ]);

    return {
      data: {
        metrics: {
          assignedPatients: assignedPatientRows.length,
          todayAppointments,
          upcomingAppointments: upcomingAppointments.length,
          recentNotes: recentNotes.length,
          documentCount,
          unreadMessages,
        },
        upcoming: {
          appointments: upcomingAppointments,
        },
        recent: {
          notes: recentNotes,
        },
        alerts: [],
      },
    };
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
    const where = this.professionalPatientWhere(profile.id);

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

  async getPatientFile(
    userId: string,
    patientId: string,
    dto: PaginationQueryDto,
  ) {
    const profile = await this.getProfileByUserIdOrThrow(userId);
    const patient = await this.prisma.patientProfile.findFirst({
      where: {
        id: patientId,
        ...this.professionalPatientWhere(profile.id),
      },
      include: {
        user: {
          select: publicUserSelect,
        },
      },
    });

    if (!patient) {
      throw new NotFoundException('Patient file not found');
    }

    const { page, limit } = dto;
    const { skip, take } = getPagination(page, limit);
    const [careRequests, appointments, documents, notes] =
      await this.prisma.$transaction([
        this.prisma.careRequest.findMany({
          where: {
            patientId,
            professionalId: profile.id,
          },
          include: {
            clinic: true,
          },
          orderBy: { updatedAt: 'desc' },
          skip,
          take,
        }),
        this.prisma.appointment.findMany({
          where: {
            patientId,
            professionalId: profile.id,
          },
          include: this.appointmentInclude,
          orderBy: { scheduledAt: 'desc' },
          skip,
          take,
        }),
        this.prisma.medicalDocument.findMany({
          where: {
            patientId,
            ...this.professionalDocumentWhere(profile.id),
          },
          include: this.documentInclude,
          orderBy: { createdAt: 'desc' },
          skip,
          take,
        }),
        this.prisma.clinicalNote.findMany({
          where: {
            patientId,
            professionalId: profile.id,
          },
          include: this.noteInclude,
          orderBy: { createdAt: 'desc' },
          skip,
          take,
        }),
      ]);

    return {
      data: {
        patient,
        careRequests,
        appointments,
        documents,
        notes,
      },
    };
  }

  async getMyDocuments(userId: string, dto: PaginationQueryDto) {
    const profile = await this.getProfileByUserIdOrThrow(userId);
    const { page, limit } = dto;
    const { skip, take } = getPagination(page, limit);
    const where = this.professionalDocumentWhere(profile.id);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.medicalDocument.findMany({
        where,
        include: this.documentInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.medicalDocument.count({ where }),
    ]);

    return {
      data: items,
      meta: createPaginationMeta(page, limit, total),
    };
  }

  async getMyNotes(userId: string, dto: PaginationQueryDto) {
    const profile = await this.getProfileByUserIdOrThrow(userId);
    const { page, limit } = dto;
    const { skip, take } = getPagination(page, limit);
    const where = { professionalId: profile.id };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.clinicalNote.findMany({
        where,
        include: this.noteInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.clinicalNote.count({ where }),
    ]);

    return {
      data: items,
      meta: createPaginationMeta(page, limit, total),
    };
  }

  private professionalPatientWhere(
    professionalId: string,
  ): Prisma.PatientProfileWhereInput {
    return {
      OR: [
        {
          careRequests: {
            some: {
              professionalId,
            },
          },
        },
        {
          appointments: {
            some: {
              professionalId,
            },
          },
        },
      ],
    };
  }

  private professionalDocumentWhere(
    professionalId: string,
  ): Prisma.MedicalDocumentWhereInput {
    return {
      OR: [
        {
          careRequest: {
            professionalId,
          },
        },
        {
          patient: {
            appointments: {
              some: {
                professionalId,
              },
            },
          },
        },
      ],
    };
  }

  private readonly appointmentInclude = {
    patient: {
      include: {
        user: {
          select: publicUserSelect,
        },
      },
    },
    clinic: true,
    careRequest: true,
  } as const;

  private readonly documentInclude = {
    patient: {
      include: {
        user: {
          select: publicUserSelect,
        },
      },
    },
    careRequest: true,
    uploadedBy: {
      select: publicUserSelect,
    },
  } as const;

  private readonly noteInclude = {
    patient: {
      include: {
        user: {
          select: publicUserSelect,
        },
      },
    },
    careRequest: true,
    appointment: true,
  } as const;
}
