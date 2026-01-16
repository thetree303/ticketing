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
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserRole } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AdminCreateUserDto } from './dto/admin-create-user.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { PaginationResponseDto } from './dto/pagination-response.dto';
import { ValidationPipe } from '@nestjs/common';
import { User } from './users.entity';

@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  create(@Body() adminCreateUserDto: AdminCreateUserDto): Promise<User> {
    return this.usersService.adminCreate(adminCreateUserDto);
  }

  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('all')
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  findAllWithPagination(
    @Query(new ValidationPipe({ transform: true }))
    paginationQueryDto: PaginationQueryDto,
  ): Promise<PaginationResponseDto<User>> {
    return this.usersService.findAllWithPagination(paginationQueryDto);
  }

  @Roles(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.ORGANIZER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Roles(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.ORGANIZER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  @Roles(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.ORGANIZER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.usersService.remove(id);
  }

  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
  ): Promise<User> {
    return this.usersService.updateStatus(id, status);
  }

  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id/block')
  blockUser(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.usersService.blockUser(id);
  }

  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id/unblock')
  unblockUser(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.usersService.unblockUser(id);
  }

  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id/soft')
  softDelete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.usersService.softDelete(id);
  }
}
