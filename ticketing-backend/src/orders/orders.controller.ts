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
  Query,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderRequestDto } from './dto/create-order-request.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ConfirmOrderDto } from './dto/confirm-order.dto';
import { GetMyOrdersQueryDto } from './dto/get-my-orders-query.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/dto/create-user.dto';
import { JwtAuthGuard } from 'src/auth/guards';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CurrentUser } from 'src/auth/decorators';
import { User } from 'src/users/users.entity';
import { Order } from './entities/order.entity';
import { PaginationResponseDto } from '../events/dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles(UserRole.CUSTOMER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  create(
    @CurrentUser('id') userId: number,
    @Body() createOrderDto: CreateOrderRequestDto,
  ): Promise<Order | null> {
    return this.ordersService.create(userId, createOrderDto);
  }

  @Post(':id/confirm')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.CUSTOMER)
  confirm(
    @Param('id', ParseIntPipe) id: number,
    @Body() confirmOrderDto: ConfirmOrderDto,
  ): Promise<Order> {
    return this.ordersService.confirmOrder(id, confirmOrderDto);
  }

  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.CUSTOMER)
  cancel(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ): Promise<Order> {
    return this.ordersService.cancelOrder(id, userId);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  findAll(
    @CurrentUser() user: User,
    @Query() query: GetMyOrdersQueryDto,
  ): Promise<PaginationResponseDto<Order>> {
    if (user.role === UserRole.CUSTOMER) {
      return this.ordersService.findByCustomerPaginated(user.id, query);
    } else {
      return this.ordersService.getAllWithPagination(query);
    }
  }

  @Get('my-orders')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  findMyOrders(
    @CurrentUser() user: User,
    @Query() query: GetMyOrdersQueryDto,
  ): Promise<PaginationResponseDto<Order>> {
    return this.ordersService.findByCustomerPaginated(user.id, query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Order> {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<Order> {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.ordersService.remove(id);
  }

  @Get('admin/all')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getAllForAdmin(
    @Query() query: GetMyOrdersQueryDto,
  ): Promise<PaginationResponseDto<Order>> {
    return this.ordersService.getAllWithPagination(query);
  }
}
