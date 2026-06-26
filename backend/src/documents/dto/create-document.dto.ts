import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateDocumentDto {
  @IsUUID()
  patientId!: string;

  @IsOptional()
  @IsUUID()
  careRequestId?: string;

  @IsString()
  @MaxLength(255)
  fileName!: string;

  @IsString()
  @MaxLength(150)
  mimeType!: string;

  @IsInt()
  @Min(1)
  fileSize!: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  storageKey?: string;

  @IsString()
  @MaxLength(100)
  documentType!: string;
}
