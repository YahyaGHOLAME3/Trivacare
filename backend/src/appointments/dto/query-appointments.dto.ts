import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { AppointmentStatus } from '@prisma/client';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class QueryAppointmentsDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @IsOptional()
  @IsUUID()
  clinicId?: string;

  @IsOptional()
  @IsUUID()
  patientId?: string;

  @IsOptional()
  @IsUUID()
  professionalId?: string;
}
