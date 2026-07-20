import { Type } from 'class-transformer';
import {
  IsDate,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class RescheduleAppointmentDto {
  @Type(() => Date)
  @IsDate()
  scheduledAt!: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endAt?: Date;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
