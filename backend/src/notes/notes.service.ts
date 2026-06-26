import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';

import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { RequestUser } from '../common/interfaces/request-user.interface';
import {
  createPaginationMeta,
  getPagination,
} from '../common/utils/pagination.util';
import { PrismaService } from '../prisma/prisma.service';
import { ProfessionalsService } from '../professionals/professionals.service';
import { publicUserSelect } from '../users/user.select';
import { CreateClinicalNoteDto } from './dto/create-clinical-note.dto';
import { QueryClinicalNotesDto } from './dto/query-clinical-notes.dto';
import { UpdateClinicalNoteDto } from './dto/update-clinical-note.dto';

@Injectable()
export class NotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly professionalsService: ProfessionalsService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async create(user: RequestUser, dto: CreateClinicalNoteDto) {
    const professionalProfile =
      await this.professionalsService.getProfileByUserIdOrThrow(user.userId);

    await this.ensureProfessionalPatientAccess(professionalProfile.id, dto);

    const note = await this.prisma.clinicalNote.create({
      data: {
        patientId: dto.patientId,
        professionalId: professionalProfile.id,
        careRequestId: dto.careRequestId,
        appointmentId: dto.appointmentId,
        content: dto.content,
      },
      include: this.noteInclude,
    });

    await this.auditLogsService.create({
      actorId: user.userId,
      action: 'clinical_note_create',
      entityType: 'ClinicalNote',
      entityId: note.id,
      metadata: {
        patientId: note.patientId,
        professionalId: note.professionalId,
      },
    });

    return note;
  }

  async list(user: RequestUser, dto: QueryClinicalNotesDto) {
    const where: Prisma.ClinicalNoteWhereInput = {};

    if (dto.patientId) {
      where.patientId = dto.patientId;
    }

    if (dto.careRequestId) {
      where.careRequestId = dto.careRequestId;
    }

    if (dto.appointmentId) {
      where.appointmentId = dto.appointmentId;
    }

    if (user.role === Role.PROFESSIONAL) {
      const professionalProfile =
        await this.professionalsService.getProfileByUserIdOrThrow(user.userId);
      where.professionalId = professionalProfile.id;
    }

    const { skip, take } = getPagination(dto.page, dto.limit);
    const [items, total] = await this.prisma.$transaction([
      this.prisma.clinicalNote.findMany({
        where,
        include: this.noteInclude,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take,
      }),
      this.prisma.clinicalNote.count({ where }),
    ]);

    return {
      data: items,
      meta: createPaginationMeta(dto.page, dto.limit, total),
    };
  }

  async update(user: RequestUser, noteId: string, dto: UpdateClinicalNoteDto) {
    const note = await this.getNoteOrThrow(noteId);
    await this.ensureNoteWriteAccess(user, note.professionalId);

    const updated = await this.prisma.clinicalNote.update({
      where: { id: noteId },
      data: {
        content: dto.content,
      },
      include: this.noteInclude,
    });

    await this.auditLogsService.create({
      actorId: user.userId,
      action: 'clinical_note_update',
      entityType: 'ClinicalNote',
      entityId: noteId,
      metadata: {
        patientId: updated.patientId,
      },
    });

    return updated;
  }

  async remove(user: RequestUser, noteId: string) {
    const note = await this.getNoteOrThrow(noteId);
    await this.ensureNoteWriteAccess(user, note.professionalId);

    await this.prisma.clinicalNote.delete({
      where: { id: noteId },
    });

    await this.auditLogsService.create({
      actorId: user.userId,
      action: 'clinical_note_delete',
      entityType: 'ClinicalNote',
      entityId: noteId,
      metadata: {
        patientId: note.patientId,
      },
    });

    return {
      message: 'Clinical note deleted successfully',
    };
  }

  private async getNoteOrThrow(noteId: string) {
    const note = await this.prisma.clinicalNote.findUnique({
      where: { id: noteId },
    });

    if (!note) {
      throw new NotFoundException('Clinical note not found');
    }

    return note;
  }

  private async ensureNoteWriteAccess(
    user: RequestUser,
    professionalId: string,
  ): Promise<void> {
    if (user.role === Role.SUPER_ADMIN) {
      return;
    }

    const professionalProfile =
      await this.professionalsService.getProfileByUserIdOrThrow(user.userId);

    if (professionalProfile.id !== professionalId) {
      throw new ForbiddenException('You can only manage your own clinical notes');
    }
  }

  private async ensureProfessionalPatientAccess(
    professionalId: string,
    dto: CreateClinicalNoteDto,
  ): Promise<void> {
    if (dto.careRequestId) {
      const careRequest = await this.prisma.careRequest.findUnique({
        where: { id: dto.careRequestId },
      });

      if (!careRequest) {
        throw new NotFoundException('Care request not found');
      }

      if (
        careRequest.professionalId !== professionalId ||
        careRequest.patientId !== dto.patientId
      ) {
        throw new ForbiddenException(
          'You can only create notes for your assigned care requests',
        );
      }
    }

    if (dto.appointmentId) {
      const appointment = await this.prisma.appointment.findUnique({
        where: { id: dto.appointmentId },
      });

      if (!appointment) {
        throw new NotFoundException('Appointment not found');
      }

      if (
        appointment.professionalId !== professionalId ||
        appointment.patientId !== dto.patientId
      ) {
        throw new ForbiddenException(
          'You can only create notes for your assigned appointments',
        );
      }
    }

    const hasAccess = await this.prisma.patientProfile.count({
      where: {
        id: dto.patientId,
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
      },
    });

    if (!hasAccess) {
      throw new BadRequestException(
        'You can only create notes for patients assigned to you',
      );
    }
  }

  private readonly noteInclude = {
    patient: {
      include: {
        user: {
          select: publicUserSelect,
        },
      },
    },
    professional: {
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
