import { IsOptional, IsString, Length } from 'class-validator';

export class StepUpDto {
  @IsOptional()
  @IsString()
  @Length(6, 32)
  stepUpCode?: string;
}
