import { Type } from 'class-transformer';
import {
  IsDate,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpsertPatientProfileDto {
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateOfBirth?: Date;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  gender?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  nationality?: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  insurer?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  bloodType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  medicalSummary?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  emergencyContactName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  emergencyContactPhone?: string;

  @IsOptional()
  @IsObject()
  notificationPreferences?: Record<string, boolean>;
}
