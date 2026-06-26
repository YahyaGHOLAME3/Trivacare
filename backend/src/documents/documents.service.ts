import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';

import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { RequestUser } from '../common/interfaces/request-user.interface';
import { buildDocumentStorageKey } from '../common/utils/storage.util';
import { PatientsService } from '../patients/patients.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProfessionalsService } from '../professionals/professionals.service';
import { publicUserSelect } from '../users/user.select';
import { CreateDocumentDto } from './dto/create-document.dto';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly patientsService: PatientsService,
    private readonly professionalsService: ProfessionalsService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async create(user: RequestUser, dto: CreateDocumentDto) {
    await this.patientsService.getProfileByIdOrThrow(dto.patientId);
    await this.ensureDocumentAccess(user, dto.patientId, dto.careRequestId);

    if (dto.careRequestId) {
      const careRequest = await this.prisma.careRequest.findUnique({
        where: { id: dto.careRequestId },
      });

      if (!careRequest) {
        throw new NotFoundException('Care request not found');
      }

      if (careRequest.patientId !== dto.patientId) {
        throw new BadRequestException(
          'The document patient must match the care request patient',
        );
      }
    }

    const document = await this.prisma.medicalDocument.create({
      data: {
        patientId: dto.patientId,
        careRequestId: dto.careRequestId,
        uploadedById: user.userId,
        fileName: dto.fileName,
        mimeType: dto.mimeType,
        fileSize: dto.fileSize,
        storageKey:
          dto.storageKey ?? buildDocumentStorageKey(dto.patientId, dto.fileName),
        documentType: dto.documentType,
      },
      include: {
        careRequest: true,
        patient: {
          include: {
            user: {
              select: publicUserSelect,
            },
          },
        },
        uploadedBy: {
          select: publicUserSelect,
        },
      },
    });

    await this.auditLogsService.create({
      actorId: user.userId,
      action: 'document_upload',
      entityType: 'MedicalDocument',
      entityId: document.id,
      metadata: {
        patientId: document.patientId,
        careRequestId: document.careRequestId,
        storageKey: document.storageKey,
      },
    });

    return document;
  }

  async getById(user: RequestUser, documentId: string) {
    const document = await this.getDocumentOrThrow(documentId);

    await this.ensureDocumentAccess(user, document.patientId, document.careRequestId);

    return this.prisma.medicalDocument.findUnique({
      where: { id: documentId },
      include: {
        careRequest: true,
        patient: {
          include: {
            user: {
              select: publicUserSelect,
            },
          },
        },
        uploadedBy: {
          select: publicUserSelect,
        },
      },
    });
  }

  async remove(user: RequestUser, documentId: string) {
    const document = await this.getDocumentOrThrow(documentId);

    await this.ensureDocumentAccess(user, document.patientId, document.careRequestId);

    await this.prisma.medicalDocument.delete({
      where: { id: documentId },
    });

    await this.auditLogsService.create({
      actorId: user.userId,
      action: 'document_delete',
      entityType: 'MedicalDocument',
      entityId: documentId,
      metadata: {
        patientId: document.patientId,
        careRequestId: document.careRequestId,
        storageKey: document.storageKey,
      },
    });

    return {
      message: 'Document deleted successfully',
    };
  }

  private async getDocumentOrThrow(documentId: string) {
    const document = await this.prisma.medicalDocument.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  private async ensureDocumentAccess(
    user: RequestUser,
    patientId: string,
    careRequestId?: string | null,
  ) {
    if (user.role === Role.SUPER_ADMIN) {
      return;
    }

    if (user.role === Role.PATIENT) {
      const patientProfile = await this.patientsService.getProfileByUserIdOrThrow(
        user.userId,
      );

      if (patientProfile.id !== patientId) {
        throw new ForbiddenException('You can only access your own documents');
      }

      return;
    }

    if (user.role === Role.CLINIC_ADMIN) {
      const clinicIds = await this.getClinicIdsForAdmin(user.userId);

      if (clinicIds.length === 0) {
        throw new ForbiddenException('You do not have clinic access');
      }

      if (careRequestId) {
        const careRequest = await this.prisma.careRequest.findUnique({
          where: { id: careRequestId },
        });

        if (!careRequest || !careRequest.clinicId || !clinicIds.includes(careRequest.clinicId)) {
          throw new ForbiddenException('You do not have access to this document');
        }

        return;
      }

      const hasAccess = await this.prisma.patientProfile.count({
        where: {
          id: patientId,
          OR: [
            {
              careRequests: {
                some: {
                  clinicId: {
                    in: clinicIds,
                  },
                },
              },
            },
            {
              appointments: {
                some: {
                  clinicId: {
                    in: clinicIds,
                  },
                },
              },
            },
          ],
        },
      });

      if (!hasAccess) {
        throw new ForbiddenException('You do not have access to this document');
      }

      return;
    }

    if (user.role === Role.PROFESSIONAL) {
      const professionalProfile =
        await this.professionalsService.getProfileByUserIdOrThrow(user.userId);

      if (careRequestId) {
        const careRequest = await this.prisma.careRequest.findUnique({
          where: { id: careRequestId },
        });

        if (
          !careRequest ||
          careRequest.professionalId !== professionalProfile.id ||
          careRequest.patientId !== patientId
        ) {
          throw new ForbiddenException('You do not have access to this document');
        }

        return;
      }

      const hasAccess = await this.prisma.patientProfile.count({
        where: {
          id: patientId,
          OR: [
            {
              careRequests: {
                some: {
                  professionalId: professionalProfile.id,
                },
              },
            },
            {
              appointments: {
                some: {
                  professionalId: professionalProfile.id,
                },
              },
            },
          ],
        },
      });

      if (!hasAccess) {
        throw new ForbiddenException('You do not have access to this document');
      }

      return;
    }
  }

  private async getClinicIdsForAdmin(userId: string) {
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
}
