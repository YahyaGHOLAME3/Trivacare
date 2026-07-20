import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';

import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import {
  createPaginationMeta,
  getPagination,
} from '../common/utils/pagination.util';
import { slugify } from '../common/utils/slug.util';
import { RequestUser } from '../common/interfaces/request-user.interface';
import { PrismaService } from '../prisma/prisma.service';
import { publicUserSelect } from '../users/user.select';
import { AddClinicMemberDto } from './dto/add-clinic-member.dto';
import { CreateClinicDto } from './dto/create-clinic.dto';
import { UpdateClinicDto } from './dto/update-clinic.dto';

@Injectable()
export class ClinicsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(user: RequestUser, clinicId?: string) {
    const context = await this.resolveClinicContext(user, clinicId);

    return {
      data: {
        clinic: context.clinic,
        memberships: context.memberships,
        currentUser: context.currentUser,
      },
    };
  }

  async getDashboard(user: RequestUser, clinicId?: string) {
    const { clinic } = await this.resolveClinicContext(user, clinicId);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

    const [
      careRequestsByStatus,
      todayAppointments,
      upcomingAppointments,
      upcomingAppointmentItems,
      documentCount,
      unreadMessages,
      activeProfessionalCount,
      activePatientRows,
      recentCareRequests,
      recentDocuments,
    ] = await this.prisma.$transaction([
      this.prisma.careRequest.groupBy({
        by: ['status'],
        where: { clinicId: clinic.id },
        _count: { id: true },
      }),
      this.prisma.appointment.count({
        where: {
          clinicId: clinic.id,
          scheduledAt: { gte: startOfToday, lt: startOfTomorrow },
        },
      }),
      this.prisma.appointment.count({
        where: {
          clinicId: clinic.id,
          scheduledAt: { gte: now },
          status: { in: ['REQUESTED', 'CONFIRMED'] },
        },
      }),
      this.prisma.appointment.findMany({
        where: {
          clinicId: clinic.id,
          scheduledAt: { gte: now },
          status: { in: ['REQUESTED', 'CONFIRMED'] },
        },
        include: this.appointmentInclude,
        orderBy: { scheduledAt: 'asc' },
        take: 5,
      }),
      this.prisma.medicalDocument.count({
        where: this.clinicDocumentWhere(clinic.id),
      }),
      this.prisma.messageReceipt.count({
        where: {
          userId: user.userId,
          status: 'UNREAD',
          message: {
            conversation: {
              OR: [
                { careRequest: { clinicId: clinic.id } },
                { appointment: { clinicId: clinic.id } },
              ],
            },
          },
        },
      }),
      this.prisma.clinicMember.count({
        where: {
          clinicId: clinic.id,
          role: Role.PROFESSIONAL,
          user: { isActive: true },
        },
      }),
      this.prisma.patientProfile.findMany({
        where: this.clinicPatientWhere(clinic.id),
        select: { id: true },
        distinct: ['id'],
      }),
      this.prisma.careRequest.findMany({
        where: { clinicId: clinic.id },
        include: this.careRequestInclude,
        orderBy: { updatedAt: 'desc' },
        take: 5,
      }),
      this.prisma.medicalDocument.findMany({
        where: this.clinicDocumentWhere(clinic.id),
        include: this.documentInclude,
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    return {
      data: {
        metrics: {
          careRequestsByStatus,
          todayAppointments,
          upcomingAppointments,
          documentCount,
          unreadMessages,
          activeProfessionals: activeProfessionalCount,
          activePatients: activePatientRows.length,
        },
        upcoming: {
          appointments: upcomingAppointmentItems,
        },
        recent: {
          careRequests: recentCareRequests,
          documents: recentDocuments,
        },
        alerts: [],
      },
    };
  }

  async listPatients(
    user: RequestUser,
    dto: PaginationQueryDto,
    clinicId?: string,
  ) {
    const { clinic } = await this.resolveClinicContext(user, clinicId);
    const { page, limit } = dto;
    const { skip, take } = getPagination(page, limit);
    const where = this.clinicPatientWhere(clinic.id);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.patientProfile.findMany({
        where,
        include: {
          user: {
            select: publicUserSelect,
          },
          careRequests: {
            where: { clinicId: clinic.id },
            orderBy: { updatedAt: 'desc' },
            take: 3,
            include: {
              professional: {
                include: {
                  user: {
                    select: publicUserSelect,
                  },
                },
              },
            },
          },
          appointments: {
            where: { clinicId: clinic.id },
            orderBy: { scheduledAt: 'desc' },
            take: 3,
            include: {
              professional: {
                include: {
                  user: {
                    select: publicUserSelect,
                  },
                },
              },
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
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

  async listDocuments(
    user: RequestUser,
    dto: PaginationQueryDto,
    clinicId?: string,
  ) {
    const { clinic } = await this.resolveClinicContext(user, clinicId);
    const { page, limit } = dto;
    const { skip, take } = getPagination(page, limit);
    const where = this.clinicDocumentWhere(clinic.id);

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

  async listPlanning(
    user: RequestUser,
    dto: PaginationQueryDto,
    clinicId?: string,
  ) {
    const { clinic } = await this.resolveClinicContext(user, clinicId);
    const { page, limit } = dto;
    const { skip, take } = getPagination(page, limit);
    const where = { clinicId: clinic.id };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.appointment.findMany({
        where,
        include: this.appointmentInclude,
        orderBy: { scheduledAt: 'asc' },
        skip,
        take,
      }),
      this.prisma.appointment.count({ where }),
    ]);

    return {
      data: items,
      meta: createPaginationMeta(page, limit, total),
    };
  }

  async create(dto: CreateClinicDto) {
    const slug = slugify(dto.slug ?? dto.name);

    return this.prisma.clinic.create({
      data: {
        name: dto.name,
        slug,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
      },
    });
  }

  async getById(user: RequestUser, clinicId: string) {
    await this.ensureClinicAccess(user, clinicId);

    const clinic = await this.prisma.clinic.findUnique({
      where: { id: clinicId },
      include: {
        members: {
          include: {
            user: {
              select: publicUserSelect,
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!clinic) {
      throw new NotFoundException('Clinic not found');
    }

    return clinic;
  }

  async update(user: RequestUser, clinicId: string, dto: UpdateClinicDto) {
    await this.ensureClinicAccess(user, clinicId);

    return this.prisma.clinic.update({
      where: { id: clinicId },
      data: {
        name: dto.name,
        slug: dto.slug ? slugify(dto.slug) : undefined,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
      },
    });
  }

  async addMember(
    user: RequestUser,
    clinicId: string,
    dto: AddClinicMemberDto,
  ) {
    await this.ensureClinicAccess(user, clinicId);

    const allowedRoles: Role[] = [Role.CLINIC_ADMIN, Role.PROFESSIONAL];

    if (!allowedRoles.includes(dto.role)) {
      throw new BadRequestException(
        'Clinic members must be CLINIC_ADMIN or PROFESSIONAL',
      );
    }

    const targetUser = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    if (targetUser.role !== dto.role) {
      throw new BadRequestException(
        `User role must be ${dto.role} before adding them to a clinic`,
      );
    }

    return this.prisma.clinicMember.upsert({
      where: {
        clinicId_userId: {
          clinicId,
          userId: dto.userId,
        },
      },
      update: {
        role: dto.role,
      },
      create: {
        clinicId,
        userId: dto.userId,
        role: dto.role,
      },
      include: {
        user: {
          select: publicUserSelect,
        },
        clinic: true,
      },
    });
  }

  async listCareRequests(
    user: RequestUser,
    clinicId: string,
    dto: PaginationQueryDto,
  ) {
    await this.ensureClinicAccess(user, clinicId);
    const { page, limit } = dto;
    const { skip, take } = getPagination(page, limit);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.careRequest.findMany({
        where: { clinicId },
        include: {
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
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take,
      }),
      this.prisma.careRequest.count({
        where: { clinicId },
      }),
    ]);

    return {
      data: items,
      meta: createPaginationMeta(page, limit, total),
    };
  }

  async listAppointments(
    user: RequestUser,
    clinicId: string,
    dto: PaginationQueryDto,
  ) {
    await this.ensureClinicAccess(user, clinicId);
    const { page, limit } = dto;
    const { skip, take } = getPagination(page, limit);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.appointment.findMany({
        where: { clinicId },
        include: {
          patient: {
            include: {
              user: {
                select: publicUserSelect,
              },
            },
          },
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
        where: { clinicId },
      }),
    ]);

    return {
      data: items,
      meta: createPaginationMeta(page, limit, total),
    };
  }

  private async ensureClinicAccess(user: RequestUser, clinicId: string) {
    const clinic = await this.prisma.clinic.findUnique({
      where: { id: clinicId },
      select: { id: true },
    });

    if (!clinic) {
      throw new NotFoundException('Clinic not found');
    }

    if (user.role === Role.SUPER_ADMIN) {
      return;
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

  private async resolveClinicContext(user: RequestUser, clinicId?: string) {
    if (user.role === Role.SUPER_ADMIN) {
      const clinic = clinicId
        ? await this.prisma.clinic.findUnique({
            where: { id: clinicId },
            include: this.clinicInclude,
          })
        : await this.prisma.clinic.findFirst({
            include: this.clinicInclude,
            orderBy: { createdAt: 'asc' },
          });

      if (!clinic) {
        throw new NotFoundException('Clinic not found');
      }

      const memberships = await this.prisma.clinicMember.findMany({
        where: { clinicId: clinic.id },
        include: {
          user: {
            select: publicUserSelect,
          },
          clinic: true,
        },
        orderBy: { createdAt: 'asc' },
      });
      const currentUser = await this.prisma.user.findUnique({
        where: { id: user.userId },
        select: publicUserSelect,
      });

      return { clinic, memberships, currentUser };
    }

    const memberships = await this.prisma.clinicMember.findMany({
      where: {
        userId: user.userId,
        role: Role.CLINIC_ADMIN,
        ...(clinicId ? { clinicId } : {}),
      },
      include: {
        user: {
          select: publicUserSelect,
        },
        clinic: {
          include: this.clinicInclude,
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (memberships.length === 0) {
      throw new ForbiddenException('You do not have access to this clinic');
    }

    const currentMembership = memberships[0];
    const allMemberships = clinicId
      ? await this.prisma.clinicMember.findMany({
          where: {
            userId: user.userId,
            role: Role.CLINIC_ADMIN,
          },
          include: {
            user: {
              select: publicUserSelect,
            },
            clinic: true,
          },
          orderBy: { createdAt: 'asc' },
        })
      : memberships;

    return {
      clinic: currentMembership.clinic,
      memberships: allMemberships,
      currentUser: currentMembership.user,
    };
  }

  private clinicPatientWhere(clinicId: string): Prisma.PatientProfileWhereInput {
    return {
      OR: [
        {
          careRequests: {
            some: { clinicId },
          },
        },
        {
          appointments: {
            some: { clinicId },
          },
        },
      ],
    };
  }

  private clinicDocumentWhere(clinicId: string): Prisma.MedicalDocumentWhereInput {
    return {
      OR: [
        {
          careRequest: {
            clinicId,
          },
        },
        {
          patient: {
            appointments: {
              some: { clinicId },
            },
          },
        },
      ],
    };
  }

  private readonly clinicInclude = {
    members: {
      include: {
        user: {
          select: publicUserSelect,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    },
  } as const;

  private readonly careRequestInclude = {
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
  } as const;

  private readonly appointmentInclude = {
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
}
