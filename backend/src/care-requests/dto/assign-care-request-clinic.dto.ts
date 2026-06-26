import { IsUUID } from 'class-validator';

export class AssignCareRequestClinicDto {
  @IsUUID()
  clinicId!: string;
}
