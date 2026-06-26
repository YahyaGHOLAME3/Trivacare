import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { Role } from '../../common/enums/role.enum';
import { RequestUser } from '../../common/interfaces/request-user.interface';

interface JwtPayload {
  userId: string;
  role: Role;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('auth.accessSecret'),
    });
  }

  validate(payload: JwtPayload): RequestUser {
    return {
      userId: payload.userId,
      role: payload.role,
    };
  }
}
