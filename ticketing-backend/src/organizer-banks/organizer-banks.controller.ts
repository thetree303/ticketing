import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { OrganizerBanksService } from './organizer-banks.service';
import { CreateOrganizerBankDto } from './dto/create-organizer-bank.dto';
import { UpdateOrganizerBankDto } from './dto/update-organizer-bank.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators';
import { User } from 'src/users/users.entity';

@Controller('organizer-banks')
@UseGuards(JwtAuthGuard)
export class OrganizerBanksController {
  constructor(private readonly organizerBanksService: OrganizerBanksService) {}

  @Post()
  create(
    @Body() createOrganizerBankDto: CreateOrganizerBankDto,
    @CurrentUser() user: User,
  ) {
    createOrganizerBankDto.organizerId = user.id;
    return this.organizerBanksService.create(createOrganizerBankDto);
  }

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.organizerBanksService.findByOrganizer(user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.organizerBanksService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrganizerBankDto: UpdateOrganizerBankDto,
  ) {
    return this.organizerBanksService.update(id, updateOrganizerBankDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.organizerBanksService.remove(id);
  }
}
