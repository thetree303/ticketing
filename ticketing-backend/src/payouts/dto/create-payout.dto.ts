import { IsNumber, IsString, IsOptional, IsEnum } from 'class-validator';
import { PayoutStatus } from '../entities/payout.entity';

export class CreatePayoutDto {
  @IsNumber()
  organizerId: number;

  @IsOptional()
  @IsNumber()
  eventId?: number;

  @IsNumber()
  totalRevenue: number;

  @IsNumber()
  platformFee: number;

  @IsNumber()
  netAmount: number;

  @IsOptional()
  @IsString()
  referenceCode?: string;

  @IsEnum(PayoutStatus)
  status?: PayoutStatus;

  @IsOptional()
  @IsString()
  payoutDate?: string;
}
