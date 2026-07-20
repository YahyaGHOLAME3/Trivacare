import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../common/interfaces/request-user.interface';
import { ChangePasswordDto } from './dto/change-password.dto';
import { StepUpDto } from './dto/step-up.dto';
import { VerifyTotpDto } from './dto/verify-totp.dto';
import { SecurityService } from './security.service';

@Controller('security')
export class SecurityController {
  constructor(private readonly securityService: SecurityService) {}

  @Post('mfa/totp/enroll')
  async enrollTotp(@CurrentUser() user: RequestUser) {
    return this.securityService.enrollTotp(user);
  }

  @Post('mfa/totp/verify')
  async verifyTotp(
    @CurrentUser() user: RequestUser,
    @Body() dto: VerifyTotpDto,
  ) {
    return this.securityService.verifyTotp(user, dto.code);
  }

  @Post('mfa/disable')
  async disableMfa(@CurrentUser() user: RequestUser, @Body() dto: StepUpDto) {
    return this.securityService.disableMfa(user, dto.stepUpCode);
  }

  @Get('sessions')
  async listSessions(@CurrentUser() user: RequestUser) {
    return this.securityService.listSessions(user);
  }

  @Delete('sessions/:id')
  async revokeSession(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: StepUpDto,
  ) {
    return this.securityService.revokeSession(user, id, dto.stepUpCode);
  }

  @Post('sessions/revoke-others')
  async revokeOtherSessions(
    @CurrentUser() user: RequestUser,
    @Body() dto: StepUpDto,
  ) {
    return this.securityService.revokeOtherSessions(user, dto.stepUpCode);
  }

  @Post('password/change')
  async changePassword(
    @CurrentUser() user: RequestUser,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.securityService.changePassword(user, dto);
  }
}
