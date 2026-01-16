import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateTicketTypeDto {
  @IsNumber()
  eventId: number;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsNumber()
  maxPerOrder?: number;

  @IsOptional()
  @IsNumber()
  numPerOrder?: number;

  @IsNumber()
  initialQuantity: number;
}
