import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpsertProfessionalProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  specialty?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  licenseNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bio?: string;
}
