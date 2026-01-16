import { IsNumber, IsEnum } from 'class-validator';
import { OrderStatus } from '../entities/order.entity';

export class CreateOrderDto {
  @IsNumber()
  customerId: number;

  @IsNumber()
  eventId: number;

  @IsNumber()
  totalAmount: number;

  @IsEnum(OrderStatus)
  status?: OrderStatus;
}
