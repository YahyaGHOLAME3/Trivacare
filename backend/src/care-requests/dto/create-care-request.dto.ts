import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { CareRequestStatus } from '@prisma/client';

export class CreateCareRequestDto {
  @IsString()
  @MaxLength(160)
  title!: string;

  @IsString()
  @MaxLength(2000)
  description!: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  preferredDate?: Date;

  @IsOptional()
  @IsEnum(CareRequestStatus)
  status?: CareRequestStatus;
}
