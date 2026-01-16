import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { TicketType } from '../../ticket-types/entities/ticket-type.entity';
import { Event } from '../../events/entities/event.entity';

export enum TicketStatus {
  Available = 'Available',
  Reserved = 'Reserved',
  Active = 'Active',
  Used = 'Used',
  Cancelled = 'Cancelled',
  Expired = 'Expired',
  Refunded = 'Refunded',
  Blocked = 'Blocked',
}

@Entity('tickets')
@Index(['status'])
@Index(['orderId'])
@Index(['ticketTypeId'])
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'order_id' })
  orderId: number;

  @ManyToOne(() => TicketType)
  @JoinColumn({ name: 'ticket_type_id' })
  ticketType: TicketType;

  @ManyToOne(() => Event)
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @Column({ name: 'event_id' })
  eventId: number;

  @Column({ name: 'ticket_type_id' })
  ticketTypeId: number;

  @Index({ unique: true })
  @Column({ length: 200, name: 'unique_code', unique: true })
  uniqueCode: string;

  @Column({
    type: 'enum',
    enum: TicketStatus,
    default: TicketStatus.Active,
  })
  status: TicketStatus;

  @Column({ length: 50, nullable: true, name: 'seat_number' })
  seatNumber: string;

  @Column({ type: 'timestamp', nullable: true, name: 'checkin_time' })
  checkinTime: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'purchased_at' })
  purchasedAt: Date;

  @Column({ length: 200, nullable: true, name: 'purchaser_name' })
  purchaserName: string;

  @Column({ length: 200, nullable: true, name: 'purchaser_email' })
  purchaserEmail: string;

  @Column({ length: 50, nullable: true, name: 'purchaser_phone' })
  purchaserPhone: string;
}
