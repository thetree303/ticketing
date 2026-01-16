import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('event_categories')
export class EventCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;
}
