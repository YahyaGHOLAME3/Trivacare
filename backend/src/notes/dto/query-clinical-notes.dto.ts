import { IsOptional, IsUUID } from 'class-validator';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class QueryClinicalNotesDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  patientId?: string;

  @IsOptional()
  @IsUUID()
  careRequestId?: string;

  @IsOptional()
  @IsUUID()
  appointmentId?: string;
}
