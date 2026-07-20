import { IsDefined, IsOptional, IsString, MaxLength } from 'class-validator';

export class ProviderEventDto {
  @IsString()
  @MaxLength(80)
  provider!: string;

  @IsString()
  @MaxLength(160)
  providerEventId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  providerIntentId?: string;

  @IsDefined()
  payload!: unknown;
}
