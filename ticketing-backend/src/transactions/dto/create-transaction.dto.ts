import { IsNumber, IsString, IsOptional, IsEnum } from 'class-validator';
import { TransactionStatus } from '../entities/transaction.entity';

export class CreateTransactionDto {
  @IsNumber()
  orderId: number;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  providerTransactionCode?: string;

  @IsEnum(TransactionStatus)
  status?: TransactionStatus;
}
