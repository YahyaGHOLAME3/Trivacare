import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsUUID, Length, MaxLength, Min } from 'class-validator';

export class CreatePaymentIntentDto {
  @IsOptional()
  @IsUUID()
  invoiceId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  amount?: number;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  provider?: string;

  @IsOptional()
  @IsString()
  @Length(6, 32)
  stepUpCode?: string;
}
