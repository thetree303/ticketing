import { IsNumber, IsString, IsOptional, IsEnum } from 'class-validator';
import { TicketStatus } from '../entities/ticket.entity';

export class CreateTicketDto {
  @IsNumber()
  orderId: number;

  @IsNumber()
  ticketTypeId: number;

  @IsString()
  uniqueCode: string;

  @IsEnum(TicketStatus)
  @IsOptional()
  status?: TicketStatus;

  @IsOptional()
  @IsString()
  seatNumber?: string;

  @IsOptional()
  @IsString()
  checkinTime?: string;

  @IsOptional()
  @IsString()
  purchaserName?: string;

  @IsOptional()
  @IsString()
  purchaserEmail?: string;

  @IsOptional()
  @IsString()
  purchaserPhone?: string;

  @IsOptional()
  @IsNumber()
  quantity?: number;
}
