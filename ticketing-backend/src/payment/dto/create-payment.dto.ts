import { IsString, IsNumber, IsOptional, IsEmail } from 'class-validator';

export class CreatePaymentDto {
  @IsNumber()
  orderId: number;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  orderInfo?: string;

  @IsOptional()
  @IsString()
  returnUrl?: string;

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
