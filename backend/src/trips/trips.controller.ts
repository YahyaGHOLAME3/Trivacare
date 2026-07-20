import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Role } from '@prisma/client';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RequestUser } from '../common/interfaces/request-user.interface';
import { CreateTripDto } from './dto/create-trip.dto';
import { CreateTripStopDto } from './dto/create-trip-stop.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { UpdateTripStopDto } from './dto/update-trip-stop.dto';
import { TripsService } from './trips.service';

@Controller('patients/me/trips')
@Roles(Role.PATIENT)
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Get()
  async list(@CurrentUser() user: RequestUser) {
    return this.tripsService.list(user.userId);
  }

  @Post()
  async create(@CurrentUser() user: RequestUser, @Body() dto: CreateTripDto) {
    return this.tripsService.create(user.userId, dto);
  }

  @Get(':id')
  async getById(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.tripsService.getById(user.userId, id);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: UpdateTripDto,
  ) {
    return this.tripsService.update(user.userId, id, dto);
  }

  @Post(':id/stops')
  async addStop(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: CreateTripStopDto,
  ) {
    return this.tripsService.addStop(user.userId, id, dto);
  }

  @Patch(':id/stops/:stopId')
  async updateStop(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Param('stopId') stopId: string,
    @Body() dto: UpdateTripStopDto,
  ) {
    return this.tripsService.updateStop(user.userId, id, stopId, dto);
  }

  @Delete(':id/stops/:stopId')
  async removeStop(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Param('stopId') stopId: string,
  ) {
    return this.tripsService.removeStop(user.userId, id, stopId);
  }
}
