import {
  IsArray,
  IsDateString,
  IsEmail,
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import { Role } from '../../common/enums/role.enum';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsEnum(Role)
  role!: Role;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  organizationName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  specialty?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  licenseNumber?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

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
  @IsIn(['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'])
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
  @IsArray()
  @IsString({ each: true })
  @MaxLength(120, { each: true })
  medicalInterests?: string[];
}
