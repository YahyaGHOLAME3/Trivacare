import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CareRequestStatus, Role } from '@prisma/client';

import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { RequestUser } from '../common/interfaces/request-user.interface';
import { PatientsService } from '../patients/patients.service';
import { PrismaService } from '../prisma/prisma.service';
import { publicUserSelect } from '../users/user.select';
import { AssignCareRequestClinicDto } from './dto/assign-care-request-clinic.dto';
import { AssignCareRequestProfessionalDto } from './dto/assign-care-request-professional.dto';
import { CreateCareRequestDto } from './dto/create-care-request.dto';
import { UpdateCareRequestStatusDto } from './dto/update-care-request-status.dto';

@Injectable()
export class CareRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly patientsService: PatientsService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async create(user: RequestUser, dto: CreateCareRequestDto) {
    const allowedInitialStatuses: CareRequestStatus[] = [
      CareRequestStatus.DRAFT,
      CareRequestStatus.SUBMITTED,
    ];

    if (dto.status && !allowedInitialStatuses.includes(dto.status)) {
      throw new BadRequestException(
        'Patients can only create DRAFT or SUBMITTED care requests',
      );
    }

    const patientProfile = await this.patientsService.getProfileByUserIdOrThrow(
      user.userId,
    );

    return this.prisma.careRequest.create({
      data: {
        patientId: patientProfile.id,
        title: dto.title,
        description: dto.description,
        preferredDate: dto.preferredDate,
        status: dto.status ?? CareRequestStatus.SUBMITTED,
      },
    });
  }

  async updateStatus(
    user: RequestUser,
    careRequestId: string,
    dto: UpdateCareRequestStatusDto,
  ) {
    const careRequest = await this.getCareRequestOrThrow(careRequestId);

    await this.ensureClinicAdminAccess(user, careRequest.clinicId);

    const updated = await this.prisma.careRequest.update({
      where: { id: careRequestId },
      data: {
        status: dto.status,
      },
    });

    await this.auditLogsService.create({
      actorId: user.userId,
      action: 'care_request_status_change',
      entityType: 'CareRequest',
      entityId: careRequestId,
      metadata: {
        from: careRequest.status,
        to: dto.status,
      },
    });

    return updated;
  }

  async assignClinic(
    user: RequestUser,
    careRequestId: string,
    dto: AssignCareRequestClinicDto,
  ) {
    const clinic = await this.prisma.clinic.findUnique({
      where: { id: dto.clinicId },
      select: { id: true },
    });

    if (!clinic) {
      throw new NotFoundException('Clinic not found');
    }

    await this.ensureClinicAdminAccess(user, dto.clinicId);

    const careRequest = await this.getCareRequestOrThrow(careRequestId);

    const updated = await this.prisma.careRequest.update({
      where: { id: careRequestId },
      data: {
        clinicId: dto.clinicId,
      },
      include: {
        clinic: true,
        patient: {
          include: {
            user: {
              select: publicUserSelect,
            },
          },
        },
      },
    });

    await this.auditLogsService.create({
      actorId: user.userId,
      action: 'care_request_assign_clinic',
      entityType: 'CareRequest',
      entityId: careRequestId,
      metadata: {
        previousClinicId: careRequest.clinicId,
        clinicId: dto.clinicId,
      },
    });

    return updated;
  }

  async assignProfessional(
    user: RequestUser,
    careRequestId: string,
    dto: AssignCareRequestProfessionalDto,
  ) {
    const careRequest = await this.getCareRequestOrThrow(careRequestId);

    if (!careRequest.clinicId) {
      throw new BadRequestException(
        'Assign a clinic before assigning a professional',
      );
    }

    await this.ensureClinicAdminAccess(user, careRequest.clinicId);

    const professional = await this.prisma.professionalProfile.findUnique({
      where: { id: dto.professionalId },
      include: {
        user: {
          include: {
            clinicMemberships: {
              where: { clinicId: careRequest.clinicId },
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
        'Professional must belong to the assigned clinic',
      );
    }

    const updated = await this.prisma.careRequest.update({
      where: { id: careRequestId },
      data: {
        professionalId: dto.professionalId,
      },
      include: {
        professional: {
          include: {
            user: {
              select: publicUserSelect,
            },
          },
        },
      },
    });

    await this.auditLogsService.create({
      actorId: user.userId,
      action: 'care_request_assign_professional',
      entityType: 'CareRequest',
      entityId: careRequestId,
      metadata: {
        previousProfessionalId: careRequest.professionalId,
        professionalId: dto.professionalId,
      },
    });

    return updated;
  }

  private async getCareRequestOrThrow(careRequestId: string) {
    const careRequest = await this.prisma.careRequest.findUnique({
      where: { id: careRequestId },
    });

    if (!careRequest) {
      throw new NotFoundException('Care request not found');
    }

    return careRequest;
  }

  private async ensureClinicAdminAccess(
    user: RequestUser,
    clinicId: string | null,
  ): Promise<void> {
    if (user.role === Role.SUPER_ADMIN) {
      return;
    }

    if (!clinicId) {
      throw new ForbiddenException('This care request is not assigned to a clinic');
    }

    const membership = await this.prisma.clinicMember.findFirst({
      where: {
        clinicId,
        userId: user.userId,
        role: Role.CLINIC_ADMIN,
      },
    });

    if (!membership) {
      throw new ForbiddenException('You do not have access to this clinic');
    }
  }
}
