import { Controller, Get, Param, Post, Body, Delete } from '@nestjs/common';
import { EventCategoriesService } from './event-categories.service';
import { CreateEventCategoryDto } from './dto/create-event-category.dto';
import { Public, Roles } from 'src/auth/decorators';
import { UserRole } from 'src/users/dto/create-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('event-categories')
export class EventCategoriesController {
  constructor(
    private readonly eventCategoriesService: EventCategoriesService,
  ) {}

  @Get()
  @Public()
  findAll() {
    return this.eventCategoriesService.findAll();
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() data: CreateEventCategoryDto) {
    return this.eventCategoriesService.create(data);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.eventCategoriesService.findOne(+id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.eventCategoriesService.remove(+id);
  }
}
