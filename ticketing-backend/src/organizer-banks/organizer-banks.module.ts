import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizerBanksService } from './organizer-banks.service';
import { OrganizerBanksController } from './organizer-banks.controller';
import { OrganizerBank } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([OrganizerBank])],
  controllers: [OrganizerBanksController],
  providers: [OrganizerBanksService],
  exports: [OrganizerBanksService],
})
export class OrganizerBanksModule {}
