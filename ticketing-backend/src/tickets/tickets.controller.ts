import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { GetMyTicketsQueryDto } from './dto/get-my-tickets-query.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/dto/create-user.dto';
import { CurrentUser } from 'src/auth/decorators';
import { User } from 'src/users/users.entity';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  create(@Body() createTicketDto: CreateTicketDto) {
    return this.ticketsService.create(createTicketDto);
  }

  @Get()
  findAll() {
    return this.ticketsService.findAll();
  }

  // API lấy tất cả vé đã thanh toán của user
  @Get('my-tickets')
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN, UserRole.ORGANIZER)
  async getMyTickets(
    @CurrentUser() user: User,
    @Query() query: GetMyTicketsQueryDto,
  ) {
    return this.ticketsService.getMyTickets(user.id, query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ticketsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTicketDto: UpdateTicketDto,
  ) {
    return this.ticketsService.update(id, updateTicketDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ticketsService.remove(id);
  }

  @Post('check-in')
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  async validateTicket(
    @CurrentUser() user: User,
    @Body('code') uniqueCode: string,
  ) {
    const isAdmin = user.role === UserRole.ADMIN;
    return this.ticketsService.validateTicket(uniqueCode, user.id, isAdmin);
  }

  @Get('admin/all')
  @Roles(UserRole.ADMIN)
  async getAllForAdmin(@Query() query: GetMyTicketsQueryDto) {
    return this.ticketsService.getAllForAdmin(query);
  }
}
