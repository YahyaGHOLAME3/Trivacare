import {
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateClinicalNoteDto {
  @IsUUID()
  patientId!: string;

  @IsOptional()
  @IsUUID()
  careRequestId?: string;

  @IsOptional()
  @IsUUID()
  appointmentId?: string;

  @IsString()
  @MaxLength(5000)
  content!: string;
}
