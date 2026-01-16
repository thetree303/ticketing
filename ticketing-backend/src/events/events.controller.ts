import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  ValidationPipe,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Patch,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from '../users/dto/create-user.dto';
import { CurrentUser, Public } from 'src/auth/decorators';
import { User } from '../users/users.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import type { Express } from 'express';
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('events')
@UseInterceptors(ClassSerializerInterceptor)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  // Endpoint tạo sự kiện mới bởi Organizer
  @Post()
  @Roles(UserRole.ORGANIZER)
  create(@Body() createEventDto: CreateEventDto, @CurrentUser() user: User) {
    return this.eventsService.create(user.id, createEventDto);
  }

  // Endpoint các sự kiện của chính người tổ chức đăng nhập
  @Get('my-events')
  @Roles(UserRole.ORGANIZER)
  findMyEvents(
    @CurrentUser() user: User,
    @Query(new ValidationPipe({ transform: true }))
    paginationQuery: PaginationQueryDto,
  ) {
    return this.eventsService.findAllWithPagination(
      paginationQuery,
      user.id,
      false,
      UserRole.ORGANIZER,
    );
  }

  // Endpoint các sự kiện công khai, không cần đăng nhập
  @Get()
  @Public()
  findAllWithPagination(
    @Query(new ValidationPipe({ transform: true }))
    paginationQuery: PaginationQueryDto,
  ) {
    return this.eventsService.findAllWithPagination(
      paginationQuery,
      undefined,
      false,
      UserRole.CUSTOMER,
    );
  }

  // Endpoint các sự kiện dành cho Admin
  @Get('admin')
  @Roles(UserRole.ADMIN)
  findAll(
    @Query(new ValidationPipe({ transform: true }))
    paginationQuery: PaginationQueryDto,
  ) {
    return this.eventsService.findAllWithPagination(
      paginationQuery,
      undefined,
      false,
      UserRole.ADMIN,
    );
  }

  // Endpoint lấy chi tiết sự kiện
  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.eventsService.findOne(id, user);
  }

  // Endpoint cập nhật sự kiện bởi Organizer
  @Patch(':id')
  @Roles(UserRole.ORGANIZER)
  @UseInterceptors(ClassSerializerInterceptor)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return this.eventsService.update(id, updateEventDto);
  }

  // Endpoint xóa sự kiện bởi Admin hoặc Organizer
  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.eventsService.remove(id, user);
  }

  // Endpoint gửi sự kiện để phê duyệt bởi Organizer
  @Put(':id/submit')
  @Roles(UserRole.ORGANIZER)
  submitForApproval(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    return this.eventsService.submitForApproval(id, user.id);
  }

  // Endpoint phê duyệt sự kiện bởi Admin
  @Put(':id/approve')
  @Roles(UserRole.ADMIN)
  approveEvent(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
    @Body('note') note: string,
  ) {
    return this.eventsService.approveEvent(id, user.id, note);
  }

  // Endpoint từ chối sự kiện bởi Admin
  @Put(':id/reject')
  @Roles(UserRole.ADMIN)
  rejectEvent(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
    @Body('reason') reason: string,
  ) {
    return this.eventsService.rejectEvent(id, user.id, reason);
  }

  // Endpoint hủy sự kiện bởi Organizer
  @Put(':id/cancel')
  @Roles(UserRole.ORGANIZER)
  cancelEvent(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.cancelEvent(id);
  }
}
