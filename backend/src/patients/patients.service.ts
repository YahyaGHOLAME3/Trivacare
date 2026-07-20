import { Injectable, NotFoundException } from '@nestjs/common';
import { AppointmentStatus, Prisma } from '@prisma/client';

import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { CancelAppointmentDto } from '../appointments/dto/cancel-appointment.dto';
import { RequestAppointmentDto } from '../appointments/dto/request-appointment.dto';
import { RescheduleAppointmentDto } from '../appointments/dto/reschedule-appointment.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { RequestUser } from '../common/interfaces/request-user.interface';
import {
  createPaginationMeta,
  getPagination,
} from '../common/utils/pagination.util';
import { PrismaService } from '../prisma/prisma.service';
import { publicUserSelect } from '../users/user.select';
import { UpsertPatientProfileDto } from './dto/upsert-patient-profile.dto';

@Injectable()
export class PatientsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

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
        nationality: dto.nationality,
        insurer: dto.insurer,
        bloodType: dto.bloodType,
        medicalSummary: dto.medicalSummary,
        emergencyContactName: dto.emergencyContactName,
        emergencyContactPhone: dto.emergencyContactPhone,
        notificationPreferences: dto.notificationPreferences as Prisma.InputJsonValue,
      },
      create: {
        userId,
        dateOfBirth: dto.dateOfBirth,
        gender: dto.gender,
        address: dto.address,
        nationality: dto.nationality,
        insurer: dto.insurer,
        bloodType: dto.bloodType,
        medicalSummary: dto.medicalSummary,
        emergencyContactName: dto.emergencyContactName,
        emergencyContactPhone: dto.emergencyContactPhone,
        notificationPreferences: dto.notificationPreferences as Prisma.InputJsonValue,
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

  async getDashboard(user: RequestUser) {
    const profile = await this.getProfileByUserIdOrThrow(user.userId);
    const now = new Date();

    const [
      nextAppointment,
      activeTrip,
      unreadMessages,
      documentCount,
      mfaMethodCount,
      activeSessionCount,
      quoteSummary,
      invoiceSummary,
      paymentSummary,
    ] = await this.prisma.$transaction([
      this.prisma.appointment.findFirst({
        where: {
          patientId: profile.id,
          scheduledAt: {
            gte: now,
          },
          status: {
            in: ['REQUESTED', 'CONFIRMED'],
          },
        },
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
          scheduledAt: 'asc',
        },
      }),
      this.prisma.tripPlan.findFirst({
        where: {
          patientId: profile.id,
          status: {
            in: ['DRAFT', 'ACTIVE'],
          },
        },
        include: {
          stops: {
            orderBy: {
              position: 'asc',
            },
          },
        },
        orderBy: [{ status: 'asc' }, { startDate: 'asc' }, { createdAt: 'desc' }],
      }),
      this.prisma.messageReceipt.count({
        where: {
          userId: user.userId,
          status: 'UNREAD',
        },
      }),
      this.prisma.medicalDocument.count({
        where: { patientId: profile.id },
      }),
      this.prisma.mfaMethod.count({
        where: {
          userId: user.userId,
          verifiedAt: {
            not: null,
          },
          disabledAt: null,
        },
      }),
      this.prisma.userSession.count({
        where: {
          userId: user.userId,
          revokedAt: null,
          expiresAt: {
            gt: now,
          },
        },
      }),
      this.prisma.quote.groupBy({
        by: ['status'],
        where: { patientId: profile.id },
        _sum: { amount: true },
        _count: { id: true },
      }),
      this.prisma.invoice.groupBy({
        by: ['status'],
        where: { patientId: profile.id },
        _sum: { amount: true },
        _count: { id: true },
      }),
      this.prisma.paymentIntent.groupBy({
        by: ['status'],
        where: { patientId: profile.id },
        _sum: { amount: true },
        _count: { id: true },
      }),
    ]);

    return {
      patient: profile,
      nextAppointment,
      activeTrip,
      unreadMessages,
      documents: {
        count: documentCount,
      },
      billing: {
        quotes: quoteSummary,
        invoices: invoiceSummary,
        paymentIntents: paymentSummary,
      },
      security: {
        mfaEnabled: mfaMethodCount > 0,
        activeSessionCount,
        currentSessionId: user.sessionId ?? null,
      },
    };
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

  async requestAppointment(userId: string, dto: RequestAppointmentDto) {
    const profile = await this.getProfileByUserIdOrThrow(userId);

    if (dto.careRequestId) {
      const careRequest = await this.prisma.careRequest.findFirst({
        where: {
          id: dto.careRequestId,
          patientId: profile.id,
        },
      });

      if (!careRequest) {
        throw new NotFoundException('Care request not found');
      }
    }

    await this.ensureOptionalAppointmentLinksExist(dto.clinicId, dto.professionalId);

    const appointment = await this.prisma.appointment.create({
      data: {
        patientId: profile.id,
        clinicId: dto.clinicId,
        professionalId: dto.professionalId,
        careRequestId: dto.careRequestId,
        createdById: userId,
        scheduledAt: dto.scheduledAt,
        endAt: dto.endAt,
        location: dto.location,
        notes: dto.notes,
        status: AppointmentStatus.REQUESTED,
      },
      include: this.appointmentInclude,
    });

    await this.auditLogsService.create({
      actorId: userId,
      action: 'appointment_request',
      entityType: 'Appointment',
      entityId: appointment.id,
      metadata: { patientId: profile.id },
    });

    return appointment;
  }

  async cancelAppointment(
    userId: string,
    appointmentId: string,
    dto: CancelAppointmentDto,
  ) {
    const profile = await this.getProfileByUserIdOrThrow(userId);
    await this.getPatientAppointmentOrThrow(profile.id, appointmentId);

    const appointment = await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: AppointmentStatus.CANCELLED,
        cancellationReason: dto.reason,
      },
      include: this.appointmentInclude,
    });

    await this.auditLogsService.create({
      actorId: userId,
      action: 'appointment_cancel',
      entityType: 'Appointment',
      entityId: appointmentId,
      metadata: { reason: dto.reason ?? null },
    });

    return appointment;
  }

  async rescheduleAppointment(
    userId: string,
    appointmentId: string,
    dto: RescheduleAppointmentDto,
  ) {
    const profile = await this.getProfileByUserIdOrThrow(userId);
    const current = await this.getPatientAppointmentOrThrow(
      profile.id,
      appointmentId,
    );

    const appointment = await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        scheduledAt: dto.scheduledAt,
        endAt: dto.endAt,
        status: AppointmentStatus.REQUESTED,
        notes: dto.reason
          ? [current.notes, `Reschedule reason: ${dto.reason}`]
              .filter(Boolean)
              .join('\n')
          : current.notes,
      },
      include: this.appointmentInclude,
    });

    await this.auditLogsService.create({
      actorId: userId,
      action: 'appointment_reschedule',
      entityType: 'Appointment',
      entityId: appointmentId,
      metadata: {
        previousScheduledAt: current.scheduledAt.toISOString(),
        reason: dto.reason ?? null,
      } as Prisma.InputJsonObject,
    });

    return appointment;
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

  private async getPatientAppointmentOrThrow(
    patientId: string,
    appointmentId: string,
  ) {
    const appointment = await this.prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        patientId,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }

  private async ensureOptionalAppointmentLinksExist(
    clinicId?: string,
    professionalId?: string,
  ) {
    if (clinicId) {
      const clinic = await this.prisma.clinic.findUnique({
        where: { id: clinicId },
        select: { id: true },
      });

      if (!clinic) {
        throw new NotFoundException('Clinic not found');
      }
    }

    if (professionalId) {
      const professional = await this.prisma.professionalProfile.findUnique({
        where: { id: professionalId },
        select: { id: true },
      });

      if (!professional) {
        throw new NotFoundException('Professional not found');
      }
    }
  }

  private readonly appointmentInclude = {
    clinic: true,
    careRequest: true,
    professional: {
      include: {
        user: {
          select: publicUserSelect,
        },
      },
    },
  } as const;
}
