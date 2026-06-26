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
import { RequestUser } from '../common/interfaces/request-user.interface';
import { AppointmentsService } from './appointments.service';
import { CancelAppointmentDto } from './dto/cancel-appointment.dto';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { QueryAppointmentsDto } from './dto/query-appointments.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  async list(@CurrentUser() user: RequestUser, @Query() dto: QueryAppointmentsDto) {
    return this.appointmentsService.list(user, dto);
  }

  @Post()
  @Roles(Role.CLINIC_ADMIN, Role.PROFESSIONAL, Role.SUPER_ADMIN)
  async create(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateAppointmentDto,
  ) {
    return this.appointmentsService.create(user, dto);
  }

  @Patch(':id')
  @Roles(Role.CLINIC_ADMIN, Role.PROFESSIONAL, Role.SUPER_ADMIN)
  async update(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentDto,
  ) {
    return this.appointmentsService.update(user, id, dto);
  }

  @Patch(':id/cancel')
  @Roles(Role.CLINIC_ADMIN, Role.PROFESSIONAL, Role.SUPER_ADMIN)
  async cancel(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: CancelAppointmentDto,
  ) {
    return this.appointmentsService.cancel(user, id, dto);
  }
}
