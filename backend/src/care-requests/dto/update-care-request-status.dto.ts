import { IsEnum } from 'class-validator';
import { CareRequestStatus } from '@prisma/client';

export class UpdateCareRequestStatusDto {
  @IsEnum(CareRequestStatus)
  status!: CareRequestStatus;
}
