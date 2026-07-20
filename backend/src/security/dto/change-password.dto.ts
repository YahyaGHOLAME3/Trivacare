import { IsOptional, IsString, Length, MaxLength, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  currentPassword!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  newPassword!: string;

  @IsOptional()
  @IsString()
  @Length(6, 32)
  stepUpCode?: string;
}
