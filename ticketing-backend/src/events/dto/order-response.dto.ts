import { OrderStatus } from 'src/orders/entities';

export class OrderResponseDto {
  id: number;
  status: OrderStatus;
  customerId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventId: number;
  eventTitle: string;
  ticketTypeId: number | null;
  ticketTypeName: string | null;
  totalAmount: number;
  createdAt: Date;
}
