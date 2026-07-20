import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { PatientsService } from '../patients/patients.service';
import { PrismaService } from '../prisma/prisma.service';
import { publicUserSelect } from '../users/user.select';
import { CreateTripDto } from './dto/create-trip.dto';
import { CreateTripStopDto } from './dto/create-trip-stop.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { UpdateTripStopDto } from './dto/update-trip-stop.dto';

@Injectable()
export class TripsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly patientsService: PatientsService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async list(userId: string) {
    const patient = await this.patientsService.getProfileByUserIdOrThrow(userId);

    return this.prisma.tripPlan.findMany({
      where: { patientId: patient.id },
      include: this.tripInclude,
      orderBy: [{ startDate: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async create(userId: string, dto: CreateTripDto) {
    const patient = await this.patientsService.getProfileByUserIdOrThrow(userId);
    const trip = await this.prisma.tripPlan.create({
      data: {
        patientId: patient.id,
        title: dto.title,
        destination: dto.destination,
        startDate: dto.startDate,
        endDate: dto.endDate,
        status: dto.status,
        notes: dto.notes,
      },
      include: this.tripInclude,
    });

    await this.auditLogsService.create({
      actorId: userId,
      action: 'trip_create',
      entityType: 'TripPlan',
      entityId: trip.id,
      metadata: { patientId: patient.id },
    });

    return trip;
  }

  async getById(userId: string, tripId: string) {
    const patient = await this.patientsService.getProfileByUserIdOrThrow(userId);
    return this.getPatientTripOrThrow(patient.id, tripId);
  }

  async update(userId: string, tripId: string, dto: UpdateTripDto) {
    const patient = await this.patientsService.getProfileByUserIdOrThrow(userId);
    await this.getPatientTripOrThrow(patient.id, tripId);

    const trip = await this.prisma.tripPlan.update({
      where: { id: tripId },
      data: {
        title: dto.title,
        destination: dto.destination,
        startDate: dto.startDate,
        endDate: dto.endDate,
        status: dto.status,
        notes: dto.notes,
      },
      include: this.tripInclude,
    });

    await this.auditLogsService.create({
      actorId: userId,
      action: 'trip_update',
      entityType: 'TripPlan',
      entityId: trip.id,
    });

    return trip;
  }

  async addStop(userId: string, tripId: string, dto: CreateTripStopDto) {
    const patient = await this.patientsService.getProfileByUserIdOrThrow(userId);
    await this.getPatientTripOrThrow(patient.id, tripId);
    await this.validateStopLinks(patient.id, dto);

    const stop = await this.prisma.$transaction(async (tx) => {
      const count = await tx.tripStop.count({ where: { tripPlanId: tripId } });
      const created = await tx.tripStop.create({
        data: {
          tripPlanId: tripId,
          clinicId: dto.clinicId,
          professionalId: dto.professionalId,
          appointmentId: dto.appointmentId,
          title: dto.title,
          location: dto.location,
          stopDate: dto.stopDate,
          position: count,
          notes: dto.notes,
        },
      });

      if (dto.position !== undefined && dto.position !== count) {
        await this.reorderStop(tx, tripId, created.id, dto.position);
      }

      return tx.tripStop.findUniqueOrThrow({
        where: { id: created.id },
        include: this.stopInclude,
      });
    });

    await this.auditLogsService.create({
      actorId: userId,
      action: 'trip_stop_create',
      entityType: 'TripStop',
      entityId: stop.id,
      metadata: { tripPlanId: tripId },
    });

    return stop;
  }

  async updateStop(
    userId: string,
    tripId: string,
    stopId: string,
    dto: UpdateTripStopDto,
  ) {
    const patient = await this.patientsService.getProfileByUserIdOrThrow(userId);
    await this.getPatientTripOrThrow(patient.id, tripId);
    const current = await this.getTripStopOrThrow(tripId, stopId);
    await this.validateStopLinks(patient.id, dto);

    const stop = await this.prisma.$transaction(async (tx) => {
      await tx.tripStop.update({
        where: { id: stopId },
        data: {
          clinicId: dto.clinicId,
          professionalId: dto.professionalId,
          appointmentId: dto.appointmentId,
          title: dto.title,
          location: dto.location,
          stopDate: dto.stopDate,
          notes: dto.notes,
        },
      });

      if (dto.position !== undefined && dto.position !== current.position) {
        await this.reorderStop(tx, tripId, stopId, dto.position);
      }

      return tx.tripStop.findUniqueOrThrow({
        where: { id: stopId },
        include: this.stopInclude,
      });
    });

    await this.auditLogsService.create({
      actorId: userId,
      action: 'trip_stop_update',
      entityType: 'TripStop',
      entityId: stop.id,
      metadata: { tripPlanId: tripId },
    });

    return stop;
  }

  async removeStop(userId: string, tripId: string, stopId: string) {
    const patient = await this.patientsService.getProfileByUserIdOrThrow(userId);
    await this.getPatientTripOrThrow(patient.id, tripId);
    await this.getTripStopOrThrow(tripId, stopId);

    await this.prisma.$transaction(async (tx) => {
      await tx.tripStop.delete({ where: { id: stopId } });
      await this.normalizePositions(tx, tripId);
    });

    await this.auditLogsService.create({
      actorId: userId,
      action: 'trip_stop_delete',
      entityType: 'TripStop',
      entityId: stopId,
      metadata: { tripPlanId: tripId },
    });

    return { message: 'Trip stop removed successfully' };
  }

  private async getPatientTripOrThrow(patientId: string, tripId: string) {
    const trip = await this.prisma.tripPlan.findFirst({
      where: {
        id: tripId,
        patientId,
      },
      include: this.tripInclude,
    });

    if (!trip) {
      throw new NotFoundException('Trip plan not found');
    }

    return trip;
  }

  private async getTripStopOrThrow(tripId: string, stopId: string) {
    const stop = await this.prisma.tripStop.findFirst({
      where: {
        id: stopId,
        tripPlanId: tripId,
      },
    });

    if (!stop) {
      throw new NotFoundException('Trip stop not found');
    }

    return stop;
  }

  private async validateStopLinks(
    patientId: string,
    dto: {
      clinicId?: string;
      professionalId?: string;
      appointmentId?: string;
    },
  ) {
    if (dto.appointmentId) {
      const appointment = await this.prisma.appointment.findUnique({
        where: { id: dto.appointmentId },
        select: { patientId: true },
      });

      if (!appointment) {
        throw new NotFoundException('Appointment not found');
      }

      if (appointment.patientId !== patientId) {
        throw new ForbiddenException('Appointment does not belong to patient');
      }
    }

    if (dto.clinicId) {
      const clinic = await this.prisma.clinic.findUnique({
        where: { id: dto.clinicId },
        select: { id: true },
      });

      if (!clinic) {
        throw new NotFoundException('Clinic not found');
      }
    }

    if (dto.professionalId) {
      const professional = await this.prisma.professionalProfile.findUnique({
        where: { id: dto.professionalId },
        select: { id: true },
      });

      if (!professional) {
        throw new NotFoundException('Professional not found');
      }
    }
  }

  private async reorderStop(
    tx: Prisma.TransactionClient,
    tripId: string,
    stopId: string,
    targetPosition: number,
  ) {
    const stops = await tx.tripStop.findMany({
      where: { tripPlanId: tripId },
      orderBy: { position: 'asc' },
    });
    const current = stops.find((stop) => stop.id === stopId);

    if (!current) {
      throw new BadRequestException('Trip stop cannot be reordered');
    }

    const reordered = stops.filter((stop) => stop.id !== stopId);
    const boundedPosition = Math.max(
      0,
      Math.min(targetPosition, reordered.length),
    );
    reordered.splice(boundedPosition, 0, current);

    await Promise.all(
      reordered.map((stop, index) =>
        tx.tripStop.update({
          where: { id: stop.id },
          data: { position: index + 10000 },
        }),
      ),
    );
    await Promise.all(
      reordered.map((stop, index) =>
        tx.tripStop.update({
          where: { id: stop.id },
          data: { position: index },
        }),
      ),
    );
  }

  private async normalizePositions(tx: Prisma.TransactionClient, tripId: string) {
    const stops = await tx.tripStop.findMany({
      where: { tripPlanId: tripId },
      orderBy: { position: 'asc' },
    });

    await Promise.all(
      stops.map((stop, index) =>
        tx.tripStop.update({
          where: { id: stop.id },
          data: { position: index + 10000 },
        }),
      ),
    );
    await Promise.all(
      stops.map((stop, index) =>
        tx.tripStop.update({
          where: { id: stop.id },
          data: { position: index },
        }),
      ),
    );
  }

  private readonly stopInclude = {
    clinic: true,
    professional: {
      include: {
        user: {
          select: publicUserSelect,
        },
      },
    },
    appointment: true,
  } as const;

  private readonly tripInclude = {
    stops: {
      include: this.stopInclude,
      orderBy: {
        position: 'asc',
      },
    },
  } as const;
}
