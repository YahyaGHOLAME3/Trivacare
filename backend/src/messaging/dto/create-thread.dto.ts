import {
  ArrayUnique,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ConversationAnchorType } from '@prisma/client';

export class CreateThreadDto {
  @IsEnum(ConversationAnchorType)
  anchorType!: ConversationAnchorType;

  @IsString()
  @MaxLength(120)
  anchorId!: string;

  @IsString()
  @MaxLength(180)
  subject!: string;

  @IsOptional()
  @IsUUID()
  patientId?: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID(undefined, { each: true })
  participantUserIds?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  initialMessage?: string;
}
