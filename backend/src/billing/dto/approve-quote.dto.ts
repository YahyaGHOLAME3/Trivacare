import { IsOptional, IsString, Length } from 'class-validator';

export class ApproveQuoteDto {
  @IsOptional()
  @IsString()
  @Length(6, 32)
  stepUpCode?: string;
}
