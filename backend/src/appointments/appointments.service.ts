import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AppointmentStatus, Prisma, Role } from '@prisma/client';

import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { RequestUser } from '../common/interfaces/request-user.interface';
import {
  createPaginationMeta,
  getPagination,
} from '../common/utils/pagination.util';
import { PatientsService } from '../patients/patients.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProfessionalsService } from '../professionals/professionals.service';
import { publicUserSelect } from '../users/user.select';
import { CancelAppointmentDto } from './dto/cancel-appointment.dto';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { QueryAppointmentsDto } from './dto/query-appointments.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly patientsService: PatientsService,
    private readonly professionalsService: ProfessionalsService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async create(user: RequestUser, dto: CreateAppointmentDto) {
    const patientProfile = await this.patientsService.getProfileByIdOrThrow(
      dto.patientId,
    );
    const careRequest = dto.careRequestId
      ? await this.prisma.careRequest.findUnique({
          where: { id: dto.careRequestId },
        })
      : null;

    if (dto.careRequestId && !careRequest) {
      throw new NotFoundException('Care request not found');
    }

    if (careRequest && careRequest.patientId !== patientProfile.id) {
      throw new BadRequestException(
        'The appointment patient must match the care request patient',
      );
    }

    const clinicId = dto.clinicId ?? careRequest?.clinicId ?? null;
    const professionalId =
      dto.professionalId ?? careRequest?.professionalId ?? null;

    if (clinicId) {
      await this.ensureClinicExists(clinicId);
    }

    await this.enforceAppointmentWriteAccess(user, clinicId, professionalId);

    if (professionalId) {
      await this.ensureProfessionalBelongsToClinic(professionalId, clinicId);
    }

    const appointment = await this.prisma.appointment.create({
      data: {
        patientId: patientProfile.id,
        clinicId,
        professionalId,
        careRequestId: dto.careRequestId,
        createdById: user.userId,
        scheduledAt: dto.scheduledAt,
        endAt: dto.endAt,
        location: dto.location,
        notes: dto.notes,
        status: dto.status ?? AppointmentStatus.REQUESTED,
      },
      include: this.appointmentInclude,
    });

    await this.auditLogsService.create({
      actorId: user.userId,
      action: 'appointment_create',
      entityType: 'Appointment',
      entityId: appointment.id,
      metadata: {
        patientId: appointment.patientId,
        clinicId: appointment.clinicId,
        professionalId: appointment.professionalId,
      },
    });

    return appointment;
  }

  async update(user: RequestUser, appointmentId: string, dto: UpdateAppointmentDto) {
    const appointment = await this.getAppointmentOrThrow(appointmentId);
    await this.enforceAppointmentManageAccess(user, appointment);

    const clinicId = dto.clinicId ?? appointment.clinicId ?? null;
    const professionalId =
      dto.professionalId ?? appointment.professionalId ?? null;

    if (clinicId) {
      await this.ensureClinicExists(clinicId);
    }

    if (user.role === Role.PROFESSIONAL) {
      const professionalProfile =
        await this.professionalsService.getProfileByUserIdOrThrow(user.userId);

      if (professionalId !== professionalProfile.id) {
        throw new ForbiddenException(
          'Professionals can only manage their own appointments',
        );
      }
    }

    if (clinicId && user.role === Role.CLINIC_ADMIN) {
      await this.ensureClinicAdminMembership(user.userId, clinicId);
    }

    if (professionalId) {
      await this.ensureProfessionalBelongsToClinic(professionalId, clinicId);
    }

    const updated = await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        clinicId,
        professionalId,
        scheduledAt: dto.scheduledAt,
        endAt: dto.endAt,
        location: dto.location,
        notes: dto.notes,
        status: dto.status,
      },
      include: this.appointmentInclude,
    });

    await this.auditLogsService.create({
      actorId: user.userId,
      action: 'appointment_update',
      entityType: 'Appointment',
      entityId: appointmentId,
      metadata: {
        fromStatus: appointment.status,
        toStatus: updated.status,
      },
    });

    return updated;
  }

  async cancel(
    user: RequestUser,
    appointmentId: string,
    dto: CancelAppointmentDto,
  ) {
    const appointment = await this.getAppointmentOrThrow(appointmentId);
    await this.enforceAppointmentManageAccess(user, appointment);

    const updated = await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: AppointmentStatus.CANCELLED,
        cancellationReason: dto.reason,
      },
      include: this.appointmentInclude,
    });

    await this.auditLogsService.create({
      actorId: user.userId,
      action: 'appointment_cancel',
      entityType: 'Appointment',
      entityId: appointmentId,
      metadata: {
        reason: dto.reason ?? null,
      },
    });

    return updated;
  }

  async list(user: RequestUser, dto: QueryAppointmentsDto) {
    const where: Prisma.AppointmentWhereInput = {};

    if (dto.status) {
      where.status = dto.status;
    }

    if (dto.patientId) {
      where.patientId = dto.patientId;
    }

    if (dto.professionalId) {
      where.professionalId = dto.professionalId;
    }

    if (user.role === Role.PATIENT) {
      const patientProfile = await this.patientsService.getProfileByUserIdOrThrow(
        user.userId,
      );
      where.patientId = patientProfile.id;
    } else if (user.role === Role.CLINIC_ADMIN) {
      const clinicIds = await this.getClinicAdminClinicIds(user.userId);

      if (clinicIds.length === 0) {
        return {
          data: [],
          meta: createPaginationMeta(dto.page, dto.limit, 0),
        };
      }

      where.clinicId = dto.clinicId
        ? dto.clinicId
        : {
            in: clinicIds,
          };

      if (dto.clinicId && !clinicIds.includes(dto.clinicId)) {
        throw new ForbiddenException('You do not have access to this clinic');
      }
    } else if (user.role === Role.PROFESSIONAL) {
      const professionalProfile =
        await this.professionalsService.getProfileByUserIdOrThrow(user.userId);
      where.professionalId = professionalProfile.id;
    } else if (dto.clinicId) {
      where.clinicId = dto.clinicId;
    }

    const { skip, take } = getPagination(dto.page, dto.limit);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.appointment.findMany({
        where,
        include: this.appointmentInclude,
        orderBy: {
          scheduledAt: 'desc',
        },
        skip,
        take,
      }),
      this.prisma.appointment.count({ where }),
    ]);

    return {
      data: items,
      meta: createPaginationMeta(dto.page, dto.limit, total),
    };
  }

  private async getAppointmentOrThrow(appointmentId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }

  private async enforceAppointmentWriteAccess(
    user: RequestUser,
    clinicId: string | null,
    professionalId: string | null,
  ) {
    if (user.role === Role.SUPER_ADMIN) {
      return;
    }

    if (user.role === Role.CLINIC_ADMIN) {
      if (!clinicId) {
        throw new BadRequestException(
          'clinicId is required for clinic admin appointment creation',
        );
      }

      await this.ensureClinicAdminMembership(user.userId, clinicId);
      return;
    }

    if (user.role === Role.PROFESSIONAL) {
      const professionalProfile =
        await this.professionalsService.getProfileByUserIdOrThrow(user.userId);

      if (!professionalId || professionalId !== professionalProfile.id) {
        throw new ForbiddenException(
          'Professionals can only create appointments assigned to themselves',
        );
      }

      if (clinicId) {
        const membership = await this.prisma.clinicMember.findFirst({
          where: {
            clinicId,
            userId: user.userId,
            role: Role.PROFESSIONAL,
          },
        });

        if (!membership) {
          throw new ForbiddenException(
            'Professional is not assigned to the target clinic',
          );
        }
      }

      return;
    }

    throw new ForbiddenException('You are not allowed to create appointments');
  }

  private async enforceAppointmentManageAccess(
    user: RequestUser,
    appointment: {
      clinicId: string | null;
      professionalId: string | null;
      patientId: string;
    },
  ) {
    if (user.role === Role.SUPER_ADMIN) {
      return;
    }

    if (user.role === Role.CLINIC_ADMIN) {
      if (!appointment.clinicId) {
        throw new ForbiddenException('This appointment is not linked to a clinic');
      }

      await this.ensureClinicAdminMembership(user.userId, appointment.clinicId);
      return;
    }

    if (user.role === Role.PROFESSIONAL) {
      const professionalProfile =
        await this.professionalsService.getProfileByUserIdOrThrow(user.userId);

      if (appointment.professionalId !== professionalProfile.id) {
        throw new ForbiddenException(
          'Professionals can only manage their own appointments',
        );
      }

      return;
    }

    throw new ForbiddenException('You are not allowed to manage this appointment');
  }

  private async ensureClinicAdminMembership(userId: string, clinicId: string) {
    const membership = await this.prisma.clinicMember.findFirst({
      where: {
        clinicId,
        userId,
        role: Role.CLINIC_ADMIN,
      },
    });

    if (!membership) {
      throw new ForbiddenException('You do not have access to this clinic');
    }
  }

  private async getClinicAdminClinicIds(userId: string) {
    const memberships = await this.prisma.clinicMember.findMany({
      where: {
        userId,
        role: Role.CLINIC_ADMIN,
      },
      select: {
        clinicId: true,
      },
    });

    return memberships.map((membership) => membership.clinicId);
  }

  private async ensureProfessionalBelongsToClinic(
    professionalId: string,
    clinicId: string | null,
  ) {
    if (!clinicId) {
      return;
    }

    const professional = await this.prisma.professionalProfile.findUnique({
      where: { id: professionalId },
      include: {
        user: {
          include: {
            clinicMemberships: {
              where: {
                clinicId,
              },
            },
          },
        },
      },
    });

    if (!professional) {
      throw new NotFoundException('Professional not found');
    }

    if (professional.user.clinicMemberships.length === 0) {
      throw new BadRequestException(
        'Professional must belong to the appointment clinic',
      );
    }
  }

  private async ensureClinicExists(clinicId: string) {
    const clinic = await this.prisma.clinic.findUnique({
      where: { id: clinicId },
      select: { id: true },
    });

    if (!clinic) {
      throw new NotFoundException('Clinic not found');
    }
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
    professional: {
      include: {
        user: {
          select: publicUserSelect,
        },
      },
    },
    createdBy: {
      select: publicUserSelect,
    },
  } as const;
}
