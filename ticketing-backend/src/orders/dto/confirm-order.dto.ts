import { IsString, IsOptional, IsEmail } from 'class-validator';

export class ConfirmOrderDto {
  @IsOptional()
  @IsString()
  purchaserName?: string;

  @IsOptional()
  @IsEmail()
  purchaserEmail?: string;

  @IsOptional()
  @IsString()
  purchaserPhone?: string;
}
