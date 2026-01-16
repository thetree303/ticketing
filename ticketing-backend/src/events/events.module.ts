import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { Event, EventApproval } from './entities';
import { TicketType } from '../ticket-types/entities/ticket-type.entity';
import { User } from '../users/users.entity';
import { EventCategoriesModule } from '../event-categories/event-categories.module';
import { EventCategory } from '../event-categories/entities/event-category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Event,
      EventApproval,
      TicketType,
      User,
      EventCategory,
    ]),
    EventCategoriesModule,
  ],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
