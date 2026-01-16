import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/users.entity';

@Entity('organizer_banks')
export class OrganizerBank {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'organizer_id' })
  organizer: User;

  @Column({ name: 'organizer_id' })
  organizerId: number;

  @Column({ length: 100, nullable: true, name: 'bank_name' })
  bankName: string;

  @Column({ length: 100, nullable: true, name: 'bank_account' })
  bankAccount: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
