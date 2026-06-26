import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Role } from '@prisma/client';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { RequestUser } from '../common/interfaces/request-user.interface';
import { AddClinicMemberDto } from './dto/add-clinic-member.dto';
import { CreateClinicDto } from './dto/create-clinic.dto';
import { UpdateClinicDto } from './dto/update-clinic.dto';
import { ClinicsService } from './clinics.service';

@Controller('clinics')
export class ClinicsController {
  constructor(private readonly clinicsService: ClinicsService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN)
  async create(@Body() dto: CreateClinicDto) {
    return this.clinicsService.create(dto);
  }

  @Get(':id')
  @Roles(Role.CLINIC_ADMIN, Role.SUPER_ADMIN)
  async getById(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.clinicsService.getById(user, id);
  }

  @Patch(':id')
  @Roles(Role.CLINIC_ADMIN, Role.SUPER_ADMIN)
  async update(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: UpdateClinicDto,
  ) {
    return this.clinicsService.update(user, id, dto);
  }

  @Post(':id/members')
  @Roles(Role.CLINIC_ADMIN, Role.SUPER_ADMIN)
  async addMember(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: AddClinicMemberDto,
  ) {
    return this.clinicsService.addMember(user, id, dto);
  }

  @Get(':id/care-requests')
  @Roles(Role.CLINIC_ADMIN, Role.SUPER_ADMIN)
  async listCareRequests(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Query() dto: PaginationQueryDto,
  ) {
    return this.clinicsService.listCareRequests(user, id, dto);
  }

  @Get(':id/appointments')
  @Roles(Role.CLINIC_ADMIN, Role.SUPER_ADMIN)
  async listAppointments(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Query() dto: PaginationQueryDto,
  ) {
    return this.clinicsService.listAppointments(user, id, dto);
  }
}
