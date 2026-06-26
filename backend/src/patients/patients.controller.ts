import { Body, Controller, Get, Put, Query } from '@nestjs/common';
import { Role } from '@prisma/client';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { RequestUser } from '../common/interfaces/request-user.interface';
import { UpsertPatientProfileDto } from './dto/upsert-patient-profile.dto';
import { PatientsService } from './patients.service';

@Controller('patients')
@Roles(Role.PATIENT)
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Put('me')
  async upsertMe(
    @CurrentUser() user: RequestUser,
    @Body() dto: UpsertPatientProfileDto,
  ) {
    return this.patientsService.upsertMe(user.userId, dto);
  }

  @Get('me')
  async getMe(@CurrentUser() user: RequestUser) {
    return this.patientsService.getMe(user.userId);
  }

  @Get('me/care-requests')
  async getMyCareRequests(
    @CurrentUser() user: RequestUser,
    @Query() dto: PaginationQueryDto,
  ) {
    return this.patientsService.getMyCareRequests(user.userId, dto);
  }

  @Get('me/appointments')
  async getMyAppointments(
    @CurrentUser() user: RequestUser,
    @Query() dto: PaginationQueryDto,
  ) {
    return this.patientsService.getMyAppointments(user.userId, dto);
  }

  @Get('me/documents')
  async getMyDocuments(
    @CurrentUser() user: RequestUser,
    @Query() dto: PaginationQueryDto,
  ) {
    return this.patientsService.getMyDocuments(user.userId, dto);
  }
}
