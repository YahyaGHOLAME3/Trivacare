import { IsString, MaxLength } from 'class-validator';

export class UpdateClinicalNoteDto {
  @IsString()
  @MaxLength(5000)
  content!: string;
}
