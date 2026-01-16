import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Event } from './event.entity';
import { User } from '../../users/users.entity';

export enum ApprovalStatus {
  Approved = 'Approved',
  Rejected = 'Rejected',
}

@Entity('event_approvals')
export class EventApproval {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Event, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @Column({ name: 'event_id' })
  eventId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'admin_id' })
  admin: User;

  @Column({ nullable: true, name: 'admin_id' })
  adminId: number;

  @Column({
    type: 'enum',
    enum: ApprovalStatus,
  })
  status: ApprovalStatus;

  @Column({ type: 'text', nullable: true })
  note: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
