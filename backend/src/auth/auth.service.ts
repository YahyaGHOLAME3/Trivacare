import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as argon2 from 'argon2';
import { Model, Types } from 'mongoose';

import { Role } from '../common/enums/role.enum';
import { durationToMilliseconds } from '../common/utils/duration.util';
import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/schemas/user.schema';
import { toPublicUser } from '../users/user.mapper';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import {
  RefreshToken,
  RefreshTokenDocument,
} from './schemas/refresh-token.schema';

interface AccessTokenPayload {
  userId: string;
  role: Role;
}

interface RefreshTokenPayload extends AccessTokenPayload {
  tokenId: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(RefreshToken.name)
    private readonly refreshTokenModel: Model<RefreshTokenDocument>,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
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
      },
    });
    const tokens = await this.issueTokens(user);

    return {
      data: {
        user: toPublicUser(user),
        tokens,
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await argon2.verify(user.passwordHash, dto.password);

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const publicUser = toPublicUser(user);
    const tokens = await this.issueTokens(user);

    return {
      data: {
        user: publicUser,
        tokens,
      },
    };
  }

  async refresh(dto: RefreshTokenDto) {
    const { refreshTokenRecord, user } = await this.validateRefreshToken(
      dto.refreshToken,
    );

    await this.refreshTokenModel
      .findByIdAndUpdate(refreshTokenRecord._id, {
        revokedAt: new Date(),
      })
      .exec();

    const publicUser = toPublicUser(user);
    const tokens = await this.issueTokens(user);

    return {
      data: {
        user: publicUser,
        tokens,
      },
    };
  }

  async logout(dto: RefreshTokenDto) {
    const { refreshTokenRecord, user } = await this.validateRefreshToken(
      dto.refreshToken,
    );

    await this.refreshTokenModel
      .findByIdAndUpdate(refreshTokenRecord._id, {
        revokedAt: new Date(),
      })
      .exec();

    return {
      message: 'Logged out successfully',
    };
  }

  async me(userId: string) {
    return this.usersService.findPublicByIdOrThrow(userId);
  }

  private async issueTokens(user: UserDocument) {
    const accessPayload: AccessTokenPayload = {
      userId: user._id.toString(),
      role: user.role,
    };

    const refreshTokenId = new Types.ObjectId();
    const refreshPayload: RefreshTokenPayload = {
      ...accessPayload,
      tokenId: refreshTokenId.toString(),
    };
    const accessExpiresInSeconds = Math.floor(
      durationToMilliseconds(
        this.configService.getOrThrow<string>('auth.accessExpiresIn'),
      ) / 1000,
    );
    const refreshExpiresIn = this.configService.getOrThrow<string>(
      'auth.refreshExpiresIn',
    );
    const refreshExpiresInSeconds = Math.floor(
      durationToMilliseconds(refreshExpiresIn) / 1000,
    );
    const refreshExpiresAt = new Date(
      Date.now() + durationToMilliseconds(refreshExpiresIn),
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

    const tokenHash = await argon2.hash(refreshToken);

    await this.refreshTokenModel.create({
      _id: refreshTokenId,
      userId: user._id,
      tokenHash,
      expiresAt: refreshExpiresAt,
    });

    return {
      accessToken,
      refreshToken,
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

    const refreshTokenRecord = await this.refreshTokenModel
      .findById(payload.tokenId)
      .exec();
    const user = await this.usersService.findById(payload.userId);

    if (
      !refreshTokenRecord ||
      !user ||
      refreshTokenRecord.userId.toString() !== payload.userId ||
      refreshTokenRecord.revokedAt ||
      refreshTokenRecord.expiresAt <= new Date()
    ) {
      throw new UnauthorizedException('Refresh token has expired or is invalid');
    }

    const matches = await argon2.verify(
      refreshTokenRecord.tokenHash,
      rawRefreshToken,
    );

    if (!matches || !user.isActive) {
      throw new UnauthorizedException('Refresh token has expired or is invalid');
    }

    return {
      refreshTokenRecord,
      user,
    };
  }
}
