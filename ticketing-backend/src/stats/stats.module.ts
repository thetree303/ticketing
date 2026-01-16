import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { Event } from '../events/entities/event.entity';
import { Order } from '../orders/entities/order.entity';
import { User } from '../users/users.entity';
import { TicketType } from 'src/ticket-types/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Event, Order, User, TicketType])],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
