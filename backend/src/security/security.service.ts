import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { MfaMethodType } from '@prisma/client';
import * as argon2 from 'argon2';
import { createHmac, randomBytes } from 'crypto';

import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { RequestUser } from '../common/interfaces/request-user.interface';
import { PrismaService } from '../prisma/prisma.service';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class SecurityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async enrollTotp(user: RequestUser) {
    const secret = toBase32(randomBytes(20));
    const method = await this.prisma.mfaMethod.create({
      data: {
        userId: user.userId,
        type: MfaMethodType.TOTP,
        secret,
      },
    });

    await this.auditLogsService.create({
      actorId: user.userId,
      action: 'mfa_totp_enroll_start',
      entityType: 'MfaMethod',
      entityId: method.id,
    });

    return {
      methodId: method.id,
      type: method.type,
      secret,
      otpauthUrl: `otpauth://totp/Trivacare:${user.userId}?secret=${secret}&issuer=Trivacare`,
    };
  }

  async verifyTotp(user: RequestUser, code: string) {
    const method = await this.getLatestTotpOrThrow(user.userId);

    if (!verifyTotpCode(method.secret, code)) {
      throw new UnauthorizedException('Invalid verification code');
    }

    const recoveryCodes = this.generateRecoveryCodes();
    const codeHashes = await Promise.all(
      recoveryCodes.map((recoveryCode) => argon2.hash(recoveryCode)),
    );

    await this.prisma.$transaction([
      this.prisma.mfaMethod.update({
        where: { id: method.id },
        data: { verifiedAt: new Date() },
      }),
      this.prisma.recoveryCode.deleteMany({
        where: { userId: user.userId, usedAt: null },
      }),
      this.prisma.recoveryCode.createMany({
        data: codeHashes.map((codeHash) => ({
          userId: user.userId,
          codeHash,
        })),
      }),
    ]);

    await this.auditLogsService.create({
      actorId: user.userId,
      action: 'mfa_totp_verify',
      entityType: 'MfaMethod',
      entityId: method.id,
    });

    return {
      verified: true,
      recoveryCodes,
    };
  }

  async disableMfa(user: RequestUser, code?: string) {
    await this.verifyStepUp(user.userId, code);

    const result = await this.prisma.mfaMethod.updateMany({
      where: {
        userId: user.userId,
        disabledAt: null,
      },
      data: {
        disabledAt: new Date(),
      },
    });

    await this.prisma.recoveryCode.updateMany({
      where: {
        userId: user.userId,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    });

    await this.auditLogsService.create({
      actorId: user.userId,
      action: 'mfa_disable',
      entityType: 'User',
      entityId: user.userId,
      metadata: { count: result.count },
    });

    return { disabledCount: result.count };
  }

  async listSessions(user: RequestUser) {
    const now = new Date();

    if (user.sessionId) {
      await this.prisma.userSession.updateMany({
        where: {
          id: user.sessionId,
          userId: user.userId,
          revokedAt: null,
          expiresAt: {
            gt: now,
          },
        },
        data: {
          lastSeenAt: now,
        },
      });
    }

    const sessions = await this.prisma.userSession.findMany({
      where: {
        userId: user.userId,
        revokedAt: null,
        expiresAt: {
          gt: now,
        },
      },
      orderBy: { lastSeenAt: 'desc' },
    });

    return sessions.map((session) => ({
      id: session.id,
      userAgent: session.userAgent,
      ipAddress: session.ipAddress,
      device: describeDevice(session.userAgent),
      expiresAt: session.expiresAt,
      lastSeenAt: session.lastSeenAt,
      revokedAt: session.revokedAt,
      createdAt: session.createdAt,
      isCurrent: session.id === user.sessionId,
    }));
  }

  async revokeSession(user: RequestUser, sessionId: string, stepUpCode?: string) {
    const session = await this.prisma.userSession.findFirst({
      where: {
        id: sessionId,
        userId: user.userId,
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.id !== user.sessionId) {
      await this.verifyStepUp(user.userId, stepUpCode);
    }

    await this.prisma.userSession.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    });

    await this.auditLogsService.create({
      actorId: user.userId,
      action: 'session_revoke',
      entityType: 'UserSession',
      entityId: sessionId,
      metadata: { current: session.id === user.sessionId },
    });

    return { revoked: true };
  }

  async revokeOtherSessions(user: RequestUser, stepUpCode?: string) {
    await this.verifyStepUp(user.userId, stepUpCode);

    const result = await this.prisma.userSession.updateMany({
      where: {
        userId: user.userId,
        id: {
          not: user.sessionId ?? '',
        },
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    await this.auditLogsService.create({
      actorId: user.userId,
      action: 'session_revoke_others',
      entityType: 'User',
      entityId: user.userId,
      metadata: { count: result.count },
    });

    return { revokedCount: result.count };
  }

  async changePassword(user: RequestUser, dto: ChangePasswordDto) {
    await this.verifyStepUp(user.userId, dto.stepUpCode);

    const record = await this.prisma.user.findUnique({
      where: { id: user.userId },
    });

    if (!record) {
      throw new NotFoundException('User not found');
    }

    const passwordMatches = await argon2.verify(
      record.passwordHash,
      dto.currentPassword,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid current password');
    }

    await this.prisma.user.update({
      where: { id: user.userId },
      data: {
        passwordHash: await argon2.hash(dto.newPassword),
      },
    });

    await this.prisma.userSession.updateMany({
      where: {
        userId: user.userId,
        id: {
          not: user.sessionId ?? '',
        },
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    await this.auditLogsService.create({
      actorId: user.userId,
      action: 'password_change',
      entityType: 'User',
      entityId: user.userId,
    });

    return { changed: true };
  }

  async verifyStepUp(userId: string, code?: string) {
    const method = await this.prisma.mfaMethod.findFirst({
      where: {
        userId,
        type: MfaMethodType.TOTP,
        verifiedAt: { not: null },
        disabledAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!method) {
      return;
    }

    if (!code) {
      throw new UnauthorizedException('Step-up authentication is required');
    }

    if (verifyTotpCode(method.secret, code)) {
      return;
    }

    const recoveryCodes = await this.prisma.recoveryCode.findMany({
      where: {
        userId,
        usedAt: null,
      },
    });

    for (const recoveryCode of recoveryCodes) {
      if (await argon2.verify(recoveryCode.codeHash, code)) {
        await this.prisma.recoveryCode.update({
          where: { id: recoveryCode.id },
          data: { usedAt: new Date() },
        });
        await this.auditLogsService.create({
          actorId: userId,
          action: 'mfa_recovery_code_use',
          entityType: 'RecoveryCode',
          entityId: recoveryCode.id,
        });
        return;
      }
    }

    throw new UnauthorizedException('Invalid step-up authentication code');
  }

  private async getLatestTotpOrThrow(userId: string) {
    const method = await this.prisma.mfaMethod.findFirst({
      where: {
        userId,
        type: MfaMethodType.TOTP,
        disabledAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!method) {
      throw new BadRequestException('No active TOTP enrollment found');
    }

    return method;
  }

  private generateRecoveryCodes() {
    return Array.from({ length: 10 }, () =>
      randomBytes(6).toString('hex').toUpperCase(),
    );
  }
}

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function toBase32(buffer: Buffer) {
  let bits = '';
  let output = '';

  for (const byte of buffer) {
    bits += byte.toString(2).padStart(8, '0');
  }

  for (let index = 0; index + 5 <= bits.length; index += 5) {
    output += BASE32_ALPHABET[Number.parseInt(bits.slice(index, index + 5), 2)];
  }

  return output;
}

function fromBase32(secret: string) {
  const cleaned = secret.replace(/=+$/g, '').toUpperCase();
  let bits = '';

  for (const character of cleaned) {
    const value = BASE32_ALPHABET.indexOf(character);

    if (value < 0) {
      throw new BadRequestException('Invalid TOTP secret');
    }

    bits += value.toString(2).padStart(5, '0');
  }

  const bytes: number[] = [];

  for (let index = 0; index + 8 <= bits.length; index += 8) {
    bytes.push(Number.parseInt(bits.slice(index, index + 8), 2));
  }

  return Buffer.from(bytes);
}

function describeDevice(userAgent?: string | null) {
  if (!userAgent) {
    return {
      deviceType: 'unknown',
      deviceName: 'Appareil inconnu',
      browser: 'Navigateur inconnu',
      label: 'Appareil inconnu · Navigateur inconnu',
    };
  }

  const normalized = userAgent.toLowerCase();
  const deviceType = normalized.includes('mobile') || normalized.includes('iphone')
    ? 'mobile'
    : normalized.includes('ipad') || normalized.includes('tablet')
      ? 'tablet'
      : 'desktop';
  const deviceName = normalized.includes('macintosh') || normalized.includes('mac os')
    ? 'MacBook'
    : normalized.includes('windows')
      ? 'PC Windows'
      : normalized.includes('iphone')
        ? 'iPhone'
        : normalized.includes('ipad')
          ? 'iPad'
          : normalized.includes('android')
            ? 'Android'
            : 'Appareil';
  const browser = normalized.includes('edg/')
    ? 'Edge'
    : normalized.includes('chrome/')
      ? 'Chrome'
      : normalized.includes('safari/') && !normalized.includes('chrome/')
        ? 'Safari'
        : normalized.includes('firefox/')
          ? 'Firefox'
          : 'Navigateur';

  return {
    deviceType,
    deviceName,
    browser,
    label: `${deviceName} · ${browser}`,
  };
}

function verifyTotpCode(secret: string, code: string) {
  const normalizedCode = code.replace(/\s/g, '');

  return [-1, 0, 1].some((windowOffset) =>
    generateTotp(secret, windowOffset) === normalizedCode,
  );
}

function generateTotp(secret: string, windowOffset: number) {
  const timeStep = Math.floor(Date.now() / 30000) + windowOffset;
  const counter = Buffer.alloc(8);
  counter.writeUInt32BE(Math.floor(timeStep / 0x100000000), 0);
  counter.writeUInt32BE(timeStep & 0xffffffff, 4);

  const hmac = createHmac('sha1', fromBase32(secret)).update(counter).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  return String(binary % 1000000).padStart(6, '0');
}
