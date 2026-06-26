import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { Role } from '@prisma/client';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RequestUser } from '../common/interfaces/request-user.interface';
import { AssignCareRequestClinicDto } from './dto/assign-care-request-clinic.dto';
import { AssignCareRequestProfessionalDto } from './dto/assign-care-request-professional.dto';
import { CreateCareRequestDto } from './dto/create-care-request.dto';
import { UpdateCareRequestStatusDto } from './dto/update-care-request-status.dto';
import { CareRequestsService } from './care-requests.service';

@Controller('care-requests')
export class CareRequestsController {
  constructor(private readonly careRequestsService: CareRequestsService) {}

  @Post()
  @Roles(Role.PATIENT)
  async create(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateCareRequestDto,
  ) {
    return this.careRequestsService.create(user, dto);
  }

  @Patch(':id/status')
  @Roles(Role.CLINIC_ADMIN, Role.SUPER_ADMIN)
  async updateStatus(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: UpdateCareRequestStatusDto,
  ) {
    return this.careRequestsService.updateStatus(user, id, dto);
  }

  @Patch(':id/assign-clinic')
  @Roles(Role.CLINIC_ADMIN, Role.SUPER_ADMIN)
  async assignClinic(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: AssignCareRequestClinicDto,
  ) {
    return this.careRequestsService.assignClinic(user, id, dto);
  }

  @Patch(':id/assign-professional')
  @Roles(Role.CLINIC_ADMIN, Role.SUPER_ADMIN)
  async assignProfessional(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: AssignCareRequestProfessionalDto,
  ) {
    return this.careRequestsService.assignProfessional(user, id, dto);
  }
}
