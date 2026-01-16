import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/users.entity';
import { Event } from '../../events/entities/event.entity';

export enum PayoutStatus {
  Processing = 'Processing',
  Completed = 'Completed',
  Failed = 'Failed',
}

@Entity('payouts')
export class Payout {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'organizer_id' })
  organizer: User;

  @Column({ name: 'organizer_id' })
  organizerId: number;

  @ManyToOne(() => Event)
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @Column({ nullable: true, name: 'event_id' })
  eventId: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, name: 'total_revenue' })
  totalRevenue: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, name: 'platform_fee' })
  platformFee: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, name: 'net_amount' })
  netAmount: number;

  @Column({ length: 100, nullable: true, name: 'reference_code' })
  referenceCode: string;

  @Column({
    type: 'enum',
    enum: PayoutStatus,
    default: PayoutStatus.Processing,
  })
  status: PayoutStatus;

  @Column({ type: 'timestamp', nullable: true, name: 'payout_date' })
  payoutDate: Date;
}
