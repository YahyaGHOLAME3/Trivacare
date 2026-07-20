import { Body, Controller, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { Role } from '@prisma/client';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { RequestUser } from '../common/interfaces/request-user.interface';
import { CancelAppointmentDto } from '../appointments/dto/cancel-appointment.dto';
import { RequestAppointmentDto } from '../appointments/dto/request-appointment.dto';
import { RescheduleAppointmentDto } from '../appointments/dto/reschedule-appointment.dto';
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

  @Put('me/profile')
  async updateProfile(
    @CurrentUser() user: RequestUser,
    @Body() dto: UpsertPatientProfileDto,
  ) {
    return this.patientsService.upsertMe(user.userId, dto);
  }

  @Get('me')
  async getMe(@CurrentUser() user: RequestUser) {
    return this.patientsService.getMe(user.userId);
  }

  @Get('me/profile')
  async getProfile(@CurrentUser() user: RequestUser) {
    return this.patientsService.getMe(user.userId);
  }

  @Get('me/dashboard')
  async getDashboard(@CurrentUser() user: RequestUser) {
    return this.patientsService.getDashboard(user);
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

  @Post('me/appointments/requests')
  async requestAppointment(
    @CurrentUser() user: RequestUser,
    @Body() dto: RequestAppointmentDto,
  ) {
    return this.patientsService.requestAppointment(user.userId, dto);
  }

  @Patch('me/appointments/:id/cancel')
  async cancelAppointment(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: CancelAppointmentDto,
  ) {
    return this.patientsService.cancelAppointment(user.userId, id, dto);
  }

  @Patch('me/appointments/:id/reschedule')
  async rescheduleAppointment(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: RescheduleAppointmentDto,
  ) {
    return this.patientsService.rescheduleAppointment(user.userId, id, dto);
  }

  @Get('me/documents')
  async getMyDocuments(
    @CurrentUser() user: RequestUser,
    @Query() dto: PaginationQueryDto,
  ) {
    return this.patientsService.getMyDocuments(user.userId, dto);
  }
}
