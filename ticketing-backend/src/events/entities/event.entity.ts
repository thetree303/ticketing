import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { User } from '../../users/users.entity';
import { EventCategory } from '../../event-categories/entities/event-category.entity';
import { TicketType } from '../../ticket-types/entities/ticket-type.entity';
import { EventApproval } from '../../events/entities/event-approval.entity';
import { Order } from '../../orders/entities/order.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';

export enum EventStatus {
  DRAFT = 'Draft', // Nháp (Chưa gửi Admin duyệt)
  PENDING = 'Pending', // Chờ Admin duyệt
  PUBLISHED = 'Published', // Đã duyệt & Công khai (theo Slide 20)
  UNPUBLISHED = 'Unpublished', // Admin duyệt nhưng chưa đến ngày mở bán (Optional)
  REJECTED = 'Rejected', // Bị từ chối
  ENDED = 'Ended', // Kết thúc
  CANCELLED = 'Cancelled', // Hủy
}

@Entity('events')
@Index(['organizerId'])
@Index(['startTime'])
@Index(['status'])
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'organizer_id' })
  organizer: User;

  @Column({ name: 'organizer_id' })
  organizerId: number;

  @ManyToOne(() => EventCategory)
  @JoinColumn({ name: 'category_id' })
  category: EventCategory;

  @OneToMany(() => Ticket, (ticket) => ticket.event)
  tickets: Ticket[];

  @Column({ nullable: true, name: 'category_id' })
  categoryId: number;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true, name: 'banner_url' })
  bannerUrl: string;

  @Column({ length: 200, nullable: true, name: 'venue_name' })
  venueName: string;

  @Column({ length: 300, nullable: true })
  address: string;

  @Column({ length: 100, nullable: true })
  city: string;

  @Column({ type: 'int', nullable: true })
  capacity: number;

  @Column({ type: 'timestamp', name: 'start_time' })
  startTime: Date;

  @Column({ type: 'timestamp', name: 'end_time' })
  endTime: Date;

  @Column({
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.DRAFT,
  })
  status: EventStatus;

  @Column({ type: 'timestamp', nullable: true, name: 'release_date' })
  releaseDate: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'closing_date' })
  closingDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    name: 'min_price',
    default: 0,
  })
  minPrice: number;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    name: 'max_price',
    default: 0,
  })
  maxPrice: number;

  @OneToMany(() => TicketType, (ticketType) => ticketType.event)
  ticketTypes: TicketType[];

  @OneToMany(() => EventApproval, (eventApproval) => eventApproval.event)
  eventApprovals: EventApproval[];

  @OneToMany(() => Order, (order) => order.event)
  orders: Order[];
}
