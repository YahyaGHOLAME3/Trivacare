import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @MaxLength(4000)
  body!: string;

  @IsOptional()
  attachments?: unknown;
}
