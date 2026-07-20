import { Body, Controller, Get, Post, Req } from '@nestjs/common';

import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../common/interfaces/request-user.interface';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto, @Req() request: RequestLike) {
    return this.authService.register(dto, getRequestMetadata(request));
  }

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto, @Req() request: RequestLike) {
    return this.authService.login(dto, getRequestMetadata(request));
  }

  @Public()
  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto, @Req() request: RequestLike) {
    return this.authService.refresh(dto, getRequestMetadata(request));
  }

  @Public()
  @Post('logout')
  async logout(@Body() dto: RefreshTokenDto) {
    return this.authService.logout(dto);
  }

  @Get('me')
  async me(@CurrentUser() user: RequestUser) {
    return this.authService.me(user.userId);
  }
}

interface RequestLike {
  headers: Record<string, string | string[] | undefined>;
  ip?: string;
}

function getRequestMetadata(request: RequestLike) {
  const userAgent = request.headers['user-agent'];

  return {
    userAgent: Array.isArray(userAgent) ? userAgent.join(', ') : userAgent,
    ipAddress: request.ip,
  };
}
