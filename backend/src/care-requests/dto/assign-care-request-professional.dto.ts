import { IsUUID } from 'class-validator';

export class AssignCareRequestProfessionalDto {
  @IsUUID()
  professionalId!: string;
}
