import { Type } from 'class-transformer';
import {
  IsDate,
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
  emergencyContactName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  emergencyContactPhone?: string;
}
