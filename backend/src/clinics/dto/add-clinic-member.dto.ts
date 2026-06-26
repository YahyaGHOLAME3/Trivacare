import { IsEnum, IsUUID } from 'class-validator';
import { Role } from '@prisma/client';

export class AddClinicMemberDto {
  @IsUUID()
  userId!: string;

  @IsEnum(Role)
  role!: Role;
}
