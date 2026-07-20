import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role, User } from '@prisma/client';

import { slugify } from '../common/utils/slug.util';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateCurrentUserDto } from './dto/update-current-user.dto';
import { toPublicUser } from './user.mapper';
import { publicUserSelect } from './user.select';

interface CreateUserInput {
  email: string;
  passwordHash: string;
  role: Role;
  firstName?: string;
  lastName?: string;
  phone?: string;
  profile?: {
    organizationName?: string;
    specialty?: string;
    licenseNumber?: string;
    dateOfBirth?: string;
    gender?: string;
    address?: string;
    nationality?: string;
    insurer?: string;
    bloodType?: string;
    medicalSummary?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
  };
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(input: CreateUserInput) {
    const email = input.email.toLowerCase();
    const existingUser = await this.prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      throw new ConflictException('A user with this email already exists');
    }

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash: input.passwordHash,
          role: input.role,
          firstName: input.firstName,
          lastName: input.lastName,
          phone: input.phone,
        },
      });

      if (input.role === Role.PATIENT) {
        await tx.patientProfile.create({
          data: {
            userId: user.id,
            dateOfBirth: input.profile?.dateOfBirth
              ? new Date(input.profile.dateOfBirth)
              : undefined,
            gender: input.profile?.gender,
            address: input.profile?.address,
            nationality: input.profile?.nationality,
            insurer: input.profile?.insurer,
            bloodType: input.profile?.bloodType,
            medicalSummary: input.profile?.medicalSummary,
            emergencyContactName: input.profile?.emergencyContactName,
            emergencyContactPhone: input.profile?.emergencyContactPhone,
          },
        });
      }

      if (input.role === Role.PROFESSIONAL) {
        await tx.professionalProfile.create({
          data: {
            userId: user.id,
            specialty: input.profile?.specialty,
            licenseNumber: input.profile?.licenseNumber,
          },
        });
      }

      if (input.role === Role.CLINIC_ADMIN) {
        const name = input.profile?.organizationName?.trim() || `${email} clinic`;
        const clinic = await tx.clinic.create({
          data: {
            name,
            slug: await this.uniqueClinicSlug(tx, name),
          },
        });

        await tx.clinicMember.create({
          data: {
            clinicId: clinic.id,
            userId: user.id,
            role: Role.CLINIC_ADMIN,
          },
        });
      }

      return user;
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  async findById(userId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }

  async findPublicByIdOrThrow(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: publicUserSelect,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return toPublicUser(user);
  }

  async getCurrentUser(userId: string) {
    return this.findPublicByIdOrThrow(userId);
  }

  async updateCurrentUser(userId: string, dto: UpdateCurrentUserDto) {
    try {
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: {
          ...(dto.firstName !== undefined ? { firstName: dto.firstName } : {}),
          ...(dto.lastName !== undefined ? { lastName: dto.lastName } : {}),
          ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
        },
        select: publicUserSelect,
      });

      return toPublicUser(user);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('User not found');
      }

      throw error;
    }
  }

  private async uniqueClinicSlug(
    tx: Prisma.TransactionClient,
    clinicName: string,
  ) {
    const baseSlug = slugify(clinicName) || 'clinic';
    let slug = baseSlug;
    let suffix = 1;

    while (await tx.clinic.findUnique({ where: { slug } })) {
      suffix += 1;
      slug = `${baseSlug}-${suffix}`;
    }

    return slug;
  }
}
