import { IsNumber, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsNumber()
  ticketTypeId: number;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateOrderRequestDto {
  @IsNumber()
  eventId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
