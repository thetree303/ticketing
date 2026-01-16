import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateOrganizerBankDto {
  @IsOptional()
  @IsNumber()
  organizerId?: number;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  bankAccount?: string;
}
