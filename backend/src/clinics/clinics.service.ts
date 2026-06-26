import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';

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
}
