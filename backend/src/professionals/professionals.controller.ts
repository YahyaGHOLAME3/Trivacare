import { Body, Controller, Get, Param, Put, Query } from '@nestjs/common';
import { Role } from '@prisma/client';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { RequestUser } from '../common/interfaces/request-user.interface';
import { UpsertProfessionalProfileDto } from './dto/upsert-professional-profile.dto';
import { ProfessionalsService } from './professionals.service';

@Controller('professionals')
@Roles(Role.PROFESSIONAL)
export class ProfessionalsController {
  constructor(private readonly professionalsService: ProfessionalsService) {}

  @Put('me')
  async upsertMe(
    @CurrentUser() user: RequestUser,
    @Body() dto: UpsertProfessionalProfileDto,
  ) {
    return this.professionalsService.upsertMe(user.userId, dto);
  }

  @Get('me')
  async getMe(@CurrentUser() user: RequestUser) {
    return this.professionalsService.getMe(user.userId);
  }

  @Get('me/dashboard')
  async getDashboard(@CurrentUser() user: RequestUser) {
    return this.professionalsService.getDashboard(user.userId);
  }

  @Get('me/appointments')
  async getMyAppointments(
    @CurrentUser() user: RequestUser,
    @Query() dto: PaginationQueryDto,
  ) {
    return this.professionalsService.getMyAppointments(user.userId, dto);
  }

  @Get('me/patients')
  async getMyPatients(
    @CurrentUser() user: RequestUser,
    @Query() dto: PaginationQueryDto,
  ) {
    return this.professionalsService.getMyPatients(user.userId, dto);
  }

  @Get('me/patient-files/:patientId')
  async getPatientFile(
    @CurrentUser() user: RequestUser,
    @Param('patientId') patientId: string,
    @Query() dto: PaginationQueryDto,
  ) {
    return this.professionalsService.getPatientFile(user.userId, patientId, dto);
  }

  @Get('me/documents')
  async getMyDocuments(
    @CurrentUser() user: RequestUser,
    @Query() dto: PaginationQueryDto,
  ) {
    return this.professionalsService.getMyDocuments(user.userId, dto);
  }

  @Get('me/notes')
  async getMyNotes(
    @CurrentUser() user: RequestUser,
    @Query() dto: PaginationQueryDto,
  ) {
    return this.professionalsService.getMyNotes(user.userId, dto);
  }
}
