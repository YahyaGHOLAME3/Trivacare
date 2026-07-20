import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma, Role, User } from '@prisma/client';
import * as argon2 from 'argon2';

import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { durationToMilliseconds } from '../common/utils/duration.util';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { toPublicUser } from '../users/user.mapper';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';

interface RequestMetadata {
  [key: string]: string | undefined;
  userAgent?: string;
  ipAddress?: string;
}

interface AccessTokenPayload {
  userId: string;
  role: Role;
  sessionId: string;
}

interface RefreshTokenPayload extends AccessTokenPayload {}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async register(dto: RegisterDto, metadata: RequestMetadata = {}) {
    if (dto.role === Role.SUPER_ADMIN) {
      throw new BadRequestException('SUPER_ADMIN accounts cannot be self-registered');
    }

    if (dto.role === Role.CLINIC_ADMIN && !dto.organizationName?.trim()) {
      throw new BadRequestException(
        'organizationName is required for clinic admin registration',
      );
    }

    if (dto.role === Role.PROFESSIONAL) {
      if (!dto.specialty?.trim()) {
        throw new BadRequestException(
          'specialty is required for professional registration',
        );
      }

      if (!dto.licenseNumber?.trim()) {
        throw new BadRequestException(
          'licenseNumber is required for professional registration',
        );
      }
    }

    const existingUser = await this.usersService.findByEmail(dto.email);

    if (existingUser) {
      throw new ConflictException('A user with this email already exists');
    }

    const passwordHash = await argon2.hash(dto.password);
    const medicalSummary = [
      dto.medicalSummary?.trim(),
      dto.medicalInterests?.length
        ? `Préférences médicales: ${dto.medicalInterests.join(', ')}`
        : undefined,
    ]
      .filter(Boolean)
      .join('\n\n');
    const user = await this.usersService.createUser({
      email: dto.email,
      passwordHash,
      role: dto.role,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      profile: {
        organizationName: dto.organizationName,
        specialty: dto.specialty,
        licenseNumber: dto.licenseNumber,
        dateOfBirth: dto.dateOfBirth,
        gender: dto.gender,
        address: dto.address,
        nationality: dto.nationality,
        insurer: dto.insurer,
        bloodType: dto.bloodType,
        medicalSummary: medicalSummary || undefined,
        emergencyContactName: dto.emergencyContactName,
        emergencyContactPhone: dto.emergencyContactPhone,
      },
    });
    const tokens = await this.issueTokens(user, metadata);

    await this.auditLogsService.create({
      actorId: user.id,
      action: 'auth_register',
      entityType: 'User',
      entityId: user.id,
      metadata: this.auditMetadata(metadata),
    });

    return {
      data: {
        user: toPublicUser(user),
        tokens: this.publicTokens(tokens),
      },
    };
  }

  async login(dto: LoginDto, metadata: RequestMetadata = {}) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await argon2.verify(user.passwordHash, dto.password);

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.issueTokens(user, metadata);

    await this.auditLogsService.create({
      actorId: user.id,
      action: 'auth_login',
      entityType: 'UserSession',
      entityId: tokens.sessionId,
      metadata: this.auditMetadata(metadata),
    });

    return {
      data: {
        user: toPublicUser(user),
        tokens: this.publicTokens(tokens),
      },
    };
  }

  async refresh(dto: RefreshTokenDto, metadata: RequestMetadata = {}) {
    const { session, user } = await this.validateRefreshToken(dto.refreshToken);

    await this.prisma.userSession.update({
      where: { id: session.id },
      data: {
        revokedAt: new Date(),
        lastSeenAt: new Date(),
      },
    });

    const tokens = await this.issueTokens(user, metadata);

    await this.auditLogsService.create({
      actorId: user.id,
      action: 'auth_refresh',
      entityType: 'UserSession',
      entityId: tokens.sessionId,
      metadata: this.auditMetadata({
        previousSessionId: session.id,
        ...metadata,
      }),
    });

    return {
      data: {
        user: toPublicUser(user),
        tokens: this.publicTokens(tokens),
      },
    };
  }

  async logout(dto: RefreshTokenDto) {
    const { session, user } = await this.validateRefreshToken(dto.refreshToken);

    await this.prisma.userSession.update({
      where: { id: session.id },
      data: {
        revokedAt: new Date(),
        lastSeenAt: new Date(),
      },
    });

    await this.auditLogsService.create({
      actorId: user.id,
      action: 'auth_logout',
      entityType: 'UserSession',
      entityId: session.id,
    });

    return {
      message: 'Logged out successfully',
    };
  }

  async me(userId: string) {
    return this.usersService.findPublicByIdOrThrow(userId);
  }

  private async issueTokens(user: User, metadata: RequestMetadata) {
    const refreshExpiresIn = this.configService.getOrThrow<string>(
      'auth.refreshExpiresIn',
    );
    const refreshExpiresAt = new Date(
      Date.now() + durationToMilliseconds(refreshExpiresIn),
    );
    const session = await this.prisma.userSession.create({
      data: {
        userId: user.id,
        refreshTokenHash: 'pending',
        userAgent: metadata.userAgent,
        ipAddress: metadata.ipAddress,
        expiresAt: refreshExpiresAt,
      },
    });

    const accessPayload: AccessTokenPayload = {
      userId: user.id,
      role: user.role,
      sessionId: session.id,
    };
    const refreshPayload: RefreshTokenPayload = accessPayload;
    const accessExpiresInSeconds = Math.floor(
      durationToMilliseconds(
        this.configService.getOrThrow<string>('auth.accessExpiresIn'),
      ) / 1000,
    );
    const refreshExpiresInSeconds = Math.floor(
      durationToMilliseconds(refreshExpiresIn) / 1000,
    );

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: this.configService.getOrThrow<string>('auth.accessSecret'),
        expiresIn: accessExpiresInSeconds,
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: this.configService.getOrThrow<string>('auth.refreshSecret'),
        expiresIn: refreshExpiresInSeconds,
      }),
    ]);

    await this.prisma.userSession.update({
      where: { id: session.id },
      data: {
        refreshTokenHash: await argon2.hash(refreshToken),
      },
    });

    return {
      accessToken,
      refreshToken,
      sessionId: session.id,
    };
  }

  private async validateRefreshToken(rawRefreshToken: string) {
    let payload: RefreshTokenPayload;

    try {
      payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(
        rawRefreshToken,
        {
          secret: this.configService.getOrThrow<string>('auth.refreshSecret'),
        },
      );
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const session = await this.prisma.userSession.findUnique({
      where: { id: payload.sessionId },
      include: {
        user: true,
      },
    });

    if (
      !session ||
      session.userId !== payload.userId ||
      session.revokedAt ||
      session.expiresAt <= new Date() ||
      !session.user.isActive
    ) {
      throw new UnauthorizedException('Refresh token has expired or is invalid');
    }

    const matches = await argon2.verify(
      session.refreshTokenHash,
      rawRefreshToken,
    );

    if (!matches) {
      throw new UnauthorizedException('Refresh token has expired or is invalid');
    }

    return {
      session,
      user: session.user,
    };
  }

  private publicTokens(tokens: {
    accessToken: string;
    refreshToken: string;
    sessionId: string;
  }) {
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  private auditMetadata(metadata: RequestMetadata): Prisma.InputJsonObject {
    return Object.fromEntries(
      Object.entries(metadata).filter((entry): entry is [string, string] =>
        typeof entry[1] === 'string',
      ),
    );
  }
}
