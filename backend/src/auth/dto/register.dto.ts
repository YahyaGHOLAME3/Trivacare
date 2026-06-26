import {
  IsEmail,
  IsEnum,
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
}
